using InvitationPlatform.Domain.Common;
using InvitationPlatform.Domain.Enums;

namespace InvitationPlatform.Domain.Entities;

public class Event : BaseEntity, ITenantEntity, ISoftDeletable
{
    public Guid TenantId { get; set; }
    public string Title { get; set; } = string.Empty;
    public EventType EventType { get; set; }
    public DateTime? EventDate { get; set; }
    public DateTime? EventEndDate { get; set; }
    public string Timezone { get; set; } = "Europe/Athens";
    public EventStatus Status { get; set; } = EventStatus.Draft;
    public string? Slug { get; set; }
    public string Locale { get; set; } = "el";
    public string? CoverImageUrl { get; set; }
    public string? Description { get; set; }
    public string? Settings { get; set; }
    public DateTime? PublishedAt { get; set; }
    public DateTime? ExpiresAt { get; set; }
    public byte[] RowVersion { get; set; } = [];
    public Guid? CreatedBy { get; set; }
    public bool IsDeleted { get; set; }
    public DateTime? DeletedAt { get; set; }

    public Tenant Tenant { get; set; } = null!;
    public ICollection<Venue> Venues { get; set; } = [];
    public ICollection<EventPerson> Persons { get; set; } = [];
    public ICollection<InvitationVersion> InvitationVersions { get; set; } = [];
    public ICollection<GuestGroup> GuestGroups { get; set; } = [];
    public ICollection<Guest> Guests { get; set; } = [];
    public ICollection<Rsvp> Rsvps { get; set; } = [];
    public ICollection<EventTable> Tables { get; set; } = [];
    public ICollection<GuestWish> Wishes { get; set; } = [];
}
