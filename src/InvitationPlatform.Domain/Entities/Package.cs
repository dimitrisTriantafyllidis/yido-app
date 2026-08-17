using InvitationPlatform.Domain.Common;
using InvitationPlatform.Domain.Enums;

namespace InvitationPlatform.Domain.Entities;

public class Package : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string DisplayName { get; set; } = string.Empty;
    public string? Description { get; set; }
    public PackageTier Tier { get; set; }
    public decimal PriceAmount { get; set; }
    public string PriceCurrency { get; set; } = "EUR";
    public string? StripePriceId { get; set; }
    public bool IsActive { get; set; } = true;
    public int SortOrder { get; set; }
    public string? Settings { get; set; }

    public ICollection<PackageFeature> PackageFeatures { get; set; } = [];
}
