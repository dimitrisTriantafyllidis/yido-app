using InvitationPlatform.Domain.Common;

namespace InvitationPlatform.Domain.Entities;

/// <summary>Reception seating table for an event (Video / max package feature).</summary>
public class EventTable : BaseEntity, ITenantEntity
{
    public Guid TenantId { get; set; }
    public Guid EventId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? CategoryLabel { get; set; }
    public int Capacity { get; set; } = 8;
    public int SortOrder { get; set; }

    public Event Event { get; set; } = null!;
    public ICollection<Guest> Guests { get; set; } = [];
}
