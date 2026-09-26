using ClosedXML.Excel;
using Hangfire;
using InvitationPlatform.Application.Common;
using InvitationPlatform.Application.Common.Interfaces;
using InvitationPlatform.Domain.Entities;
using InvitationPlatform.Domain.Enums;
using InvitationPlatform.Infrastructure.Jobs;
using InvitationPlatform.Infrastructure.Persistence;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace InvitationPlatform.Api.Controllers;

[ApiController]
[Route("api/v1/events/{eventId:guid}/guests")]
[Authorize]
public class GuestsController(
    ApplicationDbContext db,
    ITenantContext tenantContext,
    IFeatureEntitlementService entitlements,
    IAuditService audit) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll(Guid eventId)
    {
        if (tenantContext.TenantId is null) return Forbid();

        var guests = await db.Guests
            .Include(g => g.GuestGroup)
            .Where(g => g.EventId == eventId && g.TenantId == tenantContext.TenantId)
            .OrderBy(g => g.LastName).ThenBy(g => g.FirstName)
            .Select(g => new
            {
                g.Id,
                g.FirstName,
                g.LastName,
                g.Email,
                g.Phone,
                g.IsCeremonyOnly,
                g.IsReceptionEligible,
                g.AllowedPlusOnes,
                g.Tags,
                g.Notes,
                g.InviteToken,
                g.InvitationSentAt,
                GroupName = g.GuestGroup != null ? g.GuestGroup.Name : null,
                g.GuestGroupId,
                g.EventTableId,
                TableName = g.EventTable != null ? g.EventTable.Name : null,
                g.SeatIndex,
                RsvpStatus = g.Rsvps.OrderByDescending(r => r.SubmittedAt)
                    .Select(r => new { r.AttendingReception, r.AdultCount, r.ChildrenCount })
                    .FirstOrDefault()
            })
            .ToListAsync();

        return Ok(guests);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid eventId, Guid id)
    {
        if (tenantContext.TenantId is null) return Forbid();

        var guest = await db.Guests
            .Include(g => g.Rsvps.OrderByDescending(r => r.SubmittedAt))
            .Where(g => g.Id == id && g.EventId == eventId && g.TenantId == tenantContext.TenantId)
            .Select(g => new
            {
                g.Id,
                g.FirstName,
                g.LastName,
                g.Email,
                g.Phone,
                g.IsCeremonyOnly,
                g.IsReceptionEligible,
                g.AllowedPlusOnes,
                g.Tags,
                g.Notes,
                g.InviteToken,
                g.GuestGroupId,
                Rsvps = g.Rsvps.Select(r => new
                {
                    r.Id,
                    r.AttendingCeremony,
                    r.AttendingReception,
                    r.AdultCount,
                    r.ChildrenCount,
                    r.SubmittedAt
                })
            })
            .FirstOrDefaultAsync();

        if (guest is null) return NotFound();
        return Ok(guest);
    }

    [HttpGet("export.xlsx")]
    public async Task<IActionResult> ExportExcel(Guid eventId)
    {
        if (tenantContext.TenantId is null) return Forbid();
        var tenantId = tenantContext.TenantId.Value;

        try
        {
            await entitlements.EnsureBooleanFeatureAsync(tenantId, eventId, "excel_export");
        }
        catch (EntitlementException ex)
        {
            return StatusCode(StatusCodes.Status403Forbidden, new ProblemDetails
            {
                Title = ex.Message,
                Status = StatusCodes.Status403Forbidden
            });
        }

        var guests = await db.Guests
            .Include(g => g.GuestGroup)
            .Where(g => g.EventId == eventId && g.TenantId == tenantId)
            .OrderBy(g => g.LastName).ThenBy(g => g.FirstName)
            .ToListAsync();

        using var workbook = new XLWorkbook();
        var sheet = workbook.Worksheets.Add("Guests");
        sheet.Cell(1, 1).Value = "FirstName";
        sheet.Cell(1, 2).Value = "LastName";
        sheet.Cell(1, 3).Value = "Email";
        sheet.Cell(1, 4).Value = "Phone";
        sheet.Cell(1, 5).Value = "Group";
        sheet.Cell(1, 6).Value = "CeremonyOnly";
        sheet.Cell(1, 7).Value = "InviteToken";
        sheet.Cell(1, 8).Value = "Tags";

        var row = 2;
        foreach (var g in guests)
        {
            sheet.Cell(row, 1).Value = g.FirstName;
            sheet.Cell(row, 2).Value = g.LastName;
            sheet.Cell(row, 3).Value = g.Email ?? "";
            sheet.Cell(row, 4).Value = g.Phone ?? "";
            sheet.Cell(row, 5).Value = g.GuestGroup?.Name ?? "";
            sheet.Cell(row, 6).Value = g.IsCeremonyOnly;
            sheet.Cell(row, 7).Value = g.InviteToken;
            sheet.Cell(row, 8).Value = g.Tags ?? "";
            row++;
        }

        await audit.LogAsync(
            "guests.export_excel",
            actorUserId: tenantContext.UserId,
            tenantId: tenantId,
            eventId: eventId,
            entityType: "Event",
            entityId: eventId.ToString(),
            ipAddress: HttpContext.Connection.RemoteIpAddress?.ToString());

        using var stream = new MemoryStream();
        workbook.SaveAs(stream);
        return File(stream.ToArray(),
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            $"guests-{eventId:N}.xlsx");
    }

    [HttpPost]
    public async Task<IActionResult> Create(Guid eventId, [FromBody] CreateGuestRequest request)
    {
        if (tenantContext.TenantId is null) return Forbid();
        var tenantId = tenantContext.TenantId.Value;

        var evt = await db.Events
            .Where(e => e.Id == eventId && e.TenantId == tenantId)
            .AnyAsync();
        if (!evt) return NotFound();

        try
        {
            var currentCount = await db.Guests.CountAsync(g => g.EventId == eventId && g.TenantId == tenantId);
            await entitlements.EnsureWithinIntegerLimitAsync(tenantId, eventId, "max_guests", currentCount);
        }
        catch (EntitlementException ex)
        {
            return StatusCode(StatusCodes.Status403Forbidden, new ProblemDetails
            {
                Title = ex.Message,
                Status = StatusCodes.Status403Forbidden
            });
        }

        var guest = new Guest
        {
            TenantId = tenantId,
            EventId = eventId,
            FirstName = request.FirstName,
            LastName = request.LastName,
            Email = request.Email,
            Phone = request.Phone,
            GuestGroupId = request.GuestGroupId,
            IsCeremonyOnly = request.IsCeremonyOnly,
            IsReceptionEligible = request.IsReceptionEligible,
            AllowedPlusOnes = request.AllowedPlusOnes,
            Tags = request.Tags,
            Notes = request.Notes,
            InviteToken = Guid.NewGuid().ToString("N")
        };

        db.Guests.Add(guest);
        await db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { eventId, id = guest.Id },
            new { guest.Id, guest.FirstName, guest.LastName, guest.InviteToken });
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid eventId, Guid id, [FromBody] CreateGuestRequest request)
    {
        if (tenantContext.TenantId is null) return Forbid();

        var guest = await db.Guests
            .Where(g => g.Id == id && g.EventId == eventId && g.TenantId == tenantContext.TenantId)
            .FirstOrDefaultAsync();

        if (guest is null) return NotFound();

        guest.FirstName = request.FirstName;
        guest.LastName = request.LastName;
        guest.Email = request.Email;
        guest.Phone = request.Phone;
        guest.GuestGroupId = request.GuestGroupId;
        guest.IsCeremonyOnly = request.IsCeremonyOnly;
        guest.IsReceptionEligible = request.IsReceptionEligible;
        guest.AllowedPlusOnes = request.AllowedPlusOnes;
        guest.Tags = request.Tags;
        guest.Notes = request.Notes;

        await db.SaveChangesAsync();
        return Ok(new { guest.Id, guest.FirstName, guest.LastName, guest.InviteToken });
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid eventId, Guid id)
    {
        if (tenantContext.TenantId is null) return Forbid();

        var guest = await db.Guests
            .Where(g => g.Id == id && g.EventId == eventId && g.TenantId == tenantContext.TenantId)
            .FirstOrDefaultAsync();

        if (guest is null) return NotFound();

        guest.IsDeleted = true;
        guest.DeletedAt = DateTime.UtcNow;
        await db.SaveChangesAsync();

        return NoContent();
    }

    /// <summary>Send invitation emails to selected guests or all guests with email addresses.</summary>
    [HttpPost("send-invitations")]
    public async Task<IActionResult> SendInvitations(Guid eventId, [FromBody] SendInvitationsRequest request)
    {
        if (tenantContext.TenantId is null) return Forbid();
        var tenantId = tenantContext.TenantId.Value;

        var evt = await db.Events
            .Where(e => e.Id == eventId && e.TenantId == tenantId)
            .Select(e => new { e.Status, e.Slug })
            .FirstOrDefaultAsync();

        if (evt is null) return NotFound();
        if (evt.Status != EventStatus.Published || string.IsNullOrWhiteSpace(evt.Slug))
        {
            return BadRequest(new ProblemDetails
            {
                Title = "Η εκδήλωση δεν είναι δημοσιευμένη",
                Detail = "Πρέπει πρώτα να δημοσιεύσετε την πρόσκληση πριν στείλετε emails.",
                Status = StatusCodes.Status400BadRequest
            });
        }

        int maxEmails;
        try
        {
            maxEmails = await entitlements.GetIntegerLimitAsync(tenantId, eventId, "max_emails");
        }
        catch
        {
            maxEmails = 0;
        }

        if (maxEmails <= 0)
        {
            return StatusCode(StatusCodes.Status403Forbidden, new ProblemDetails
            {
                Title = "Η αποστολή email δεν είναι διαθέσιμη",
                Detail = "Αναβαθμίστε σε πακέτο Digital ή Video για να αποστείλετε προσκλήσεις μέσω email.",
                Status = StatusCodes.Status403Forbidden
            });
        }

        var query = db.Guests
            .Where(g => g.EventId == eventId && g.TenantId == tenantId && !string.IsNullOrEmpty(g.Email));

        if (request.GuestIds is { Count: > 0 })
        {
            query = query.Where(g => request.GuestIds.Contains(g.Id));
        }
        else if (!request.SendToAll)
        {
            return BadRequest(new ProblemDetails
            {
                Title = "Παρακαλώ επιλέξτε καλεσμένους",
                Detail = "Πρέπει να επιλέξετε καλεσμένους ή να ορίσετε sendToAll: true.",
                Status = StatusCodes.Status400BadRequest
            });
        }

        if (request.OnlyUnsent)
        {
            query = query.Where(g => g.InvitationSentAt == null);
        }

        var guestsToSend = await query
            .Select(g => new { g.Id, g.Email })
            .ToListAsync();

        if (guestsToSend.Count == 0)
        {
            return Ok(new { queued = 0, message = "Δεν βρέθηκαν καλεσμένοι με email για αποστολή." });
        }

        var alreadySentCount = await db.Guests
            .Where(g => g.EventId == eventId && g.TenantId == tenantId && g.InvitationSentAt != null)
            .CountAsync();

        var remaining = Math.Max(0, maxEmails - alreadySentCount);
        if (guestsToSend.Count > remaining)
        {
            return StatusCode(StatusCodes.Status403Forbidden, new ProblemDetails
            {
                Title = "Υπέρβαση ορίου email",
                Detail = $"Μπορείτε να στείλετε ακόμη {remaining} emails (όριο: {maxEmails}). Ζητήσατε αποστολή σε {guestsToSend.Count} καλεσμένους.",
                Status = StatusCodes.Status403Forbidden
            });
        }

        foreach (var g in guestsToSend)
        {
            BackgroundJob.Enqueue<HangfireJobRunner>(j => j.SendInvitationEmail(g.Id));
        }

        await audit.LogAsync(
            "guests.send_invitations",
            actorUserId: tenantContext.UserId,
            tenantId: tenantId,
            eventId: eventId,
            entityType: "Event",
            entityId: eventId.ToString(),
            details: System.Text.Json.JsonSerializer.Serialize(new { count = guestsToSend.Count }),
            ipAddress: HttpContext.Connection.RemoteIpAddress?.ToString());

        return Ok(new { queued = guestsToSend.Count, message = $"Αποστέλλονται {guestsToSend.Count} προσκλήσεις..." });
    }
}

public record SendInvitationsRequest(
    List<Guid>? GuestIds = null,
    bool SendToAll = false,
    bool OnlyUnsent = true
);

public record CreateGuestRequest(
    string FirstName,
    string LastName,
    string? Email,
    string? Phone,
    Guid? GuestGroupId,
    bool IsCeremonyOnly = false,
    bool IsReceptionEligible = true,
    int AllowedPlusOnes = 0,
    string? Tags = null,
    string? Notes = null
);
