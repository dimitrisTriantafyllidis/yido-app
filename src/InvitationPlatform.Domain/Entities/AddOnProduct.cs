using InvitationPlatform.Domain.Common;

namespace InvitationPlatform.Domain.Entities;

public class AddOnProduct : BaseEntity
{
    public string Key { get; set; } = string.Empty;
    public string DisplayName { get; set; } = string.Empty;
    public string? Description { get; set; }
    public decimal PriceAmount { get; set; }
    public string PriceCurrency { get; set; } = "EUR";
    public string? StripePriceId { get; set; }
    /// <summary>Feature key to bump (e.g. max_guests, max_photos).</summary>
    public string FeatureKey { get; set; } = string.Empty;
    public int IntegerDelta { get; set; }
    public bool? BooleanValue { get; set; }
    public bool IsActive { get; set; } = true;
    public int SortOrder { get; set; }
}
