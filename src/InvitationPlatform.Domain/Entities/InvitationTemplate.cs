using InvitationPlatform.Domain.Common;
using InvitationPlatform.Domain.Enums;

namespace InvitationPlatform.Domain.Entities;

public class InvitationTemplate : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public EventType EventType { get; set; }
    public string? Category { get; set; }
    public string? PreviewImageUrl { get; set; }
    public bool IsActive { get; set; } = true;
    public bool IsPremium { get; set; }
    public int MinPackageTier { get; set; } = 1;
    public int SortOrder { get; set; }
    public Guid? DefaultThemeId { get; set; }

    public Theme? DefaultTheme { get; set; }
    public ICollection<TemplateSectionDefinition> SectionDefinitions { get; set; } = [];
}
