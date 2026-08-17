namespace InvitationPlatform.Domain.Entities;

public class PackageFeature
{
    public Guid PackageId { get; set; }
    public Guid FeatureId { get; set; }
    public bool? BooleanValue { get; set; }
    public int? IntegerValue { get; set; }
    public string? StringValue { get; set; }

    public Package Package { get; set; } = null!;
    public Feature Feature { get; set; } = null!;
}
