using InvitationPlatform.Application.Common;
using InvitationPlatform.Application.Common.Interfaces;
using InvitationPlatform.Domain.Entities;
using InvitationPlatform.Domain.Enums;
using InvitationPlatform.Infrastructure.Persistence;
using InvitationPlatform.Infrastructure.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;

namespace InvitationPlatform.Api.Controllers;

[ApiController]
[Route("api/v1/events/{eventId:guid}/media")]
[Authorize]
public class MediaController(
    ApplicationDbContext db,
    ITenantContext tenantContext,
    IFileStorageService fileStorage,
    IFeatureEntitlementService entitlements) : ControllerBase
{
    private static readonly HashSet<string> AllowedImageTypes = ["image/jpeg", "image/png", "image/webp"];
    private static readonly HashSet<string> AllowedVideoTypes = ["video/mp4", "video/webm", "video/quicktime"];
    private static readonly HashSet<string> AllowedAudioTypes = ["audio/mpeg", "audio/mp3", "audio/wav"];
    private const long MaxImageSize = 10 * 1024 * 1024; // 10 MB
    private const long MaxVideoSize = 100 * 1024 * 1024; // 100 MB
    private const long MaxPdfSize = 20 * 1024 * 1024; // 20 MB
    private const long MaxAudioSize = 20 * 1024 * 1024; // 20 MB

    [HttpGet]
    public async Task<IActionResult> GetAll(Guid eventId, [FromQuery] string? source = null)
    {
        if (tenantContext.TenantId is null) return Forbid();

        var query = db.MediaFiles
            .Where(m => m.TenantId == tenantContext.TenantId && m.EventId == eventId);

        if (string.Equals(source, "guest", StringComparison.OrdinalIgnoreCase))
            query = query.Where(m => m.IsGuestUpload);
        else if (string.Equals(source, "owner", StringComparison.OrdinalIgnoreCase))
            query = query.Where(m => !m.IsGuestUpload);

        var media = await query
            .OrderByDescending(m => m.CreatedAt)
            .Select(m => new
            {
                m.Id,
                m.OriginalFileName,
                m.ContentType,
                m.FileSizeBytes,
                MediaType = m.MediaType.ToString(),
                m.AltText,
                m.SortOrder,
                m.IsGuestUpload,
                m.IsModerated,
                m.IsFlagged,
                m.GuestDisplayName,
                Url = fileStorage.GetFileUrl(m.StoredFileName),
                ThumbnailUrl = m.ThumbnailFileName != null ? fileStorage.GetFileUrl(m.ThumbnailFileName) : null,
                m.CreatedAt
            })
            .ToListAsync();

        return Ok(media);
    }

    [HttpGet("guest-photos/zip")]
    public async Task<IActionResult> DownloadGuestPhotosZip(Guid eventId)
    {
        if (tenantContext.TenantId is null) return Forbid();
        var tenantId = tenantContext.TenantId.Value;

        try
        {
            await entitlements.EnsureBooleanFeatureAsync(tenantId, eventId, "guest_photo_uploads");
        }
        catch (EntitlementException ex)
        {
            return StatusCode(StatusCodes.Status403Forbidden, new ProblemDetails
            {
                Title = ex.Message,
                Status = StatusCodes.Status403Forbidden
            });
        }

        var photos = await db.MediaFiles
            .Where(m => m.TenantId == tenantId && m.EventId == eventId && m.IsGuestUpload && !m.IsFlagged)
            .OrderBy(m => m.CreatedAt)
            .ToListAsync();

        if (photos.Count == 0)
            return NotFound(new { title = "No guest photos to download." });

        var ms = new MemoryStream();
        using (var archive = new System.IO.Compression.ZipArchive(ms, System.IO.Compression.ZipArchiveMode.Create, leaveOpen: true))
        {
            foreach (var photo in photos)
            {
                await using var fileStream = fileStorage.OpenRead(photo.StoredFileName);
                if (fileStream is null) continue;
                var entryName = $"{photo.CreatedAt:yyyyMMdd-HHmmss}_{SanitizeFileName(photo.OriginalFileName)}";
                var entry = archive.CreateEntry(entryName, System.IO.Compression.CompressionLevel.Fastest);
                await using var entryStream = entry.Open();
                await fileStream.CopyToAsync(entryStream);
            }
        }

        ms.Position = 0;
        return File(ms.ToArray(), "application/zip", $"guest-photos-{eventId:N}.zip");
    }

    private static string SanitizeFileName(string name)
    {
        foreach (var c in Path.GetInvalidFileNameChars())
            name = name.Replace(c, '_');
        return string.IsNullOrWhiteSpace(name) ? "photo.jpg" : name;
    }

    [HttpPost("{mediaId:guid}/approve")]
    public async Task<IActionResult> ApproveGuestPhoto(Guid eventId, Guid mediaId)
    {
        if (tenantContext.TenantId is null) return Forbid();
        var media = await db.MediaFiles.FirstOrDefaultAsync(m =>
            m.Id == mediaId && m.EventId == eventId && m.TenantId == tenantContext.TenantId && m.IsGuestUpload);
        if (media is null) return NotFound();
        media.IsModerated = true;
        media.IsFlagged = false;
        await db.SaveChangesAsync();
        return Ok(new { media.Id, media.IsModerated, media.IsFlagged });
    }

    [HttpPost("{mediaId:guid}/reject")]
    public async Task<IActionResult> RejectGuestPhoto(Guid eventId, Guid mediaId)
    {
        if (tenantContext.TenantId is null) return Forbid();
        var media = await db.MediaFiles.FirstOrDefaultAsync(m =>
            m.Id == mediaId && m.EventId == eventId && m.TenantId == tenantContext.TenantId && m.IsGuestUpload);
        if (media is null) return NotFound();
        media.IsFlagged = true;
        media.IsModerated = false;
        await db.SaveChangesAsync();
        return Ok(new { media.Id, media.IsModerated, media.IsFlagged });
    }

    [HttpPost]
    [RequestSizeLimit(MaxVideoSize)]
    [RequestFormLimits(MultipartBodyLengthLimit = MaxVideoSize)]
    [EnableRateLimiting("upload")]
    public async Task<IActionResult> Upload(Guid eventId, IFormFile file, [FromQuery] int? sortOrder = null)
    {
        if (tenantContext.TenantId is null) return Forbid();
        var tenantId = tenantContext.TenantId.Value;

        var eventExists = await db.Events
            .AnyAsync(e => e.Id == eventId && e.TenantId == tenantId);
        if (!eventExists) return NotFound(new { message = "Event not found" });

        if (file.Length == 0) return BadRequest(new { message = "Empty file" });

        var isImage = AllowedImageTypes.Contains(file.ContentType);
        var isVideo = AllowedVideoTypes.Contains(file.ContentType);
        var isPdf = file.ContentType == "application/pdf";
        var isAudio = AllowedAudioTypes.Contains(file.ContentType);

        if (!isImage && !isVideo && !isPdf && !isAudio)
            return BadRequest(new { message = "Unsupported file type" });

        if (isImage && file.Length > MaxImageSize)
            return BadRequest(new { message = "Image too large (max 10 MB)" });
        if (isVideo && file.Length > MaxVideoSize)
            return BadRequest(new { message = "Video too large (max 100 MB)" });
        if (isPdf && file.Length > MaxPdfSize)
            return BadRequest(new { message = "PDF too large (max 20 MB)" });
        if (isAudio && file.Length > MaxAudioSize)
            return BadRequest(new { message = "Audio too large (max 20 MB)" });

        try
        {
            if (isImage)
            {
                var imageCount = await db.MediaFiles.CountAsync(m =>
                    m.EventId == eventId && m.TenantId == tenantId
                    && m.MediaType == MediaType.Image && !m.IsGuestUpload);
                await entitlements.EnsureWithinIntegerLimitAsync(tenantId, eventId, "max_photos", imageCount);
            }
            else if (isVideo)
            {
                await entitlements.EnsureBooleanFeatureAsync(tenantId, eventId, "video_section");
            }
            else if (isPdf)
            {
                await entitlements.EnsureBooleanFeatureAsync(tenantId, eventId, "printable_upload");
            }
            else if (isAudio)
            {
                await entitlements.EnsureBooleanFeatureAsync(tenantId, eventId, "background_audio");
            }
        }
        catch (EntitlementException ex)
        {
            return StatusCode(StatusCodes.Status403Forbidden, new ProblemDetails
            {
                Title = ex.Message,
                Status = StatusCodes.Status403Forbidden
            });
        }

        var mediaType = isImage ? MediaType.Image
            : isVideo ? MediaType.Video
            : isPdf ? MediaType.Pdf
            : MediaType.Audio;

        var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (string.IsNullOrEmpty(extension))
        {
            extension = mediaType switch
            {
                MediaType.Image => ".jpg",
                MediaType.Video => ".mp4",
                MediaType.Pdf => ".pdf",
                _ => ".mp3"
            };
        }

        var folder = mediaType switch
        {
            MediaType.Image => "images",
            MediaType.Video => "videos",
            MediaType.Pdf => "pdfs",
            _ => "audio"
        };

        using var stream = file.OpenReadStream();
        var storedPath = await fileStorage.SaveFileAsync(tenantId, eventId, folder, stream, extension);

        string? thumbPath = null;
        if (isImage)
            thumbPath = await fileStorage.GenerateThumbnailAsync(tenantId, eventId, storedPath);

        // Replacing a template image slot: free that sortOrder for owner images
        if (isImage && sortOrder.HasValue)
        {
            var previous = await db.MediaFiles
                .Where(m => m.EventId == eventId
                            && m.TenantId == tenantId
                            && !m.IsGuestUpload
                            && m.MediaType == MediaType.Image
                            && m.SortOrder == sortOrder.Value)
                .ToListAsync();
            foreach (var old in previous)
            {
                old.SortOrder = 1000 + old.SortOrder;
            }
        }

        var mediaFile = new MediaFile
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            EventId = eventId,
            MediaType = mediaType,
            OriginalFileName = file.FileName,
            StoredFileName = storedPath,
            ContentType = file.ContentType,
            FileSizeBytes = file.Length,
            ThumbnailFileName = thumbPath,
            SortOrder = sortOrder ?? await db.MediaFiles.CountAsync(m => m.EventId == eventId)
        };

        db.MediaFiles.Add(mediaFile);

        // Slot 0 doubles as the event cover for wedding templates
        if (isImage && sortOrder == 0)
        {
            var evt = await db.Events.FirstOrDefaultAsync(e => e.Id == eventId && e.TenantId == tenantId);
            if (evt is not null)
                evt.CoverImageUrl = storedPath;
        }

        await db.SaveChangesAsync();

        return Ok(new
        {
            mediaFile.Id,
            mediaFile.OriginalFileName,
            mediaFile.ContentType,
            mediaFile.FileSizeBytes,
            MediaType = mediaFile.MediaType.ToString(),
            mediaFile.SortOrder,
            Url = fileStorage.GetFileUrl(storedPath),
            ThumbnailUrl = thumbPath != null ? fileStorage.GetFileUrl(thumbPath) : null,
            mediaFile.CreatedAt
        });
    }

    [HttpDelete("{mediaId:guid}")]
    public async Task<IActionResult> Delete(Guid eventId, Guid mediaId)
    {
        if (tenantContext.TenantId is null) return Forbid();

        var media = await db.MediaFiles
            .FirstOrDefaultAsync(m => m.Id == mediaId
                                      && m.EventId == eventId
                                      && m.TenantId == tenantContext.TenantId);

        if (media is null) return NotFound();

        await fileStorage.DeleteFileAsync(media.StoredFileName);
        if (media.ThumbnailFileName != null)
            await fileStorage.DeleteFileAsync(media.ThumbnailFileName);

        db.MediaFiles.Remove(media);
        await db.SaveChangesAsync();

        return NoContent();
    }

    [HttpPut("{mediaId:guid}")]
    public async Task<IActionResult> Update(Guid eventId, Guid mediaId, [FromBody] UpdateMediaRequest request)
    {
        if (tenantContext.TenantId is null) return Forbid();

        var media = await db.MediaFiles
            .FirstOrDefaultAsync(m => m.Id == mediaId
                                      && m.EventId == eventId
                                      && m.TenantId == tenantContext.TenantId);

        if (media is null) return NotFound();

        if (request.AltText is not null) media.AltText = request.AltText;
        if (request.SortOrder.HasValue) media.SortOrder = request.SortOrder.Value;

        await db.SaveChangesAsync();
        return Ok(new { media.Id, media.AltText, media.SortOrder });
    }

    public record UpdateMediaRequest(string? AltText, int? SortOrder);
}
