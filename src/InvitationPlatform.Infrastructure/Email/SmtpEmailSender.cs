using System.Net;
using System.Net.Mail;
using InvitationPlatform.Application.Common.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace InvitationPlatform.Infrastructure.Email;

public class SmtpEmailSender(IConfiguration configuration, ILogger<SmtpEmailSender> logger) : IEmailSender
{
    public async Task SendAsync(string toEmail, string subject, string htmlBody, CancellationToken ct = default)
    {
        var host = configuration["Email:SmtpHost"] ?? "localhost";
        var port = configuration.GetValue("Email:SmtpPort", 1025);
        var from = configuration["Email:From"] ?? "noreply@yido.local";
        var user = configuration["Email:SmtpUser"];
        var pass = configuration["Email:SmtpPassword"];

        using var client = new SmtpClient(host, port)
        {
            EnableSsl = configuration.GetValue("Email:UseSsl", false),
            DeliveryMethod = SmtpDeliveryMethod.Network
        };

        if (!string.IsNullOrWhiteSpace(user))
            client.Credentials = new NetworkCredential(user, pass);

        using var message = new MailMessage(from, toEmail, subject, htmlBody) { IsBodyHtml = true };
        try
        {
            await client.SendMailAsync(message, ct);
            logger.LogInformation("Email sent to {To} subject {Subject}", toEmail, subject);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to send email to {To}", toEmail);
            throw;
        }
    }
}
