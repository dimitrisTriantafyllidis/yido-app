using InvitationPlatform.Application.Common.Interfaces;
using InvitationPlatform.Domain.Entities;
using InvitationPlatform.Domain.Enums;
using InvitationPlatform.Infrastructure.Persistence;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace InvitationPlatform.Api.Controllers;

[ApiController]
[Route("api/v1/events/{eventId:guid}/venues")]
[Authorize]
public class VenuesController(
    ApplicationDbContext db,
    ITenantContext tenantContext) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll(Guid eventId)
    {
        if (tenantContext.TenantId is null) return Forbid();

        var venues = await db.Venues
            .Where(v => v.EventId == eventId && v.TenantId == tenantContext.TenantId)
            .OrderBy(v => v.SortOrder)
            .ToListAsync();

        return Ok(venues.Select(MapVenue));
    }

    [HttpPost]
    public async Task<IActionResult> Create(Guid eventId, [FromBody] UpsertVenueRequest request)
    {
        if (tenantContext.TenantId is null) return Forbid();

        var evt = await db.Events
            .FirstOrDefaultAsync(e => e.Id == eventId && e.TenantId == tenantContext.TenantId);
        if (evt is null) return NotFound();

        if (string.IsNullOrWhiteSpace(request.Name))
            return BadRequest(new ProblemDetails { Title = "Name is required." });

        if (!Enum.TryParse<VenueType>(request.VenueType, true, out var venueType))
            return BadRequest(new ProblemDetails { Title = "Invalid venue type." });

        var venue = new Venue
        {
            Id = Guid.NewGuid(),
            TenantId = tenantContext.TenantId.Value,
            EventId = eventId,
            Name = request.Name.Trim(),
            VenueType = venueType,
            Address = request.Address,
            City = request.City,
            GoogleMapsUrl = request.GoogleMapsUrl,
            Latitude = request.Latitude,
            Longitude = request.Longitude,
            Time = ParseTime(request.Time),
            Notes = request.Notes,
            SortOrder = request.SortOrder ?? await db.Venues.CountAsync(v => v.EventId == eventId)
        };

        db.Venues.Add(venue);
        await db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetAll), new { eventId }, MapVenue(venue));
    }

    [HttpPut("{venueId:guid}")]
    public async Task<IActionResult> Update(Guid eventId, Guid venueId, [FromBody] UpsertVenueRequest request)
    {
        if (tenantContext.TenantId is null) return Forbid();

        var venue = await db.Venues
            .FirstOrDefaultAsync(v =>
                v.Id == venueId && v.EventId == eventId && v.TenantId == tenantContext.TenantId);
        if (venue is null) return NotFound();

        if (string.IsNullOrWhiteSpace(request.Name))
            return BadRequest(new ProblemDetails { Title = "Name is required." });

        if (!Enum.TryParse<VenueType>(request.VenueType, true, out var venueType))
            return BadRequest(new ProblemDetails { Title = "Invalid venue type." });

        venue.Name = request.Name.Trim();
        venue.VenueType = venueType;
        venue.Address = request.Address;
        venue.City = request.City;
        venue.GoogleMapsUrl = request.GoogleMapsUrl;
        venue.Latitude = request.Latitude;
        venue.Longitude = request.Longitude;
        venue.Time = ParseTime(request.Time);
        venue.Notes = request.Notes;
        if (request.SortOrder.HasValue) venue.SortOrder = request.SortOrder.Value;

        await db.SaveChangesAsync();
        return Ok(MapVenue(venue));
    }

    [HttpDelete("{venueId:guid}")]
    public async Task<IActionResult> Delete(Guid eventId, Guid venueId)
    {
        if (tenantContext.TenantId is null) return Forbid();

        var venue = await db.Venues
            .FirstOrDefaultAsync(v =>
                v.Id == venueId && v.EventId == eventId && v.TenantId == tenantContext.TenantId);
        if (venue is null) return NotFound();

        db.Venues.Remove(venue);
        await db.SaveChangesAsync();
        return NoContent();
    }

    private static TimeOnly? ParseTime(string? time)
    {
        if (string.IsNullOrWhiteSpace(time)) return null;
        return TimeOnly.TryParse(time, out var t) ? t : null;
    }

    private static object MapVenue(Venue v) => new
    {
        v.Id,
        v.Name,
        VenueType = v.VenueType.ToString(),
        v.Address,
        v.City,
        v.GoogleMapsUrl,
        v.Latitude,
        v.Longitude,
        Time = v.Time.HasValue ? v.Time.Value.ToString("HH:mm") : null,
        v.Notes,
        v.SortOrder
    };

    public record UpsertVenueRequest(
        string Name,
        string VenueType,
        string? Address,
        string? City,
        string? GoogleMapsUrl,
        decimal? Latitude,
        decimal? Longitude,
        string? Time,
        string? Notes,
        int? SortOrder);
}
