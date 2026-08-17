using InvitationPlatform.Domain.Common;

namespace InvitationPlatform.Domain.Entities;

public class GuestGroup : BaseEntity, ITenantEntity
{
    public Guid TenantId { get; set; }
    public Guid EventId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string InviteToken { get; set; } = Guid.NewGuid().ToString("N");

    public Event Event { get; set; } = null!;
    public ICollection<Guest> Guests { get; set; } = [];
}
