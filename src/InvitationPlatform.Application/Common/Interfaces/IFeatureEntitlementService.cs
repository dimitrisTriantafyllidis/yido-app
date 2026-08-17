namespace InvitationPlatform.Application.Common.Interfaces;

public interface IFeatureEntitlementService
{
    Task<IReadOnlyDictionary<string, FeatureEntitlementValue>> GetEffectiveFeaturesAsync(
        Guid tenantId, Guid eventId, CancellationToken ct = default);

    Task<bool> HasBooleanFeatureAsync(Guid tenantId, Guid eventId, string featureKey, CancellationToken ct = default);

    Task<int> GetIntegerLimitAsync(Guid tenantId, Guid eventId, string featureKey, int defaultValue = 0, CancellationToken ct = default);

    Task EnsureBooleanFeatureAsync(Guid tenantId, Guid eventId, string featureKey, CancellationToken ct = default);

    Task EnsureWithinIntegerLimitAsync(Guid tenantId, Guid eventId, string featureKey, int currentCount, CancellationToken ct = default);
}

public sealed record FeatureEntitlementValue(
    bool? BooleanValue,
    int? IntegerValue,
    string? StringValue,
    string Source);
