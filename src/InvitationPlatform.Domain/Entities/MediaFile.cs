using InvitationPlatform.Domain.Common;
using InvitationPlatform.Domain.Enums;

namespace InvitationPlatform.Domain.Entities;

public class MediaFile : BaseEntity, ITenantEntity
{
    public Guid TenantId { get; set; }
    public Guid EventId { get; set; }
    public MediaType MediaType { get; set; }
    public string OriginalFileName { get; set; } = string.Empty;
    public string StoredFileName { get; set; } = string.Empty;
    public string ContentType { get; set; } = string.Empty;
    public long FileSizeBytes { get; set; }
    public string? ThumbnailFileName { get; set; }
    public string? AltText { get; set; }
    public int SortOrder { get; set; }
    public bool IsModerated { get; set; }
    public bool IsFlagged { get; set; }
    /// <summary>Uploaded by a guest via the public QR upload page.</summary>
    public bool IsGuestUpload { get; set; }
    public string? GuestDisplayName { get; set; }

    public Tenant Tenant { get; set; } = null!;
    public Event Event { get; set; } = null!;
}
