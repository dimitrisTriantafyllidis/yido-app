using InvitationPlatform.Application.Common.Interfaces;
using InvitationPlatform.Domain.Entities;
using InvitationPlatform.Domain.Enums;
using InvitationPlatform.Infrastructure.Persistence;
using InvitationPlatform.Infrastructure.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace InvitationPlatform.Api.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
[Authorize]
public class EventsController(
    ApplicationDbContext db,
    ITenantContext tenantContext,
    IFileStorageService fileStorage) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        if (tenantContext.TenantId is null) return Forbid();

        var events = await db.Events
            .Where(e => e.TenantId == tenantContext.TenantId)
            .Select(e => new
            {
                e.Id,
                e.Title,
                EventType = e.EventType.ToString(),
                e.EventDate,
                Status = e.Status.ToString(),
                e.Slug,
                e.Locale,
                e.Description,
                e.PublishedAt,
                e.CreatedAt,
                VenueCount = e.Venues.Count,
                PersonCount = e.Persons.Count
            })
            .ToListAsync();

        return Ok(events);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        if (tenantContext.TenantId is null) return Forbid();

        var evt = await db.Events
            .Include(e => e.Venues.OrderBy(v => v.SortOrder))
            .Include(e => e.Persons.OrderBy(p => p.SortOrder))
            .Where(e => e.Id == id && e.TenantId == tenantContext.TenantId)
            .FirstOrDefaultAsync();

        if (evt is null) return NotFound();

        return Ok(MapEventDetail(evt));
    }

    [HttpGet("{eventId:guid}/qr")]
    public async Task<IActionResult> GetQrCode(
        Guid eventId,
        [FromQuery] string target = "invitation",
        [FromServices] IFeatureEntitlementService entitlements = null!,
        [FromServices] IQrCodeService qrCode = null!,
        [FromServices] IConfiguration configuration = null!)
    {
        if (tenantContext.TenantId is null) return Forbid();
        var tenantId = tenantContext.TenantId.Value;

        var evt = await db.Events
            .FirstOrDefaultAsync(e => e.Id == eventId && e.TenantId == tenantId);
        if (evt is null) return NotFound();

        var isUploadQr = string.Equals(target, "upload", StringComparison.OrdinalIgnoreCase);
        var featureKey = isUploadQr ? "guest_photo_uploads" : "qr_code";

        try
        {
            await entitlements.EnsureBooleanFeatureAsync(tenantId, eventId, featureKey);
        }
        catch (Application.Common.EntitlementException ex)
        {
            return StatusCode(StatusCodes.Status403Forbidden, new ProblemDetails
            {
                Title = ex.Message,
                Status = StatusCodes.Status403Forbidden
            });
        }

        if (string.IsNullOrWhiteSpace(evt.Slug))
            return BadRequest(new ProblemDetails { Title = "Event has no public slug yet. Publish first." });

        var frontend = configuration["Frontend:Url"] ?? "http://localhost:3000";
        var path = isUploadQr ? $"/e/{evt.Slug}/upload" : $"/e/{evt.Slug}";
        var url = $"{frontend.TrimEnd('/')}{path}";
        var png = qrCode.GeneratePng(url);
        var fileName = isUploadQr ? $"{evt.Slug}-guest-upload-qr.png" : $"{evt.Slug}-qr.png";
        return File(png, "image/png", fileName);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateEventRequest request)
    {
        if (tenantContext.TenantId is null) return Forbid();

        var evt = new Event
        {
            TenantId = tenantContext.TenantId.Value,
            Title = request.Title,
            EventType = request.EventType,
            EventDate = request.EventDate,
            EventEndDate = request.EventEndDate,
            Locale = request.Locale ?? "el",
            Description = request.Description,
            Status = EventStatus.Draft,
            CreatedBy = tenantContext.UserId
        };

        db.Events.Add(evt);
        await db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = evt.Id }, new { evt.Id, evt.Title, Status = evt.Status.ToString() });
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateEventRequest request)
    {
        if (tenantContext.TenantId is null) return Forbid();

        var evt = await db.Events
            .Where(e => e.Id == id && e.TenantId == tenantContext.TenantId)
            .FirstOrDefaultAsync();

        if (evt is null) return NotFound();

        evt.Title = request.Title;
        evt.EventType = request.EventType;
        evt.EventDate = request.EventDate;
        evt.EventEndDate = request.EventEndDate;
        evt.Description = request.Description;
        evt.Locale = request.Locale ?? evt.Locale;

        await db.SaveChangesAsync();

        return Ok(new { evt.Id, evt.Title, Status = evt.Status.ToString() });
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        if (tenantContext.TenantId is null) return Forbid();

        var evt = await db.Events
            .Where(e => e.Id == id && e.TenantId == tenantContext.TenantId)
            .FirstOrDefaultAsync();

        if (evt is null) return NotFound();

        evt.IsDeleted = true;
        evt.DeletedAt = DateTime.UtcNow;
        await db.SaveChangesAsync();

        return NoContent();
    }

    [HttpPatch("{id:guid}/status")]
    public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] UpdateStatusRequest request)
    {
        if (tenantContext.TenantId is null) return Forbid();

        var evt = await db.Events
            .Where(e => e.Id == id && e.TenantId == tenantContext.TenantId)
            .FirstOrDefaultAsync();

        if (evt is null) return NotFound();

        evt.Status = request.Status;
        if (request.Status == EventStatus.Published && evt.PublishedAt is null)
            evt.PublishedAt = DateTime.UtcNow;

        await db.SaveChangesAsync();

        return Ok(new { evt.Id, Status = evt.Status.ToString() });
    }

    // Public endpoint - no auth required
    [HttpGet("by-slug/{slug}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetBySlug(string slug)
    {
        var evt = await db.Events
            .Include(e => e.Venues.OrderBy(v => v.SortOrder))
            .Include(e => e.Persons.OrderBy(p => p.SortOrder))
            .Where(e => e.Slug == slug && e.Status == EventStatus.Published)
            .FirstOrDefaultAsync();

        if (evt is null) return NotFound();

        return Ok(MapEventDetail(evt));
    }

    private object MapEventDetail(Event evt) => new
    {
        evt.Id,
        evt.Title,
        EventType = evt.EventType.ToString(),
        evt.EventDate,
        evt.EventEndDate,
        Status = evt.Status.ToString(),
        evt.Slug,
        evt.Locale,
        CoverImageUrl = evt.CoverImageUrl != null && !evt.CoverImageUrl.StartsWith("http")
            ? fileStorage.GetFileUrl(evt.CoverImageUrl)
            : evt.CoverImageUrl,
        evt.Description,
        evt.PublishedAt,
        evt.ExpiresAt,
        evt.CreatedAt,
        Venues = evt.Venues.Select(v => new
        {
            v.Id, v.Name,
            VenueType = v.VenueType.ToString(),
            v.Address, v.City, v.GoogleMapsUrl,
            v.Latitude, v.Longitude,
            Time = v.Time.HasValue ? v.Time.Value.ToString("HH:mm") : null,
            v.Notes, v.SortOrder
        }),
        Persons = evt.Persons.Select(p => new
        {
            p.Id,
            Role = p.Role.ToString(),
            p.DisplayName,
            Side = p.Side?.ToString(),
            p.SortOrder,
            PhotoUrl = p.PhotoUrl != null ? fileStorage.GetFileUrl(p.PhotoUrl) : null
        })
    };
}

public record CreateEventRequest(
    string Title,
    EventType EventType,
    DateTime? EventDate,
    DateTime? EventEndDate,
    string? Description,
    string? Locale
);

public record UpdateEventRequest(
    string Title,
    EventType EventType,
    DateTime? EventDate,
    DateTime? EventEndDate,
    string? Description,
    string? Locale
);

public record UpdateStatusRequest(EventStatus Status);
