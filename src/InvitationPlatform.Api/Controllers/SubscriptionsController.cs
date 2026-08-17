using InvitationPlatform.Application.Common.Interfaces;
using InvitationPlatform.Infrastructure.Persistence;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace InvitationPlatform.Api.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
[Authorize]
public class SubscriptionsController(
    ApplicationDbContext db,
    ITenantContext tenantContext,
    IFeatureEntitlementService entitlements) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        if (tenantContext.TenantId is null) return Forbid();

        var subscriptions = await db.Subscriptions
            .Where(s => s.TenantId == tenantContext.TenantId)
            .Include(s => s.Package)
            .Include(s => s.Event)
            .OrderByDescending(s => s.CreatedAt)
            .Select(s => new
            {
                s.Id,
                s.EventId,
                EventTitle = s.Event.Title,
                s.PackageId,
                PackageName = s.Package.DisplayName,
                PackageTier = s.Package.Tier.ToString(),
                Status = s.Status.ToString(),
                s.PaidAmount,
                s.PaidCurrency,
                s.PaidAt,
                s.ActivatedAt,
                s.ExpiresAt,
                s.CreatedAt
            })
            .ToListAsync();

        return Ok(subscriptions);
    }

    [HttpGet("event/{eventId:guid}")]
    public async Task<IActionResult> GetByEvent(Guid eventId)
    {
        if (tenantContext.TenantId is null) return Forbid();

        var subscription = await db.Subscriptions
            .Where(s => s.TenantId == tenantContext.TenantId && s.EventId == eventId)
            .Include(s => s.Package)
                .ThenInclude(p => p.PackageFeatures)
                    .ThenInclude(pf => pf.Feature)
            .OrderByDescending(s => s.ActivatedAt ?? s.CreatedAt)
            .FirstOrDefaultAsync();

        if (subscription is null) return NotFound();

        return Ok(new
        {
            subscription.Id,
            subscription.EventId,
            subscription.PackageId,
            PackageName = subscription.Package.DisplayName,
            PackageTier = subscription.Package.Tier.ToString(),
            Status = subscription.Status.ToString(),
            subscription.PaidAmount,
            subscription.PaidCurrency,
            subscription.PaidAt,
            subscription.ActivatedAt,
            subscription.ExpiresAt,
            Features = subscription.Package.PackageFeatures.Select(pf => new
            {
                pf.Feature.Key,
                pf.Feature.Name,
                ValueType = pf.Feature.ValueType.ToString(),
                pf.BooleanValue,
                pf.IntegerValue,
                pf.StringValue
            })
        });
    }

    [HttpGet("event/{eventId:guid}/features")]
    public async Task<IActionResult> GetEventFeatures(Guid eventId)
    {
        if (tenantContext.TenantId is null) return Forbid();

        var features = await entitlements.GetEffectiveFeaturesAsync(tenantContext.TenantId.Value, eventId);
        var subscription = await db.Subscriptions
            .Where(s => s.TenantId == tenantContext.TenantId
                        && s.EventId == eventId
                        && s.Status == Domain.Enums.SubscriptionStatus.Active)
            .Include(s => s.Package)
            .OrderByDescending(s => s.ActivatedAt ?? s.CreatedAt)
            .FirstOrDefaultAsync();

        return Ok(new
        {
            hasSubscription = subscription is not null || features.Count > 0,
            packageTier = subscription?.Package.Tier.ToString(),
            packageName = subscription?.Package.DisplayName,
            features = features.ToDictionary(
                kv => kv.Key,
                kv => new
                {
                    kv.Value.BooleanValue,
                    kv.Value.IntegerValue,
                    kv.Value.StringValue,
                    kv.Value.Source
                })
        });
    }
}
