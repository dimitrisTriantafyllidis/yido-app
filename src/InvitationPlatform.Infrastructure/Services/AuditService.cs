using InvitationPlatform.Application.Common.Interfaces;
using InvitationPlatform.Domain.Entities;
using InvitationPlatform.Infrastructure.Persistence;

namespace InvitationPlatform.Infrastructure.Services;

public class AuditService(ApplicationDbContext db) : IAuditService
{
    public async Task LogAsync(
        string action,
        Guid? actorUserId = null,
        Guid? tenantId = null,
        Guid? eventId = null,
        string? entityType = null,
        string? entityId = null,
        string? details = null,
        string? ipAddress = null,
        CancellationToken ct = default)
    {
        db.AuditLogs.Add(new AuditLog
        {
            Id = Guid.NewGuid(),
            Action = action,
            ActorUserId = actorUserId,
            TenantId = tenantId,
            EventId = eventId,
            EntityType = entityType,
            EntityId = entityId,
            Details = details,
            IpAddress = ipAddress
        });
        await db.SaveChangesAsync(ct);
    }
}
