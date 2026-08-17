using InvitationPlatform.Domain.Common;

namespace InvitationPlatform.Domain.Entities;

public class RsvpAnswer : BaseEntity, ITenantEntity
{
    public Guid TenantId { get; set; }
    public Guid RsvpId { get; set; }
    public Guid RsvpQuestionId { get; set; }
    public string Value { get; set; } = string.Empty;

    public Rsvp Rsvp { get; set; } = null!;
    public RsvpQuestion Question { get; set; } = null!;
}
