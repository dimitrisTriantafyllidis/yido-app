using InvitationPlatform.Domain.Common;

namespace InvitationPlatform.Domain.Entities;

public class TemplateSectionDefinition : BaseEntity
{
    public Guid TemplateId { get; set; }
    public string SectionType { get; set; } = string.Empty;
    public int DefaultSortOrder { get; set; }
    public bool IsRequired { get; set; }
    public bool IsEnabledByDefault { get; set; } = true;
    public string? DefaultConfigJson { get; set; }
    public int MinPackageTier { get; set; } = 1;

    public InvitationTemplate Template { get; set; } = null!;
}
