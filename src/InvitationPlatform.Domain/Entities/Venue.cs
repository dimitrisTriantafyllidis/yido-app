using InvitationPlatform.Domain.Common;
using InvitationPlatform.Domain.Enums;

namespace InvitationPlatform.Domain.Entities;

public class Venue : BaseEntity, ITenantEntity
{
    public Guid TenantId { get; set; }
    public Guid EventId { get; set; }
    public string Name { get; set; } = string.Empty;
    public VenueType VenueType { get; set; }
    public string? Address { get; set; }
    public string? City { get; set; }
    public string? GoogleMapsUrl { get; set; }
    public decimal? Latitude { get; set; }
    public decimal? Longitude { get; set; }
    public TimeOnly? Time { get; set; }
    public string? Notes { get; set; }
    public int SortOrder { get; set; }

    public Event Event { get; set; } = null!;
}
