using InvitationPlatform.Application.Common.Interfaces;
using InvitationPlatform.Domain.Entities;
using InvitationPlatform.Infrastructure.Persistence;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace InvitationPlatform.Api.Controllers;

[ApiController]
[Route("api/v1/events/{eventId:guid}/guest-groups")]
[Authorize]
public class GuestGroupsController(ApplicationDbContext db, ITenantContext tenantContext) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll(Guid eventId)
    {
        if (tenantContext.TenantId is null) return Forbid();

        var groups = await db.GuestGroups
            .Where(g => g.EventId == eventId && g.TenantId == tenantContext.TenantId)
            .OrderBy(g => g.Name)
            .Select(g => new
            {
                g.Id,
                g.Name,
                g.InviteToken,
                GuestCount = g.Guests.Count(x => !x.IsDeleted),
                g.CreatedAt
            })
            .ToListAsync();

        return Ok(groups);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid eventId, Guid id)
    {
        if (tenantContext.TenantId is null) return Forbid();

        var group = await db.GuestGroups
            .Where(g => g.Id == id && g.EventId == eventId && g.TenantId == tenantContext.TenantId)
            .Select(g => new
            {
                g.Id,
                g.Name,
                g.InviteToken,
                GuestCount = g.Guests.Count(x => !x.IsDeleted),
                g.CreatedAt
            })
            .FirstOrDefaultAsync();

        if (group is null) return NotFound();
        return Ok(group);
    }

    [HttpPost]
    public async Task<IActionResult> Create(Guid eventId, [FromBody] GuestGroupRequest request)
    {
        if (tenantContext.TenantId is null) return Forbid();

        var exists = await db.Events.AnyAsync(e => e.Id == eventId && e.TenantId == tenantContext.TenantId);
        if (!exists) return NotFound();

        if (string.IsNullOrWhiteSpace(request.Name))
            return BadRequest(new ProblemDetails { Title = "Name is required." });

        var group = new GuestGroup
        {
            Id = Guid.NewGuid(),
            TenantId = tenantContext.TenantId.Value,
            EventId = eventId,
            Name = request.Name.Trim(),
            InviteToken = Guid.NewGuid().ToString("N")
        };

        db.GuestGroups.Add(group);
        await db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { eventId, id = group.Id },
            new { group.Id, group.Name, group.InviteToken });
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid eventId, Guid id, [FromBody] GuestGroupRequest request)
    {
        if (tenantContext.TenantId is null) return Forbid();

        var group = await db.GuestGroups
            .FirstOrDefaultAsync(g => g.Id == id && g.EventId == eventId && g.TenantId == tenantContext.TenantId);
        if (group is null) return NotFound();

        if (string.IsNullOrWhiteSpace(request.Name))
            return BadRequest(new ProblemDetails { Title = "Name is required." });

        group.Name = request.Name.Trim();
        await db.SaveChangesAsync();

        return Ok(new { group.Id, group.Name, group.InviteToken });
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid eventId, Guid id)
    {
        if (tenantContext.TenantId is null) return Forbid();

        var group = await db.GuestGroups
            .FirstOrDefaultAsync(g => g.Id == id && g.EventId == eventId && g.TenantId == tenantContext.TenantId);
        if (group is null) return NotFound();

        db.GuestGroups.Remove(group);
        await db.SaveChangesAsync();
        return NoContent();
    }
}

public record GuestGroupRequest(string Name);
