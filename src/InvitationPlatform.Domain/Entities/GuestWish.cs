using InvitationPlatform.Domain.Common;

namespace InvitationPlatform.Domain.Entities;

public class GuestWish : BaseEntity, ITenantEntity
{
    public Guid TenantId { get; set; }
    public Guid EventId { get; set; }
    public string GuestName { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;

    public Event Event { get; set; } = null!;
}
