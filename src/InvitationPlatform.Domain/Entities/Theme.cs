using InvitationPlatform.Domain.Common;

namespace InvitationPlatform.Domain.Entities;

public class Theme : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string DisplayFontFamily { get; set; } = "Literata";
    public string BodyFontFamily { get; set; } = "Inter";
    public string PrimaryColor { get; set; } = "#2E5A4C";
    public string SecondaryColor { get; set; } = "#FAFAF7";
    public string AccentColor { get; set; } = "#2E5A4C";
    public string BackgroundColor { get; set; } = "#FAFAF7";
    public string TextColor { get; set; } = "#1A1A18";
    public string SurfaceColor { get; set; } = "#FFFFFF";
    public string BorderRadius { get; set; } = "8px";
    public bool IsActive { get; set; } = true;
    public bool IsPremium { get; set; }
    public string? PreviewImageUrl { get; set; }
}
