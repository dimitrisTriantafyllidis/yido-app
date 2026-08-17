using InvitationPlatform.Domain.Common;

namespace InvitationPlatform.Domain.Entities;

public class RsvpQuestion : BaseEntity, ITenantEntity
{
    public Guid TenantId { get; set; }
    public Guid EventId { get; set; }
    public string Prompt { get; set; } = string.Empty;
    /// <summary>text | select | multi_select | yes_no</summary>
    public string QuestionType { get; set; } = "text";
    public string? OptionsJson { get; set; }
    public bool IsRequired { get; set; }
    public int SortOrder { get; set; }

    public Event Event { get; set; } = null!;
    public ICollection<RsvpAnswer> Answers { get; set; } = [];
}
