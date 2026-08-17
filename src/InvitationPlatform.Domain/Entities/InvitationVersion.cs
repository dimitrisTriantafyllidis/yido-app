using InvitationPlatform.Domain.Common;

namespace InvitationPlatform.Domain.Entities;

public class InvitationVersion : BaseEntity, ITenantEntity
{
    public Guid TenantId { get; set; }
    public Guid EventId { get; set; }
    public Guid TemplateId { get; set; }
    public Guid? ThemeId { get; set; }
    public int VersionNumber { get; set; } = 1;
    public bool IsPublished { get; set; }
    public DateTime? PublishedAt { get; set; }
    public byte[] RowVersion { get; set; } = [];

    public Tenant Tenant { get; set; } = null!;
    public Event Event { get; set; } = null!;
    public InvitationTemplate Template { get; set; } = null!;
    public Theme? Theme { get; set; }
    public ICollection<InvitationSection> Sections { get; set; } = [];
}
