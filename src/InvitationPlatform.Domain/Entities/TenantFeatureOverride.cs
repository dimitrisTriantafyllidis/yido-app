using InvitationPlatform.Domain.Common;

namespace InvitationPlatform.Domain.Entities;

public class TenantFeatureOverride : BaseEntity, ITenantEntity
{
    public Guid TenantId { get; set; }
    public Guid? EventId { get; set; }
    public string FeatureKey { get; set; } = string.Empty;
    public bool? BooleanValue { get; set; }
    public int? IntegerValue { get; set; }
    public string? StringValue { get; set; }
    public string? Reason { get; set; }
    public Guid? GrantedByUserId { get; set; }

    public Tenant Tenant { get; set; } = null!;
    public Event? Event { get; set; }
}
