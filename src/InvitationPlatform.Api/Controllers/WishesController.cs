using InvitationPlatform.Application.Common.Interfaces;
using InvitationPlatform.Domain.Entities;
using InvitationPlatform.Domain.Enums;
using InvitationPlatform.Infrastructure.Persistence;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;

namespace InvitationPlatform.Api.Controllers;

[ApiController]
[Route("api/v1/public/invitations/{slug}")]
[AllowAnonymous]
public class PublicWishesController(ApplicationDbContext db) : ControllerBase
{
    [HttpGet("wishes")]
    public async Task<IActionResult> List(string slug)
    {
        var evt = await FindPublishedEventAsync(slug);
        if (evt is null) return NotFound(new ProblemDetails { Title = "Event not found." });

        var wishes = await db.GuestWishes
            .IgnoreQueryFilters()
            .Where(w => w.EventId == evt.Id)
            .OrderByDescending(w => w.CreatedAt)
            .Select(w => new { w.Id, Name = w.GuestName, w.Message, w.CreatedAt })
            .ToListAsync();

        return Ok(wishes);
    }

    [HttpPost("wishes")]
    [EnableRateLimiting("public-wishes")]
    public async Task<IActionResult> Create(string slug, [FromBody] PublicWishRequest request)
    {
        var evt = await FindPublishedEventAsync(slug);
        if (evt is null) return NotFound(new ProblemDetails { Title = "Event not found." });

        if (!await IsWishesSectionEnabledAsync(evt.Id))
            return NotFound(new ProblemDetails { Title = "Wish book is not enabled." });

        var name = (request.Name ?? "").Trim();
        var message = (request.Message ?? "").Trim();
        if (name.Length is < 2 or > 120)
            return BadRequest(new ProblemDetails { Title = "Name is required (2–120 characters)." });
        if (message.Length is < 2 or > 1000)
            return BadRequest(new ProblemDetails { Title = "Message is required (2–1000 characters)." });

        var wish = new GuestWish
        {
            Id = Guid.NewGuid(),
            TenantId = evt.TenantId,
            EventId = evt.Id,
            GuestName = name,
            Message = message
        };

        db.GuestWishes.Add(wish);
        await db.SaveChangesAsync();

        return Ok(new { wish.Id, Name = wish.GuestName, wish.Message, wish.CreatedAt });
    }

    private async Task<Event?> FindPublishedEventAsync(string slug) =>
        await db.Events
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(e => e.Slug == slug && e.Status == EventStatus.Published && !e.IsDeleted);

    private async Task<bool> IsWishesSectionEnabledAsync(Guid eventId)
    {
        var versionId = await db.InvitationVersions
            .IgnoreQueryFilters()
            .Where(v => v.EventId == eventId && v.IsPublished)
            .OrderByDescending(v => v.VersionNumber)
            .Select(v => (Guid?)v.Id)
            .FirstOrDefaultAsync();

        if (versionId is null) return false;

        return await db.InvitationSections
            .IgnoreQueryFilters()
            .AnyAsync(s =>
                s.InvitationVersionId == versionId
                && s.SectionType == "wishes"
                && s.IsEnabled);
    }
}

public record PublicWishRequest(string? Name, string? Message);

[ApiController]
[Route("api/v1/events/{eventId:guid}/wishes")]
[Authorize]
public class EventWishesController(ApplicationDbContext db, ITenantContext tenantContext) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> List(Guid eventId)
    {
        if (tenantContext.TenantId is null) return Forbid();

        var exists = await db.Events.AnyAsync(e => e.Id == eventId && e.TenantId == tenantContext.TenantId);
        if (!exists) return NotFound();

        var wishes = await db.GuestWishes
            .Where(w => w.EventId == eventId && w.TenantId == tenantContext.TenantId)
            .OrderByDescending(w => w.CreatedAt)
            .Select(w => new { w.Id, Name = w.GuestName, w.Message, w.CreatedAt })
            .ToListAsync();

        return Ok(wishes);
    }
}
