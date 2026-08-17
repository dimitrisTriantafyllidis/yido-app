using InvitationPlatform.Domain.Common;
using InvitationPlatform.Domain.Enums;

namespace InvitationPlatform.Domain.Entities;

public class Rsvp : BaseEntity, ITenantEntity
{
    public Guid TenantId { get; set; }
    public Guid EventId { get; set; }
    public Guid? GuestId { get; set; }
    public bool? AttendingCeremony { get; set; }
    public bool? AttendingReception { get; set; }
    public int AdultCount { get; set; } = 1;
    public int ChildrenCount { get; set; }
    public string? PlusOneName { get; set; }
    public string? MealPreference { get; set; }
    public string? DietaryNotes { get; set; }
    public string? PublicGuestName { get; set; }
    public string? PublicGuestEmail { get; set; }
    public string? Notes { get; set; }
    public RsvpSource Source { get; set; } = RsvpSource.Online;
    public DateTime SubmittedAt { get; set; } = DateTime.UtcNow;
    public string? UpdateToken { get; set; }
    public string? IpAddress { get; set; }
    public string? UserAgent { get; set; }
    public byte[] RowVersion { get; set; } = [];

    public Event Event { get; set; } = null!;
    public Guest? Guest { get; set; }
    public ICollection<RsvpAnswer> Answers { get; set; } = [];
}
