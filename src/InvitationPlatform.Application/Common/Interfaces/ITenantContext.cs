namespace InvitationPlatform.Application.Common.Interfaces;

public interface ITenantContext
{
    Guid? TenantId { get; }
    Guid? UserId { get; }
    bool IsAuthenticated { get; }
    bool IsSystemAdmin { get; }
}
