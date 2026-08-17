using InvitationPlatform.Domain.Common;

namespace InvitationPlatform.Domain.Entities;

public class InvitationSection : BaseEntity, ITenantEntity
{
    public Guid TenantId { get; set; }
    public Guid InvitationVersionId { get; set; }
    public string SectionType { get; set; } = string.Empty;
    public int SortOrder { get; set; }
    public bool IsEnabled { get; set; } = true;
    public string? ConfigurationJson { get; set; }
    public byte[] RowVersion { get; set; } = [];

    public InvitationVersion InvitationVersion { get; set; } = null!;
}
