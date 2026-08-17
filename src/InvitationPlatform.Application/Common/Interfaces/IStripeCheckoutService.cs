namespace InvitationPlatform.Application.Common.Interfaces;

public interface IStripeCheckoutService
{
    bool IsConfigured { get; }

    Task<StripeCheckoutSessionResult> CreatePackageCheckoutAsync(
        Guid orderId,
        Guid subscriptionId,
        string packageName,
        decimal amountEur,
        string? stripePriceId,
        string successUrl,
        string cancelUrl,
        IDictionary<string, string> metadata,
        CancellationToken ct = default);

    Task<StripeCheckoutSessionResult> CreateAddOnCheckoutAsync(
        Guid orderId,
        string addOnName,
        decimal amountEur,
        string? stripePriceId,
        string successUrl,
        string cancelUrl,
        IDictionary<string, string> metadata,
        CancellationToken ct = default);

    Task<StripeWebhookResult?> ParseWebhookAsync(string json, string signatureHeader, CancellationToken ct = default);

    Task RefundAsync(string paymentIntentId, CancellationToken ct = default);
}

public sealed record StripeCheckoutSessionResult(string SessionId, string Url);

public sealed record StripeWebhookResult(
    string EventType,
    string? SessionId,
    string? PaymentIntentId,
    IReadOnlyDictionary<string, string> Metadata);
