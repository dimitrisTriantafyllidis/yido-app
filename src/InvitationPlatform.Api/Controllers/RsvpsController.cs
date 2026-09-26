using Hangfire;
using InvitationPlatform.Application.Common.Interfaces;
using InvitationPlatform.Domain.Entities;
using InvitationPlatform.Domain.Enums;
using InvitationPlatform.Infrastructure.Jobs;
using InvitationPlatform.Infrastructure.Persistence;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;

namespace InvitationPlatform.Api.Controllers;

[ApiController]
[Route("api/v1/events/{eventId:guid}/rsvps")]
[Authorize]
public class RsvpsController(ApplicationDbContext db, ITenantContext tenantContext) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll(Guid eventId)
    {
        if (tenantContext.TenantId is null) return Forbid();

        var rsvps = await db.Rsvps
            .Include(r => r.Guest)
            .Where(r => r.EventId == eventId && r.TenantId == tenantContext.TenantId)
            .OrderByDescending(r => r.SubmittedAt)
            .Select(r => new
            {
                r.Id,
                GuestName = r.Guest != null
                    ? r.Guest.FirstName + " " + r.Guest.LastName
                    : r.PublicGuestName,
                GuestEmail = r.Guest != null ? r.Guest.Email : r.PublicGuestEmail,
                r.AttendingCeremony,
                r.AttendingReception,
                r.AdultCount,
                r.ChildrenCount,
                r.PlusOneName,
                r.MealPreference,
                r.DietaryNotes,
                r.Notes,
                Source = r.Source.ToString(),
                r.SubmittedAt
            })
            .ToListAsync();

        return Ok(rsvps);
    }

    [HttpGet("statistics")]
    public async Task<IActionResult> Statistics(Guid eventId)
    {
        if (tenantContext.TenantId is null) return Forbid();

        var rsvps = await db.Rsvps
            .Where(r => r.EventId == eventId && r.TenantId == tenantContext.TenantId)
            .ToListAsync();

        var totalGuests = await db.Guests
            .Where(g => g.EventId == eventId && g.TenantId == tenantContext.TenantId)
            .CountAsync();

        var confirmed = rsvps.Where(r => r.AttendingReception == true).ToList();
        var declined = rsvps.Where(r => r.AttendingReception == false).ToList();

        var guestsWithRsvp = await db.Guests
            .Where(g => g.EventId == eventId && g.TenantId == tenantContext.TenantId)
            .Where(g => db.Rsvps.Any(r => r.GuestId == g.Id && r.EventId == eventId))
            .CountAsync();

        var pending = Math.Max(0, totalGuests - guestsWithRsvp);
        var publicRsvps = rsvps.Count(r => r.GuestId == null);

        return Ok(new
        {
            TotalGuests = totalGuests,
            TotalRsvps = rsvps.Count,
            Confirmed = confirmed.Count,
            Declined = declined.Count,
            Pending = pending,
            PublicRsvps = publicRsvps,
            TotalAdults = confirmed.Sum(r => r.AdultCount),
            TotalChildren = confirmed.Sum(r => r.ChildrenCount),
            MealPreferences = confirmed
                .Where(r => r.MealPreference != null)
                .GroupBy(r => r.MealPreference)
                .Select(g => new { Preference = g.Key, Count = g.Count() })
                .ToList()
        });
    }

    [HttpPost]
    public async Task<IActionResult> ManualEntry(Guid eventId, [FromBody] ManualRsvpRequest request)
    {
        if (tenantContext.TenantId is null) return Forbid();

        var rsvp = new Rsvp
        {
            TenantId = tenantContext.TenantId.Value,
            EventId = eventId,
            GuestId = request.GuestId,
            AttendingCeremony = request.AttendingCeremony,
            AttendingReception = request.AttendingReception,
            AdultCount = request.AdultCount,
            ChildrenCount = request.ChildrenCount,
            PlusOneName = request.PlusOneName,
            MealPreference = request.MealPreference,
            Notes = request.Notes,
            Source = RsvpSource.Manual,
            SubmittedAt = DateTime.UtcNow
        };

        db.Rsvps.Add(rsvp);
        await db.SaveChangesAsync();

        return Ok(new { rsvp.Id });
    }
}

[ApiController]
[Route("api/v1/public")]
[AllowAnonymous]
[EnableRateLimiting("public-rsvp")]
public class PublicRsvpController(ApplicationDbContext db, Infrastructure.Services.ITurnstileService turnstile) : ControllerBase
{
    [HttpPost("rsvp")]
    public async Task<IActionResult> SubmitRsvp([FromBody] PublicRsvpRequest request)
    {
        // Verify Turnstile CAPTCHA (if enabled)
        if (turnstile.IsEnabled)
        {
            if (string.IsNullOrWhiteSpace(request.TurnstileToken))
            {
                return BadRequest(new ProblemDetails
                {
                    Title = "CAPTCHA verification required",
                    Detail = "Please complete the CAPTCHA challenge.",
                    Status = StatusCodes.Status400BadRequest
                });
            }

            var (success, errorCode) = await turnstile.VerifyAsync(
                request.TurnstileToken,
                HttpContext.Connection.RemoteIpAddress?.ToString());

            if (!success)
            {
                return BadRequest(new ProblemDetails
                {
                    Title = "CAPTCHA verification failed",
                    Detail = $"Please try again. Error: {errorCode}",
                    Status = StatusCodes.Status400BadRequest
                });
            }
        }

        var evt = await db.Events
            .IgnoreQueryFilters()
            .Where(e => e.Slug == request.EventSlug && e.Status == EventStatus.Published && !e.IsDeleted)
            .FirstOrDefaultAsync();

        if (evt is null)
            return NotFound(new ProblemDetails { Title = "Event not found." });

        Guid? guestId = null;
        string? guestEmail = request.PublicGuestEmail;
        string? guestName = request.PublicGuestName;

        if (!string.IsNullOrWhiteSpace(request.InviteToken))
        {
            var guest = await db.Guests
                .IgnoreQueryFilters()
                .FirstOrDefaultAsync(g => g.EventId == evt.Id && g.InviteToken == request.InviteToken && !g.IsDeleted);
            if (guest is null)
                return BadRequest(new ProblemDetails { Title = "Invalid invite token." });

            var already = await db.Rsvps
                .IgnoreQueryFilters()
                .AnyAsync(r => r.EventId == evt.Id && r.GuestId == guest.Id);
            if (already)
                return Conflict(new ProblemDetails { Title = "This guest has already submitted an RSVP." });

            guestId = guest.Id;
            guestEmail ??= guest.Email;
            guestName ??= $"{guest.FirstName} {guest.LastName}".Trim();
        }

        var updateToken = Guid.NewGuid().ToString("N");

        var rsvp = new Rsvp
        {
            Id = Guid.NewGuid(),
            TenantId = evt.TenantId,
            EventId = evt.Id,
            GuestId = guestId,
            AttendingCeremony = request.AttendingCeremony,
            AttendingReception = request.AttendingReception,
            AdultCount = request.AdultCount,
            ChildrenCount = request.ChildrenCount,
            PlusOneName = request.PlusOneName,
            MealPreference = request.MealPreference,
            DietaryNotes = request.DietaryNotes,
            PublicGuestName = guestName,
            PublicGuestEmail = guestEmail,
            Notes = request.Notes,
            Source = RsvpSource.Online,
            SubmittedAt = DateTime.UtcNow,
            UpdateToken = updateToken,
            IpAddress = HttpContext.Connection.RemoteIpAddress?.ToString(),
            UserAgent = Request.Headers.UserAgent.ToString()
        };

        db.Rsvps.Add(rsvp);

        if (request.Answers is { Count: > 0 })
        {
            var questionIds = request.Answers.Select(a => a.QuestionId).Distinct().ToList();
            var validQuestions = await db.RsvpQuestions
                .IgnoreQueryFilters()
                .Where(q => q.EventId == evt.Id && questionIds.Contains(q.Id))
                .Select(q => q.Id)
                .ToListAsync();

            foreach (var answer in request.Answers.Where(a => validQuestions.Contains(a.QuestionId)))
            {
                db.RsvpAnswers.Add(new RsvpAnswer
                {
                    Id = Guid.NewGuid(),
                    TenantId = evt.TenantId,
                    RsvpId = rsvp.Id,
                    RsvpQuestionId = answer.QuestionId,
                    Value = answer.Value ?? ""
                });
            }
        }

        await db.SaveChangesAsync();

        if (!string.IsNullOrWhiteSpace(guestEmail))
        {
            try
            {
                BackgroundJob.Enqueue<HangfireJobRunner>(j =>
                    j.SendRsvpConfirmationEmail(
                        guestEmail!,
                        guestName ?? "Guest",
                        evt.Title,
                        request.AttendingReception == true));
            }
            catch
            {
                // Hangfire may be unavailable in some test hosts
            }
        }

        return Ok(new { rsvp.Id, updateToken });
    }

    [HttpPut("rsvp/{updateToken}")]
    public async Task<IActionResult> UpdateRsvp(string updateToken, [FromBody] PublicRsvpUpdateRequest request)
    {
        var rsvp = await db.Rsvps
            .IgnoreQueryFilters()
            .Include(r => r.Answers)
            .FirstOrDefaultAsync(r => r.UpdateToken == updateToken);

        if (rsvp is null)
            return NotFound(new ProblemDetails { Title = "RSVP not found." });

        if (request.AttendingCeremony.HasValue)
            rsvp.AttendingCeremony = request.AttendingCeremony;
        if (request.AttendingReception.HasValue)
            rsvp.AttendingReception = request.AttendingReception;
        if (request.AdultCount.HasValue)
            rsvp.AdultCount = request.AdultCount.Value;
        if (request.ChildrenCount.HasValue)
            rsvp.ChildrenCount = request.ChildrenCount.Value;
        if (request.PlusOneName is not null)
            rsvp.PlusOneName = request.PlusOneName;
        if (request.MealPreference is not null)
            rsvp.MealPreference = request.MealPreference;
        if (request.DietaryNotes is not null)
            rsvp.DietaryNotes = request.DietaryNotes;
        if (request.Notes is not null)
            rsvp.Notes = request.Notes;
        if (request.PublicGuestName is not null)
            rsvp.PublicGuestName = request.PublicGuestName;
        if (request.PublicGuestEmail is not null)
            rsvp.PublicGuestEmail = request.PublicGuestEmail;

        if (request.Answers is { Count: > 0 })
        {
            db.RsvpAnswers.RemoveRange(rsvp.Answers);
            foreach (var answer in request.Answers)
            {
                db.RsvpAnswers.Add(new RsvpAnswer
                {
                    Id = Guid.NewGuid(),
                    TenantId = rsvp.TenantId,
                    RsvpId = rsvp.Id,
                    RsvpQuestionId = answer.QuestionId,
                    Value = answer.Value ?? ""
                });
            }
        }

        await db.SaveChangesAsync();
        return Ok(new { rsvp.Id, updateToken });
    }
}

public record ManualRsvpRequest(
    Guid? GuestId,
    bool? AttendingCeremony,
    bool? AttendingReception,
    int AdultCount = 1,
    int ChildrenCount = 0,
    string? PlusOneName = null,
    string? MealPreference = null,
    string? Notes = null
);

public record PublicRsvpAnswerDto(Guid QuestionId, string? Value);

public record PublicRsvpRequest(
    string EventSlug,
    string? InviteToken,
    string? PublicGuestName,
    string? PublicGuestEmail,
    bool? AttendingCeremony,
    bool? AttendingReception,
    int AdultCount = 1,
    int ChildrenCount = 0,
    string? PlusOneName = null,
    string? MealPreference = null,
    string? DietaryNotes = null,
    string? Notes = null,
    List<PublicRsvpAnswerDto>? Answers = null,
    string? TurnstileToken = null
);

public record PublicRsvpUpdateRequest(
    string? PublicGuestName,
    string? PublicGuestEmail,
    bool? AttendingCeremony,
    bool? AttendingReception,
    int? AdultCount,
    int? ChildrenCount,
    string? PlusOneName,
    string? MealPreference,
    string? DietaryNotes,
    string? Notes,
    List<PublicRsvpAnswerDto>? Answers = null
);
