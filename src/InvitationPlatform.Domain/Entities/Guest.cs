using InvitationPlatform.Domain.Common;

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
    public bool IsDeleted { get; set; }
    public DateTime? DeletedAt { get; set; }

    public Event Event { get; set; } = null!;
    public GuestGroup? GuestGroup { get; set; }
    public ICollection<Rsvp> Rsvps { get; set; } = [];
}
