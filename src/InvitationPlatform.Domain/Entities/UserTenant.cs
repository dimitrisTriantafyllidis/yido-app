using InvitationPlatform.Domain.Common;

namespace InvitationPlatform.Domain.Entities;

public class UserTenant : BaseEntity
{
    public Guid UserId { get; set; }
    public Guid TenantId { get; set; }
    public Guid RoleId { get; set; }
    public bool IsOwner { get; set; }
    public DateTime JoinedAt { get; set; } = DateTime.UtcNow;
    public Guid? InvitedBy { get; set; }

    public Tenant Tenant { get; set; } = null!;
}
