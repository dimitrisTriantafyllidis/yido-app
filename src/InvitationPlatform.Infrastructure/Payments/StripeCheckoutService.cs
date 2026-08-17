using InvitationPlatform.Application.Common.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Stripe;
using Stripe.Checkout;

namespace InvitationPlatform.Infrastructure.Payments;

public class StripeCheckoutService(IConfiguration configuration, ILogger<StripeCheckoutService> logger) : IStripeCheckoutService
{
    private string? SecretKey => configuration["Stripe:SecretKey"];
    private string? WebhookSecret => configuration["Stripe:WebhookSecret"];

    public bool IsConfigured =>
        !string.IsNullOrWhiteSpace(SecretKey)
        && !SecretKey.StartsWith("sk_test_REPLACE", StringComparison.OrdinalIgnoreCase)
        && SecretKey.StartsWith("sk_", StringComparison.OrdinalIgnoreCase);

    public async Task<StripeCheckoutSessionResult> CreatePackageCheckoutAsync(
        Guid orderId,
        Guid subscriptionId,
        string packageName,
        decimal amountEur,
        string? stripePriceId,
        string successUrl,
        string cancelUrl,
        IDictionary<string, string> metadata,
        CancellationToken ct = default)
    {
        return await CreateSessionAsync(orderId, packageName, amountEur, stripePriceId, successUrl, cancelUrl, metadata, ct);
    }

    public async Task<StripeCheckoutSessionResult> CreateAddOnCheckoutAsync(
        Guid orderId,
        string addOnName,
        decimal amountEur,
        string? stripePriceId,
        string successUrl,
        string cancelUrl,
        IDictionary<string, string> metadata,
        CancellationToken ct = default)
    {
        return await CreateSessionAsync(orderId, addOnName, amountEur, stripePriceId, successUrl, cancelUrl, metadata, ct);
    }

    private async Task<StripeCheckoutSessionResult> CreateSessionAsync(
        Guid orderId,
        string productName,
        decimal amountEur,
        string? stripePriceId,
        string successUrl,
        string cancelUrl,
        IDictionary<string, string> metadata,
        CancellationToken ct)
    {
        StripeConfiguration.ApiKey = SecretKey;
        var options = new SessionCreateOptions
        {
            Mode = "payment",
            SuccessUrl = successUrl,
            CancelUrl = cancelUrl,
            ClientReferenceId = orderId.ToString(),
            Metadata = new Dictionary<string, string>(metadata)
            {
                ["orderId"] = orderId.ToString()
            },
            LineItems = string.IsNullOrWhiteSpace(stripePriceId)
                ?
                [
                    new SessionLineItemOptions
                    {
                        Quantity = 1,
                        PriceData = new SessionLineItemPriceDataOptions
                        {
                            Currency = "eur",
                            UnitAmount = (long)(amountEur * 100),
                            ProductData = new SessionLineItemPriceDataProductDataOptions
                            {
                                Name = productName
                            }
                        }
                    }
                ]
                :
                [
                    new SessionLineItemOptions
                    {
                        Quantity = 1,
                        Price = stripePriceId
                    }
                ]
        };

        var service = new SessionService();
        var session = await service.CreateAsync(options, cancellationToken: ct);
        return new StripeCheckoutSessionResult(session.Id, session.Url);
    }

    public Task<StripeWebhookResult?> ParseWebhookAsync(string json, string signatureHeader, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(WebhookSecret))
        {
            logger.LogWarning("Stripe webhook secret not configured");
            return Task.FromResult<StripeWebhookResult?>(null);
        }

        try
        {
            var stripeEvent = EventUtility.ConstructEvent(json, signatureHeader, WebhookSecret);
            var metadata = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
            string? sessionId = null;
            string? paymentIntentId = null;

            if (stripeEvent.Data.Object is Session session)
            {
                sessionId = session.Id;
                paymentIntentId = session.PaymentIntentId;
                if (session.Metadata is not null)
                {
                    foreach (var kv in session.Metadata)
                        metadata[kv.Key] = kv.Value;
                }
            }
            else if (stripeEvent.Data.Object is PaymentIntent pi)
            {
                paymentIntentId = pi.Id;
                if (pi.Metadata is not null)
                {
                    foreach (var kv in pi.Metadata)
                        metadata[kv.Key] = kv.Value;
                }
            }

            return Task.FromResult<StripeWebhookResult?>(
                new StripeWebhookResult(stripeEvent.Type, sessionId, paymentIntentId, metadata));
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to parse Stripe webhook");
            return Task.FromResult<StripeWebhookResult?>(null);
        }
    }

    public async Task RefundAsync(string paymentIntentId, CancellationToken ct = default)
    {
        if (!IsConfigured) throw new InvalidOperationException("Stripe is not configured.");
        StripeConfiguration.ApiKey = SecretKey;
        var service = new RefundService();
        await service.CreateAsync(new RefundCreateOptions { PaymentIntent = paymentIntentId }, cancellationToken: ct);
    }
}
