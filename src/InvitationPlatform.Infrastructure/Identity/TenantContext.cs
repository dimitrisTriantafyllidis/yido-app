using InvitationPlatform.Application.Common.Interfaces;

namespace InvitationPlatform.Infrastructure.Identity;

public class TenantContext : ITenantContext
{
    public Guid? TenantId { get; set; }
    public Guid? UserId { get; set; }
    public bool IsAuthenticated { get; set; }
    public bool IsSystemAdmin { get; set; }
}
