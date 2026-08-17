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

/// <summary>Public guest photo upload (QR → /e/{slug}/upload).</summary>
[ApiController]
[Route("api/v1/public/invitations/{slug}")]
[AllowAnonymous]
public class PublicGuestMediaController(
    ApplicationDbContext db,
    IFileStorageService fileStorage,
    IFeatureEntitlementService entitlements) : ControllerBase
{
    private static readonly HashSet<string> AllowedImageTypes = ["image/jpeg", "image/png", "image/webp"];
    private const long MaxImageSize = 10 * 1024 * 1024;
    private const int MaxGuestPhotosPerEvent = 500;

    [HttpGet("guest-upload")]
    public async Task<IActionResult> GetUploadInfo(string slug)
    {
        var evt = await db.Events
            .AsNoTracking()
            .FirstOrDefaultAsync(e => e.Slug == slug && e.Status == EventStatus.Published);
        if (evt is null) return NotFound(new { title = "Event not found." });

        var enabled = await entitlements.HasBooleanFeatureAsync(evt.TenantId, evt.Id, "guest_photo_uploads");
        return Ok(new
        {
            enabled,
            evt.Title,
            evt.EventDate,
            evt.Slug
        });
    }

    [HttpPost("guest-photos")]
    [RequestSizeLimit(MaxImageSize)]
    [RequestFormLimits(MultipartBodyLengthLimit = MaxImageSize)]
    [EnableRateLimiting("upload")]
    public async Task<IActionResult> UploadGuestPhoto(
        string slug,
        IFormFile file,
        [FromForm] string? guestName)
    {
        var evt = await db.Events
            .FirstOrDefaultAsync(e => e.Slug == slug && e.Status == EventStatus.Published);
        if (evt is null) return NotFound(new { title = "Event not found." });

        if (!await entitlements.HasBooleanFeatureAsync(evt.TenantId, evt.Id, "guest_photo_uploads"))
            return StatusCode(StatusCodes.Status403Forbidden, new ProblemDetails
            {
                Title = "Guest photo uploads are not enabled for this event.",
                Status = StatusCodes.Status403Forbidden
            });

        if (file.Length == 0)
            return BadRequest(new { title = "Empty file." });
        if (!AllowedImageTypes.Contains(file.ContentType))
            return BadRequest(new { title = "Only JPEG/PNG/WebP images are allowed." });
        if (file.Length > MaxImageSize)
            return BadRequest(new { title = "Image too large (max 10 MB)." });

        var guestCount = await db.MediaFiles.CountAsync(m =>
            m.EventId == evt.Id && m.IsGuestUpload);
        if (guestCount >= MaxGuestPhotosPerEvent)
            return BadRequest(new { title = "Guest photo limit reached for this event." });

        var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (string.IsNullOrEmpty(extension)) extension = ".jpg";

        using var stream = file.OpenReadStream();
        var storedPath = await fileStorage.SaveFileAsync(
            evt.TenantId, evt.Id, "guest-photos", stream, extension);
        var thumbPath = await fileStorage.GenerateThumbnailAsync(
            evt.TenantId, evt.Id, storedPath);

        var mediaFile = new MediaFile
        {
            Id = Guid.NewGuid(),
            TenantId = evt.TenantId,
            EventId = evt.Id,
            MediaType = MediaType.Image,
            OriginalFileName = file.FileName,
            StoredFileName = storedPath,
            ContentType = file.ContentType,
            FileSizeBytes = file.Length,
            ThumbnailFileName = thumbPath,
            SortOrder = guestCount,
            IsGuestUpload = true,
            IsModerated = false,
            IsFlagged = false,
            GuestDisplayName = string.IsNullOrWhiteSpace(guestName)
                ? null
                : guestName.Trim()[..Math.Min(guestName.Trim().Length, 200)]
        };

        db.MediaFiles.Add(mediaFile);
        await db.SaveChangesAsync();

        return Ok(new
        {
            mediaFile.Id,
            message = "Ευχαριστούμε! Η φωτογραφία στάλθηκε στους διοργανωτές."
        });
    }
}
