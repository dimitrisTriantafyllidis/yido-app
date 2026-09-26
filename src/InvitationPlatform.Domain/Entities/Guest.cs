using InvitationPlatform.Domain.Common;
using InvitationPlatform.Domain.Enums;

namespace InvitationPlatform.Domain.Entities;

public class Guest : BaseEntity, ITenantEntity, ISoftDeletable
{
    public Guid TenantId { get; set; }
    public Guid EventId { get; set; }
    public Guid? GuestGroupId { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public bool IsCeremonyOnly { get; set; }
    public bool IsReceptionEligible { get; set; } = true;
    public int AllowedPlusOnes { get; set; }
    public string? Tags { get; set; }
    public string? Notes { get; set; }
    /// <summary>Unique token for personalized invitation link (/e/{slug}?t=...).</summary>
    public string InviteToken { get; set; } = Guid.NewGuid().ToString("N");
    
    /// <summary>When the invitation link was last sent to this guest.</summary>
    public DateTime? InvitationSentAt { get; set; }
    /// <summary>How the invitation was sent (Email, SMS, or Manual).</summary>
    public SentVia? InvitationSentVia { get; set; }
    
    public bool IsDeleted { get; set; }
    public DateTime? DeletedAt { get; set; }

    /// <summary>Assigned reception table (seating plan).</summary>
    public Guid? EventTableId { get; set; }
    /// <summary>Seat index around the table (0-based).</summary>
    public int? SeatIndex { get; set; }

    public Event Event { get; set; } = null!;
    public GuestGroup? GuestGroup { get; set; }
    public EventTable? EventTable { get; set; }
    public ICollection<Rsvp> Rsvps { get; set; } = [];
}
