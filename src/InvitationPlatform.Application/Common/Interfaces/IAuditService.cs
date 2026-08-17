namespace InvitationPlatform.Application.Common.Interfaces;

public interface IAuditService
{
    Task LogAsync(
        string action,
        Guid? actorUserId = null,
        Guid? tenantId = null,
        Guid? eventId = null,
        string? entityType = null,
        string? entityId = null,
        string? details = null,
        string? ipAddress = null,
        CancellationToken ct = default);
}
