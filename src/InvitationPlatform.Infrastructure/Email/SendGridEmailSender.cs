using InvitationPlatform.Application.Common.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using SendGrid;
using SendGrid.Helpers.Mail;

namespace InvitationPlatform.Infrastructure.Email;

public class SendGridEmailSender(IConfiguration configuration, ILogger<SendGridEmailSender> logger) : IEmailSender
{
    public async Task SendAsync(string toEmail, string subject, string htmlBody, CancellationToken ct = default)
    {
        var apiKey = configuration["Email:SendGrid:ApiKey"];
        if (string.IsNullOrWhiteSpace(apiKey))
        {
            throw new InvalidOperationException("SendGrid API key is not configured. Set Email:SendGrid:ApiKey in configuration.");
        }

        var fromEmail = configuration["Email:From"] ?? "noreply@yido.gr";
        var fromName = configuration["Email:FromName"] ?? "YIDO";

        var client = new SendGridClient(apiKey);
        var from = new EmailAddress(fromEmail, fromName);
        var to = new EmailAddress(toEmail);
        var msg = MailHelper.CreateSingleEmail(from, to, subject, plainTextContent: null, htmlContent: htmlBody);

        try
        {
            var response = await client.SendEmailAsync(msg, ct);
            
            if (response.IsSuccessStatusCode)
            {
                logger.LogInformation("SendGrid: Email sent to {To} subject {Subject}", toEmail, subject);
            }
            else
            {
                var body = await response.Body.ReadAsStringAsync(ct);
                logger.LogError("SendGrid: Failed to send email to {To}. Status: {Status}, Body: {Body}", 
                    toEmail, response.StatusCode, body);
                throw new InvalidOperationException($"SendGrid returned {response.StatusCode}: {body}");
            }
        }
        catch (Exception ex) when (ex is not InvalidOperationException)
        {
            logger.LogError(ex, "SendGrid: Exception sending email to {To}", toEmail);
            throw;
        }
    }
}
