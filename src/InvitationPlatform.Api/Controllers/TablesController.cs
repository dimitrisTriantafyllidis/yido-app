using ClosedXML.Excel;
using InvitationPlatform.Application.Common;
using InvitationPlatform.Application.Common.Interfaces;
using InvitationPlatform.Domain.Entities;
using InvitationPlatform.Infrastructure.Persistence;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace InvitationPlatform.Api.Controllers;

[ApiController]
[Route("api/v1/events/{eventId:guid}/tables")]
[Authorize]
public class TablesController(
    ApplicationDbContext db,
    ITenantContext tenantContext,
    IFeatureEntitlementService entitlements) : ControllerBase
{
    private async Task<IActionResult?> EnsureSeatingAsync(Guid tenantId, Guid eventId)
    {
        try
        {
            await entitlements.EnsureBooleanFeatureAsync(tenantId, eventId, "seating_plan");
            return null;
        }
        catch (EntitlementException ex)
        {
            return StatusCode(StatusCodes.Status403Forbidden, new ProblemDetails
            {
                Title = ex.Message,
                Status = StatusCodes.Status403Forbidden
            });
        }
    }

    [HttpGet]
    public async Task<IActionResult> GetAll(Guid eventId)
    {
        if (tenantContext.TenantId is null) return Forbid();
        var tenantId = tenantContext.TenantId.Value;

        var gate = await EnsureSeatingAsync(tenantId, eventId);
        if (gate is not null) return gate;

        var tables = await db.EventTables
            .Where(t => t.EventId == eventId && t.TenantId == tenantId)
            .OrderBy(t => t.SortOrder)
            .ThenBy(t => t.Name)
            .Select(t => new
            {
                t.Id,
                t.Name,
                t.CategoryLabel,
                t.Capacity,
                t.SortOrder,
                Guests = t.Guests
                    .OrderBy(g => g.SeatIndex)
                    .ThenBy(g => g.LastName)
                    .Select(g => new
                    {
                        g.Id,
                        g.FirstName,
                        g.LastName,
                        g.SeatIndex,
                        g.AllowedPlusOnes
                    })
                    .ToList()
            })
            .ToListAsync();

        return Ok(tables);
    }

    [HttpPost]
    public async Task<IActionResult> Create(Guid eventId, [FromBody] UpsertTableRequest request)
    {
        if (tenantContext.TenantId is null) return Forbid();
        var tenantId = tenantContext.TenantId.Value;

        var gate = await EnsureSeatingAsync(tenantId, eventId);
        if (gate is not null) return gate;

        var evt = await db.Events.AnyAsync(e => e.Id == eventId && e.TenantId == tenantId);
        if (!evt) return NotFound();

        var capacity = request.Capacity is > 0 and <= 24 ? request.Capacity.Value : 8;
        var sortOrder = request.SortOrder
            ?? await db.EventTables.CountAsync(t => t.EventId == eventId && t.TenantId == tenantId);

        var name = string.IsNullOrWhiteSpace(request.Name)
            ? $"Τραπέζι {sortOrder + 1}"
            : request.Name.Trim();

        var table = new EventTable
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            EventId = eventId,
            Name = name,
            CategoryLabel = string.IsNullOrWhiteSpace(request.CategoryLabel)
                ? null
                : request.CategoryLabel.Trim(),
            Capacity = capacity,
            SortOrder = sortOrder
        };

        db.EventTables.Add(table);
        await db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetAll), new { eventId }, MapTable(table, []));
    }

    [HttpPut("{tableId:guid}")]
    public async Task<IActionResult> Update(Guid eventId, Guid tableId, [FromBody] UpsertTableRequest request)
    {
        if (tenantContext.TenantId is null) return Forbid();
        var tenantId = tenantContext.TenantId.Value;

        var gate = await EnsureSeatingAsync(tenantId, eventId);
        if (gate is not null) return gate;

        var table = await db.EventTables
            .Include(t => t.Guests)
            .FirstOrDefaultAsync(t =>
                t.Id == tableId && t.EventId == eventId && t.TenantId == tenantId);
        if (table is null) return NotFound();

        if (!string.IsNullOrWhiteSpace(request.Name))
            table.Name = request.Name.Trim();
        if (request.CategoryLabel is not null)
            table.CategoryLabel = string.IsNullOrWhiteSpace(request.CategoryLabel)
                ? null
                : request.CategoryLabel.Trim();
        if (request.Capacity is > 0 and <= 24)
        {
            if (table.Guests.Count > request.Capacity.Value)
                return BadRequest(new ProblemDetails
                {
                    Title = $"Cannot reduce capacity below {table.Guests.Count} seated guests."
                });
            table.Capacity = request.Capacity.Value;
        }
        if (request.SortOrder.HasValue)
            table.SortOrder = request.SortOrder.Value;

        await db.SaveChangesAsync();
        return Ok(MapTable(table, table.Guests));
    }

    [HttpDelete("{tableId:guid}")]
    public async Task<IActionResult> Delete(Guid eventId, Guid tableId)
    {
        if (tenantContext.TenantId is null) return Forbid();
        var tenantId = tenantContext.TenantId.Value;

        var gate = await EnsureSeatingAsync(tenantId, eventId);
        if (gate is not null) return gate;

        var table = await db.EventTables
            .Include(t => t.Guests)
            .FirstOrDefaultAsync(t =>
                t.Id == tableId && t.EventId == eventId && t.TenantId == tenantId);
        if (table is null) return NotFound();

        foreach (var guest in table.Guests)
        {
            guest.EventTableId = null;
            guest.SeatIndex = null;
        }

        db.EventTables.Remove(table);
        await db.SaveChangesAsync();
        return NoContent();
    }

    [HttpPost("{tableId:guid}/assign")]
    public async Task<IActionResult> AssignGuest(
        Guid eventId,
        Guid tableId,
        [FromBody] AssignGuestRequest request)
    {
        if (tenantContext.TenantId is null) return Forbid();
        var tenantId = tenantContext.TenantId.Value;

        var gate = await EnsureSeatingAsync(tenantId, eventId);
        if (gate is not null) return gate;

        var table = await db.EventTables
            .Include(t => t.Guests)
            .FirstOrDefaultAsync(t =>
                t.Id == tableId && t.EventId == eventId && t.TenantId == tenantId);
        if (table is null) return NotFound(new ProblemDetails { Title = "Table not found." });

        var guest = await db.Guests.FirstOrDefaultAsync(g =>
            g.Id == request.GuestId && g.EventId == eventId && g.TenantId == tenantId);
        if (guest is null) return NotFound(new ProblemDetails { Title = "Guest not found." });

        var alreadyOnTable = guest.EventTableId == tableId;
        var seatedCount = table.Guests.Count(g => g.Id != guest.Id);
        if (!alreadyOnTable && seatedCount >= table.Capacity)
            return BadRequest(new ProblemDetails { Title = "Table is full." });

        int seatIndex;
        if (request.SeatIndex.HasValue
            && request.SeatIndex.Value >= 0
            && request.SeatIndex.Value < table.Capacity)
        {
            seatIndex = request.SeatIndex.Value;
            var occupant = table.Guests.FirstOrDefault(g =>
                g.SeatIndex == seatIndex && g.Id != guest.Id);
            if (occupant is not null)
            {
                occupant.SeatIndex = NextFreeSeat(table, guest.Id);
            }
        }
        else if (alreadyOnTable && guest.SeatIndex.HasValue)
        {
            seatIndex = guest.SeatIndex.Value;
        }
        else
        {
            seatIndex = NextFreeSeat(table, guest.Id);
            if (seatIndex < 0)
                return BadRequest(new ProblemDetails { Title = "Table is full." });
        }

        guest.EventTableId = tableId;
        guest.SeatIndex = seatIndex;
        await db.SaveChangesAsync();

        return Ok(new
        {
            guest.Id,
            guest.FirstName,
            guest.LastName,
            EventTableId = guest.EventTableId,
            guest.SeatIndex
        });
    }

    [HttpPost("unassign")]
    public async Task<IActionResult> UnassignGuest(Guid eventId, [FromBody] AssignGuestRequest request)
    {
        if (tenantContext.TenantId is null) return Forbid();
        var tenantId = tenantContext.TenantId.Value;

        var gate = await EnsureSeatingAsync(tenantId, eventId);
        if (gate is not null) return gate;

        var guest = await db.Guests.FirstOrDefaultAsync(g =>
            g.Id == request.GuestId && g.EventId == eventId && g.TenantId == tenantId);
        if (guest is null) return NotFound();

        guest.EventTableId = null;
        guest.SeatIndex = null;
        await db.SaveChangesAsync();
        return NoContent();
    }

    [HttpGet("export.xlsx")]
    public async Task<IActionResult> ExportExcel(Guid eventId)
    {
        if (tenantContext.TenantId is null) return Forbid();
        var tenantId = tenantContext.TenantId.Value;

        var gate = await EnsureSeatingAsync(tenantId, eventId);
        if (gate is not null) return gate;

        var evt = await db.Events.FirstOrDefaultAsync(e => e.Id == eventId && e.TenantId == tenantId);
        if (evt is null) return NotFound();

        var tables = await db.EventTables
            .Include(t => t.Guests)
            .Where(t => t.EventId == eventId && t.TenantId == tenantId)
            .OrderBy(t => t.SortOrder)
            .ToListAsync();

        var unassigned = await db.Guests
            .Where(g => g.EventId == eventId && g.TenantId == tenantId && g.EventTableId == null)
            .OrderBy(g => g.LastName)
            .ToListAsync();

        using var workbook = new XLWorkbook();
        var sheet = workbook.Worksheets.Add("Seating");
        sheet.Cell(1, 1).Value = "Table";
        sheet.Cell(1, 2).Value = "Category";
        sheet.Cell(1, 3).Value = "Seat";
        sheet.Cell(1, 4).Value = "FirstName";
        sheet.Cell(1, 5).Value = "LastName";
        sheet.Cell(1, 6).Value = "PlusOnes";

        var row = 2;
        foreach (var table in tables)
        {
            foreach (var g in table.Guests.OrderBy(x => x.SeatIndex).ThenBy(x => x.LastName))
            {
                sheet.Cell(row, 1).Value = table.Name;
                sheet.Cell(row, 2).Value = table.CategoryLabel ?? "";
                sheet.Cell(row, 3).Value = (g.SeatIndex ?? 0) + 1;
                sheet.Cell(row, 4).Value = g.FirstName;
                sheet.Cell(row, 5).Value = g.LastName;
                sheet.Cell(row, 6).Value = g.AllowedPlusOnes;
                row++;
            }
        }

        foreach (var g in unassigned)
        {
            sheet.Cell(row, 1).Value = "Unassigned";
            sheet.Cell(row, 2).Value = "";
            sheet.Cell(row, 3).Value = "";
            sheet.Cell(row, 4).Value = g.FirstName;
            sheet.Cell(row, 5).Value = g.LastName;
            sheet.Cell(row, 6).Value = g.AllowedPlusOnes;
            row++;
        }

        using var stream = new MemoryStream();
        workbook.SaveAs(stream);
        var slug = string.IsNullOrWhiteSpace(evt.Slug) ? evt.Id.ToString("N") : evt.Slug;
        return File(
            stream.ToArray(),
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            $"seating-{slug}.xlsx");
    }

    private static int NextFreeSeat(EventTable table, Guid excludeGuestId)
    {
        var taken = table.Guests
            .Where(g => g.Id != excludeGuestId && g.SeatIndex.HasValue)
            .Select(g => g.SeatIndex!.Value)
            .ToHashSet();
        for (var i = 0; i < table.Capacity; i++)
        {
            if (!taken.Contains(i)) return i;
        }
        return -1;
    }

    private static object MapTable(EventTable table, IEnumerable<Guest> guests) => new
    {
        table.Id,
        table.Name,
        table.CategoryLabel,
        table.Capacity,
        table.SortOrder,
        Guests = guests
            .OrderBy(g => g.SeatIndex)
            .Select(g => new
            {
                g.Id,
                g.FirstName,
                g.LastName,
                g.SeatIndex,
                g.AllowedPlusOnes
            })
            .ToList()
    };

    public record UpsertTableRequest(
        string? Name,
        string? CategoryLabel,
        int? Capacity,
        int? SortOrder);

    public record AssignGuestRequest(Guid GuestId, int? SeatIndex = null);
}
