using InvitationPlatform.Application.Common.Interfaces;
using InvitationPlatform.Domain.Enums;
using InvitationPlatform.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
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
}

/// <summary>Hangfire-activatable job methods (constructor DI).</summary>
public class HangfireJobRunner(
    ApplicationDbContext db,
    IEmailSender emailSender,
    ILogger<HangfireJobRunner> logger)
{
    public Task ExpireEventsAndSubscriptions() =>
        BackgroundJobs.ExpireEventsAndSubscriptions(db, logger);

    public Task SendRsvpConfirmationEmail(string toEmail, string guestName, string eventTitle, bool attending) =>
        BackgroundJobs.SendRsvpConfirmation(emailSender, toEmail, guestName, eventTitle, attending);

    public Task SendPasswordResetEmail(string toEmail, string resetUrl) =>
        BackgroundJobs.SendPasswordResetEmail(emailSender, toEmail, resetUrl);

    public Task SendEmailVerification(string toEmail, string verifyUrl) =>
        BackgroundJobs.SendEmailVerification(emailSender, toEmail, verifyUrl);
}
