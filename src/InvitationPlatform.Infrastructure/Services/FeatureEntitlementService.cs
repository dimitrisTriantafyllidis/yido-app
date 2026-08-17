using InvitationPlatform.Application.Common;
using InvitationPlatform.Application.Common.Interfaces;
using InvitationPlatform.Domain.Enums;
using InvitationPlatform.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace InvitationPlatform.Infrastructure.Services;

public class FeatureEntitlementService(ApplicationDbContext db) : IFeatureEntitlementService
{
    public async Task<IReadOnlyDictionary<string, FeatureEntitlementValue>> GetEffectiveFeaturesAsync(
        Guid tenantId, Guid eventId, CancellationToken ct = default)
    {
        var result = new Dictionary<string, FeatureEntitlementValue>(StringComparer.OrdinalIgnoreCase);

        var subscription = await db.Subscriptions
            .AsNoTracking()
            .Where(s => s.TenantId == tenantId
                        && s.EventId == eventId
                        && s.Status == SubscriptionStatus.Active
                        && (s.ExpiresAt == null || s.ExpiresAt > DateTime.UtcNow))
            .Include(s => s.Package)
                .ThenInclude(p => p.PackageFeatures)
                    .ThenInclude(pf => pf.Feature)
            .OrderByDescending(s => s.ActivatedAt ?? s.CreatedAt)
            .FirstOrDefaultAsync(ct);

        if (subscription is not null)
        {
            foreach (var pf in subscription.Package.PackageFeatures)
            {
                result[pf.Feature.Key] = new FeatureEntitlementValue(
                    pf.BooleanValue, pf.IntegerValue, pf.StringValue, "package");
            }
        }

        var overrides = await db.TenantFeatureOverrides
            .AsNoTracking()
            .Where(o => o.TenantId == tenantId && (o.EventId == null || o.EventId == eventId))
            .OrderBy(o => o.EventId == null ? 0 : 1)
            .ToListAsync(ct);

        foreach (var o in overrides)
        {
            result.TryGetValue(o.FeatureKey, out var existing);
            var intVal = o.IntegerValue;
            if (intVal is not null && existing?.IntegerValue is not null && o.EventId is not null)
                intVal = existing.IntegerValue + o.IntegerValue; // event add-ons accumulate
            else if (intVal is not null && existing?.IntegerValue is not null && o.IntegerValue > 0
                     && existing.Source == "package")
                intVal = existing.IntegerValue + o.IntegerValue;

            result[o.FeatureKey] = new FeatureEntitlementValue(
                o.BooleanValue ?? existing?.BooleanValue,
                intVal ?? existing?.IntegerValue,
                o.StringValue ?? existing?.StringValue,
                "override");
        }

        return result;
    }

    public async Task<bool> HasBooleanFeatureAsync(
        Guid tenantId, Guid eventId, string featureKey, CancellationToken ct = default)
    {
        var features = await GetEffectiveFeaturesAsync(tenantId, eventId, ct);
        return features.TryGetValue(featureKey, out var v) && v.BooleanValue == true;
    }

    public async Task<int> GetIntegerLimitAsync(
        Guid tenantId, Guid eventId, string featureKey, int defaultValue = 0, CancellationToken ct = default)
    {
        var features = await GetEffectiveFeaturesAsync(tenantId, eventId, ct);
        if (!features.TryGetValue(featureKey, out var v) || v.IntegerValue is null)
            return defaultValue;
        return v.IntegerValue.Value;
    }

    public async Task EnsureBooleanFeatureAsync(
        Guid tenantId, Guid eventId, string featureKey, CancellationToken ct = default)
    {
        if (!await HasBooleanFeatureAsync(tenantId, eventId, featureKey, ct))
            throw new EntitlementException($"Feature '{featureKey}' is not included in the active package.");
    }

    public async Task EnsureWithinIntegerLimitAsync(
        Guid tenantId, Guid eventId, string featureKey, int currentCount, CancellationToken ct = default)
    {
        var limit = await GetIntegerLimitAsync(tenantId, eventId, featureKey, 0, ct);
        if (limit < 0) return; // unlimited
        if (currentCount >= limit)
            throw new EntitlementException($"Limit reached for '{featureKey}' ({limit}).");
    }
}
