using InvitationPlatform.Application.Common.Interfaces;
using InvitationPlatform.Domain.Enums;
using InvitationPlatform.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace InvitationPlatform.Infrastructure.Jobs;

public static class BackgroundJobs
{
    public static async Task ExpireEventsAndSubscriptions(
        ApplicationDbContext db,
        ILogger? logger = null,
        CancellationToken ct = default)
    {
        var now = DateTime.UtcNow;

        var expiredSubs = await db.Subscriptions
            .Where(s => s.Status == SubscriptionStatus.Active
                        && s.ExpiresAt != null
                        && s.ExpiresAt < now)
            .ToListAsync(ct);

        foreach (var sub in expiredSubs)
            sub.Status = SubscriptionStatus.Expired;

        var expiredEvents = await db.Events
            .Where(e => e.Status == EventStatus.Published
                        && e.ExpiresAt != null
                        && e.ExpiresAt < now)
            .ToListAsync(ct);

        foreach (var ev in expiredEvents)
            ev.Status = EventStatus.Expired;

        if (expiredSubs.Count > 0 || expiredEvents.Count > 0)
        {
            await db.SaveChangesAsync(ct);
            logger?.LogInformation(
                "Expired {Subs} subscriptions and {Events} events",
                expiredSubs.Count, expiredEvents.Count);
        }
    }

    public static async Task SendRsvpConfirmation(
        IEmailSender emailSender,
        string toEmail,
        string guestName,
        string eventTitle,
        bool attending,
        CancellationToken ct = default)
    {
        var status = attending ? "επιβεβαιώθηκε" : "καταχωρήθηκε (μη παρουσία)";
        var html = $"""
            <p>Γεια σας {System.Net.WebUtility.HtmlEncode(guestName)},</p>
            <p>Το RSVP σας για <strong>{System.Net.WebUtility.HtmlEncode(eventTitle)}</strong> {status}.</p>
            <p>— YIDO</p>
            """;
        await emailSender.SendAsync(toEmail, $"RSVP — {eventTitle}", html, ct);
    }

    public static async Task SendPasswordResetEmail(
        IEmailSender emailSender,
        string toEmail,
        string resetUrl,
        CancellationToken ct = default)
    {
        var html = $"""
            <p>Λάβαμε αίτημα επαναφοράς κωδικού.</p>
            <p><a href="{System.Net.WebUtility.HtmlEncode(resetUrl)}">Επαναφορά κωδικού</a></p>
            <p>Αν δεν κάνατε εσείς το αίτημα, αγνοήστε αυτό το email.</p>
            """;
        await emailSender.SendAsync(toEmail, "Επαναφορά κωδικού — YIDO", html, ct);
    }

    public static async Task SendEmailVerification(
        IEmailSender emailSender,
        string toEmail,
        string verifyUrl,
        CancellationToken ct = default)
    {
        var html = $"""
            <p>Καλωσήρθατε στο YIDO.</p>
            <p><a href="{System.Net.WebUtility.HtmlEncode(verifyUrl)}">Επιβεβαίωση email</a></p>
            """;
        await emailSender.SendAsync(toEmail, "Επιβεβαίωση email — YIDO", html, ct);
    }

    public static async Task SendInvitationEmail(
        ApplicationDbContext db,
        IEmailSender emailSender,
        string frontendUrl,
        Guid guestId,
        ILogger? logger = null,
        CancellationToken ct = default)
    {
        var guest = await db.Guests
            .Include(g => g.Event)
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(g => g.Id == guestId && !g.IsDeleted, ct);

        if (guest is null)
        {
            logger?.LogWarning("SendInvitationEmail: Guest {GuestId} not found", guestId);
            return;
        }

        if (string.IsNullOrWhiteSpace(guest.Email))
        {
            logger?.LogWarning("SendInvitationEmail: Guest {GuestId} has no email", guestId);
            return;
        }

        var evt = guest.Event;
        if (evt is null || evt.IsDeleted || string.IsNullOrWhiteSpace(evt.Slug))
        {
            logger?.LogWarning("SendInvitationEmail: Event for guest {GuestId} not published or deleted", guestId);
            return;
        }

        var invitationUrl = $"{frontendUrl.TrimEnd('/')}/e/{evt.Slug}?t={guest.InviteToken}";
        var guestName = $"{guest.FirstName} {guest.LastName}".Trim();
        var eventTitle = evt.Title;
        var eventDate = evt.EventDate?.ToString("dd MMMM yyyy", new System.Globalization.CultureInfo("el-GR")) ?? "";

        var html = $"""
            <!DOCTYPE html>
            <html lang="el">
            <head><meta charset="UTF-8"></head>
            <body style="font-family: 'Segoe UI', Tahoma, sans-serif; line-height: 1.6; color: #1A1A18; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="text-align: center; margin-bottom: 30px;">
                    <h1 style="color: #2E5A4C; margin: 0; font-size: 24px;">Πρόσκληση</h1>
                </div>
                <p>Αγαπητέ/ή {System.Net.WebUtility.HtmlEncode(guestName)},</p>
                <p>Σας προσκαλούμε στο <strong>{System.Net.WebUtility.HtmlEncode(eventTitle)}</strong>{(string.IsNullOrEmpty(eventDate) ? "" : $" στις {eventDate}")}.</p>
                <p>Για να δείτε την πρόσκληση και να δηλώσετε συμμετοχή, πατήστε τον παρακάτω σύνδεσμο:</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="{System.Net.WebUtility.HtmlEncode(invitationUrl)}" 
                       style="display: inline-block; background-color: #2E5A4C; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 500;">
                        Δείτε την πρόσκληση
                    </a>
                </div>
                <p style="color: #5C5A54; font-size: 14px;">Αυτός ο σύνδεσμος είναι προσωπικός για εσάς.</p>
                <hr style="border: none; border-top: 1px solid #E8E5E0; margin: 30px 0;">
                <p style="color: #9C9A94; font-size: 12px; text-align: center;">— YIDO</p>
            </body>
            </html>
            """;

        await emailSender.SendAsync(guest.Email, $"Πρόσκληση — {eventTitle}", html, ct);

        guest.InvitationSentAt = DateTime.UtcNow;
        guest.InvitationSentVia = SentVia.Email;
        await db.SaveChangesAsync(ct);

        logger?.LogInformation("Sent invitation email to guest {GuestId} ({Email})", guestId, guest.Email);
    }
}

/// <summary>Hangfire-activatable job methods (constructor DI).</summary>
public class HangfireJobRunner(
    ApplicationDbContext db,
    IEmailSender emailSender,
    IConfiguration configuration,
    ILogger<HangfireJobRunner> logger)
{
    private string FrontendUrl => configuration["Frontend:Url"] ?? "http://localhost:3000";

    public Task ExpireEventsAndSubscriptions() =>
        BackgroundJobs.ExpireEventsAndSubscriptions(db, logger);

    public Task SendRsvpConfirmationEmail(string toEmail, string guestName, string eventTitle, bool attending) =>
        BackgroundJobs.SendRsvpConfirmation(emailSender, toEmail, guestName, eventTitle, attending);

    public Task SendPasswordResetEmail(string toEmail, string resetUrl) =>
        BackgroundJobs.SendPasswordResetEmail(emailSender, toEmail, resetUrl);

    public Task SendEmailVerification(string toEmail, string verifyUrl) =>
        BackgroundJobs.SendEmailVerification(emailSender, toEmail, verifyUrl);

    public Task SendInvitationEmail(Guid guestId) =>
        BackgroundJobs.SendInvitationEmail(db, emailSender, FrontendUrl, guestId, logger);
}
