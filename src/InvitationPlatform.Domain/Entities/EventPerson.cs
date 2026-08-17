using InvitationPlatform.Domain.Common;
using InvitationPlatform.Domain.Enums;

namespace InvitationPlatform.Domain.Entities;

public class EventPerson : BaseEntity, ITenantEntity
{
    public Guid TenantId { get; set; }
    public Guid EventId { get; set; }
    public EventPersonRole Role { get; set; }
    public string DisplayName { get; set; } = string.Empty;
    public PersonSide? Side { get; set; }
    public string? PhotoUrl { get; set; }
    public int SortOrder { get; set; }

    public Event Event { get; set; } = null!;
}
