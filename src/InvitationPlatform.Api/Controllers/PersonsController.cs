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
[Route("api/v1/events/{eventId:guid}/persons")]
[Authorize]
public class PersonsController(
    ApplicationDbContext db,
    ITenantContext tenantContext,
    IFileStorageService fileStorage) : ControllerBase
{
    private static readonly HashSet<string> AllowedImageTypes = ["image/jpeg", "image/png", "image/webp"];
    private const long MaxPhotoSize = 5 * 1024 * 1024;

    [HttpGet]
    public async Task<IActionResult> GetAll(Guid eventId)
    {
        if (tenantContext.TenantId is null) return Forbid();

        var persons = await db.EventPersons
            .Where(p => p.EventId == eventId && p.TenantId == tenantContext.TenantId)
            .OrderBy(p => p.SortOrder)
            .ToListAsync();

        return Ok(persons.Select(p => MapPerson(p, fileStorage)));
    }

    [HttpPost]
    public async Task<IActionResult> Create(Guid eventId, [FromBody] UpsertPersonRequest request)
    {
        if (tenantContext.TenantId is null) return Forbid();

        var evt = await db.Events
            .FirstOrDefaultAsync(e => e.Id == eventId && e.TenantId == tenantContext.TenantId);
        if (evt is null) return NotFound();

        if (string.IsNullOrWhiteSpace(request.DisplayName))
            return BadRequest(new ProblemDetails { Title = "Display name is required." });

        if (!Enum.TryParse<EventPersonRole>(request.Role, true, out var role))
            return BadRequest(new ProblemDetails { Title = "Invalid role." });

        PersonSide? side = null;
        if (!string.IsNullOrWhiteSpace(request.Side) &&
            Enum.TryParse<PersonSide>(request.Side, true, out var parsedSide))
            side = parsedSide;

        var person = new EventPerson
        {
            Id = Guid.NewGuid(),
            TenantId = tenantContext.TenantId.Value,
            EventId = eventId,
            Role = role,
            DisplayName = request.DisplayName.Trim(),
            Side = side,
            SortOrder = request.SortOrder ?? await db.EventPersons.CountAsync(p => p.EventId == eventId)
        };

        db.EventPersons.Add(person);
        await db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetAll), new { eventId }, MapPerson(person, fileStorage));
    }

    [HttpPut("{personId:guid}")]
    public async Task<IActionResult> Update(Guid eventId, Guid personId, [FromBody] UpsertPersonRequest request)
    {
        if (tenantContext.TenantId is null) return Forbid();

        var person = await db.EventPersons
            .FirstOrDefaultAsync(p =>
                p.Id == personId && p.EventId == eventId && p.TenantId == tenantContext.TenantId);
        if (person is null) return NotFound();

        if (string.IsNullOrWhiteSpace(request.DisplayName))
            return BadRequest(new ProblemDetails { Title = "Display name is required." });

        if (!Enum.TryParse<EventPersonRole>(request.Role, true, out var role))
            return BadRequest(new ProblemDetails { Title = "Invalid role." });

        person.DisplayName = request.DisplayName.Trim();
        person.Role = role;
        person.Side = null;
        if (!string.IsNullOrWhiteSpace(request.Side) &&
            Enum.TryParse<PersonSide>(request.Side, true, out var parsedSide))
            person.Side = parsedSide;
        if (request.SortOrder.HasValue) person.SortOrder = request.SortOrder.Value;

        await db.SaveChangesAsync();
        return Ok(MapPerson(person, fileStorage));
    }

    [HttpDelete("{personId:guid}")]
    public async Task<IActionResult> Delete(Guid eventId, Guid personId)
    {
        if (tenantContext.TenantId is null) return Forbid();

        var person = await db.EventPersons
            .FirstOrDefaultAsync(p =>
                p.Id == personId && p.EventId == eventId && p.TenantId == tenantContext.TenantId);
        if (person is null) return NotFound();

        if (!string.IsNullOrEmpty(person.PhotoUrl))
            await fileStorage.DeleteFileAsync(person.PhotoUrl);

        db.EventPersons.Remove(person);
        await db.SaveChangesAsync();
        return NoContent();
    }

    [HttpPost("{personId:guid}/photo")]
    [RequestSizeLimit(MaxPhotoSize)]
    [EnableRateLimiting("upload")]
    public async Task<IActionResult> UploadPhoto(Guid eventId, Guid personId, IFormFile file)
    {
        if (tenantContext.TenantId is null) return Forbid();

        var person = await db.EventPersons
            .FirstOrDefaultAsync(p =>
                p.Id == personId && p.EventId == eventId && p.TenantId == tenantContext.TenantId);
        if (person is null) return NotFound();

        if (file.Length == 0) return BadRequest(new { message = "Empty file" });
        if (file.Length > MaxPhotoSize) return BadRequest(new { message = "File too large (max 5 MB)" });
        if (!AllowedImageTypes.Contains(file.ContentType))
            return BadRequest(new { message = "Only JPEG, PNG, and WebP images are allowed" });

        if (!string.IsNullOrEmpty(person.PhotoUrl))
            await fileStorage.DeleteFileAsync(person.PhotoUrl);

        var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (string.IsNullOrEmpty(extension)) extension = ".jpg";

        using var stream = file.OpenReadStream();
        var storedPath = await fileStorage.SaveFileAsync(
            tenantContext.TenantId.Value, eventId, "persons", stream, extension);

        person.PhotoUrl = storedPath;
        await db.SaveChangesAsync();

        return Ok(MapPerson(person, fileStorage));
    }

    [HttpDelete("{personId:guid}/photo")]
    public async Task<IActionResult> DeletePhoto(Guid eventId, Guid personId)
    {
        if (tenantContext.TenantId is null) return Forbid();

        var person = await db.EventPersons
            .FirstOrDefaultAsync(p =>
                p.Id == personId && p.EventId == eventId && p.TenantId == tenantContext.TenantId);
        if (person is null) return NotFound();

        if (!string.IsNullOrEmpty(person.PhotoUrl))
        {
            await fileStorage.DeleteFileAsync(person.PhotoUrl);
            person.PhotoUrl = null;
            await db.SaveChangesAsync();
        }

        return Ok(MapPerson(person, fileStorage));
    }

    private static object MapPerson(EventPerson p, IFileStorageService storage) => new
    {
        p.Id,
        Role = p.Role.ToString(),
        p.DisplayName,
        Side = p.Side?.ToString(),
        p.SortOrder,
        PhotoUrl = p.PhotoUrl != null ? storage.GetFileUrl(p.PhotoUrl) : null
    };

    public record UpsertPersonRequest(string DisplayName, string Role, string? Side, int? SortOrder);
}
