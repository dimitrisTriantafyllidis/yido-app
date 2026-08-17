using InvitationPlatform.Domain.Common;
using InvitationPlatform.Domain.Enums;

namespace InvitationPlatform.Domain.Entities;

public class Subscription : BaseEntity, ITenantEntity
{
    public Guid TenantId { get; set; }
    public Guid EventId { get; set; }
    public Guid PackageId { get; set; }
    public SubscriptionStatus Status { get; set; } = SubscriptionStatus.Pending;
    public string? StripeSessionId { get; set; }
    public string? StripePaymentIntentId { get; set; }
    public decimal? PaidAmount { get; set; }
    public string? PaidCurrency { get; set; }
    public DateTime? PaidAt { get; set; }
    public DateTime? ActivatedAt { get; set; }
    public DateTime? ExpiresAt { get; set; }

    public Tenant Tenant { get; set; } = null!;
    public Event Event { get; set; } = null!;
    public Package Package { get; set; } = null!;
    public ICollection<Order> Orders { get; set; } = [];
}
