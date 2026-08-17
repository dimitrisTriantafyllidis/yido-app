using InvitationPlatform.Domain.Common;
using InvitationPlatform.Domain.Enums;

namespace InvitationPlatform.Domain.Entities;

public class Order : BaseEntity, ITenantEntity
{
    public Guid TenantId { get; set; }
    public Guid? SubscriptionId { get; set; }
    public OrderType OrderType { get; set; }
    public decimal Amount { get; set; }
    public string Currency { get; set; } = "EUR";
    public OrderStatus Status { get; set; } = OrderStatus.Pending;
    public string? StripeSessionId { get; set; }
    public string? StripePaymentIntentId { get; set; }
    /// <summary>For add-on orders: AddOnProduct Id.</summary>
    public Guid? RelatedEntityId { get; set; }
    public DateTime? PaidAt { get; set; }
    public DateTime? RefundedAt { get; set; }

    public Tenant Tenant { get; set; } = null!;
    public Subscription? Subscription { get; set; }
}
