using InvitationPlatform.Domain.Common;
using InvitationPlatform.Domain.Enums;

namespace InvitationPlatform.Domain.Entities;

public class Tenant : BaseEntity, ISoftDeletable
{
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public TenantStatus Status { get; set; } = TenantStatus.Active;
    public string Locale { get; set; } = "el";
    public string? Settings { get; set; }
    public byte[] RowVersion { get; set; } = [];
    public bool IsDeleted { get; set; }
    public DateTime? DeletedAt { get; set; }

    public ICollection<Event> Events { get; set; } = [];
}
