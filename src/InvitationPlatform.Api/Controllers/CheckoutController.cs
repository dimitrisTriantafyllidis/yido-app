using InvitationPlatform.Application.Common.Interfaces;
using InvitationPlatform.Domain.Entities;
using InvitationPlatform.Domain.Enums;
using InvitationPlatform.Infrastructure.Persistence;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace InvitationPlatform.Api.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
[Authorize]
public class CheckoutController(
    ApplicationDbContext db,
    ITenantContext tenantContext,
    IStripeCheckoutService stripe,
    IConfiguration configuration,
    IAuditService audit) : ControllerBase
{
    public record CreateCheckoutRequest(Guid EventId, Guid PackageId);
    public record CreateAddOnCheckoutRequest(Guid EventId, Guid AddOnId);

    [HttpPost("create-session")]
    public async Task<IActionResult> CreateSession([FromBody] CreateCheckoutRequest request)
    {
        if (tenantContext.TenantId is null) return Forbid();

        var ev = await db.Events
            .FirstOrDefaultAsync(e => e.Id == request.EventId && e.TenantId == tenantContext.TenantId);
        if (ev is null) return NotFound(new { title = "Event not found" });

        var package = await db.Packages.FirstOrDefaultAsync(p => p.Id == request.PackageId && p.IsActive);
        if (package is null) return NotFound(new { title = "Package not found" });

        var activeSub = await db.Subscriptions
            .Include(s => s.Package)
            .FirstOrDefaultAsync(s => s.TenantId == tenantContext.TenantId
                                      && s.EventId == request.EventId
                                      && s.Status == SubscriptionStatus.Active);

        var isUpgrade = false;
        if (activeSub is not null)
        {
            if (activeSub.PackageId == package.Id)
                return Conflict(new { title = "Event already has this package active" });
            if (package.Tier <= activeSub.Package.Tier)
                return Conflict(new { title = "Can only upgrade to a higher package tier" });
            isUpgrade = true;
        }

        var subscription = new Subscription
        {
            Id = Guid.NewGuid(),
            TenantId = tenantContext.TenantId.Value,
            EventId = request.EventId,
            PackageId = request.PackageId,
            Status = SubscriptionStatus.Pending,
            PaidAmount = package.PriceAmount,
            PaidCurrency = package.PriceCurrency
        };
        db.Subscriptions.Add(subscription);

        var order = new Order
        {
            Id = Guid.NewGuid(),
            TenantId = tenantContext.TenantId.Value,
            SubscriptionId = subscription.Id,
            RelatedEntityId = request.EventId,
            OrderType = isUpgrade ? OrderType.Upgrade : OrderType.Package,
            Amount = package.PriceAmount,
            Currency = package.PriceCurrency,
            Status = OrderStatus.Pending
        };
        db.Orders.Add(order);
        await db.SaveChangesAsync();

        return await BeginCheckoutAsync(
            order,
            package.DisplayName,
            package.PriceAmount,
            package.StripePriceId,
            request.EventId,
            new Dictionary<string, string>
            {
                ["orderId"] = order.Id.ToString(),
                ["subscriptionId"] = subscription.Id.ToString(),
                ["tenantId"] = tenantContext.TenantId.Value.ToString(),
                ["eventId"] = request.EventId.ToString(),
                ["kind"] = isUpgrade ? "upgrade" : "package"
            },
            subscription);
    }

    [HttpPost("add-on")]
    public async Task<IActionResult> CreateAddOnSession([FromBody] CreateAddOnCheckoutRequest request)
    {
        if (tenantContext.TenantId is null) return Forbid();

        var addOn = await db.AddOnProducts.FirstOrDefaultAsync(a => a.Id == request.AddOnId && a.IsActive);
        if (addOn is null) return NotFound(new { title = "Add-on not found" });

        var evOk = await db.Events.AnyAsync(e => e.Id == request.EventId && e.TenantId == tenantContext.TenantId);
        if (!evOk) return NotFound(new { title = "Event not found" });

        var order = new Order
        {
            Id = Guid.NewGuid(),
            TenantId = tenantContext.TenantId.Value,
            RelatedEntityId = addOn.Id,
            OrderType = OrderType.AddOn,
            Amount = addOn.PriceAmount,
            Currency = addOn.PriceCurrency,
            Status = OrderStatus.Pending
        };
        db.Orders.Add(order);
        await db.SaveChangesAsync();

        // stash event id on subscription id field via RelatedEntityId for add-on product;
        // event id goes in metadata / we store event on order by using a second write:
        // Use StripePaymentIntentId as temporary event id holder before payment — cleaner: metadata only.
        // Persist eventId by encoding in session metadata and also on order notes via RelatedEntityId = addOn,
        // and keep eventId in StripeSessionId until paid... Instead add EventId to order later.
        // Workaround: store eventId in StripePaymentIntentId until paid (cleared on activate).
        order.StripePaymentIntentId = $"event:{request.EventId}";
        await db.SaveChangesAsync();

        return await BeginCheckoutAsync(
            order,
            addOn.DisplayName,
            addOn.PriceAmount,
            addOn.StripePriceId,
            request.EventId,
            new Dictionary<string, string>
            {
                ["orderId"] = order.Id.ToString(),
                ["tenantId"] = tenantContext.TenantId.Value.ToString(),
                ["eventId"] = request.EventId.ToString(),
                ["kind"] = "addon",
                ["addOnId"] = addOn.Id.ToString()
            },
            null);
    }

    private async Task<IActionResult> BeginCheckoutAsync(
        Order order,
        string productName,
        decimal amount,
        string? stripePriceId,
        Guid eventId,
        Dictionary<string, string> metadata,
        Subscription? subscription)
    {
        var frontend = configuration["Frontend:Url"] ?? "http://localhost:3000";
        var apiBase = configuration["Frontend:ApiUrl"] ?? $"{Request.Scheme}://{Request.Host}";
        var successUrl = $"{frontend}/dashboard/events/{eventId}/pricing?checkout=success";
        var cancelUrl = $"{frontend}/dashboard/events/{eventId}/pricing?checkout=cancel";

        if (stripe.IsConfigured)
        {
            var session = order.OrderType == OrderType.AddOn
                ? await stripe.CreateAddOnCheckoutAsync(order.Id, productName, amount, stripePriceId, successUrl, cancelUrl, metadata)
                : await stripe.CreatePackageCheckoutAsync(order.Id, subscription!.Id, productName, amount, stripePriceId, successUrl, cancelUrl, metadata);

            order.StripeSessionId = session.SessionId;
            if (subscription is not null) subscription.StripeSessionId = session.SessionId;
            await db.SaveChangesAsync();
            return Ok(new { orderId = order.Id, subscriptionId = subscription?.Id, status = "pending", checkoutUrl = session.Url });
        }

        order.StripeSessionId = $"dev_{order.Id:N}";
        if (subscription is not null) subscription.StripeSessionId = order.StripeSessionId;
        await db.SaveChangesAsync();

        return Ok(new
        {
            orderId = order.Id,
            subscriptionId = subscription?.Id,
            status = "pending",
            checkoutUrl = $"{apiBase}/api/v1/checkout/dev-complete/{order.Id}",
            message = "Stripe not configured — using development bypass"
        });
    }

    [HttpGet("dev-complete/{orderId:guid}")]
    [AllowAnonymous]
    public async Task<IActionResult> DevComplete(Guid orderId)
    {
        if (!configuration.GetValue("Stripe:AllowDevBypass", true))
            return NotFound();

        var eventId = await ActivateOrderAsync(orderId, "dev_bypass", null);
        if (eventId is null)
            return NotFound(new { title = "Order not found or already paid" });

        return Redirect($"{configuration["Frontend:Url"] ?? "http://localhost:3000"}/dashboard/events/{eventId}/pricing?checkout=success");
    }

    [HttpPost("webhook")]
    [AllowAnonymous]
    public async Task<IActionResult> StripeWebhook()
    {
        using var reader = new StreamReader(Request.Body);
        var json = await reader.ReadToEndAsync();
        var signature = Request.Headers["Stripe-Signature"].ToString();

        var parsed = await stripe.ParseWebhookAsync(json, signature);
        if (parsed is null)
            return BadRequest(new { title = "Invalid webhook signature" });

        if (parsed.EventType is "checkout.session.completed" or "payment_intent.succeeded")
        {
            if (parsed.Metadata.TryGetValue("orderId", out var orderIdStr)
                && Guid.TryParse(orderIdStr, out var orderId))
            {
                await ActivateOrderAsync(orderId, parsed.SessionId, parsed.PaymentIntentId);
            }
        }

        return Ok();
    }

    /// <returns>EventId for redirect, or null if failed.</returns>
    private async Task<Guid?> ActivateOrderAsync(Guid orderId, string? sessionId, string? paymentIntentId)
    {
        var order = await db.Orders.FirstOrDefaultAsync(o => o.Id == orderId);
        if (order is null || order.Status == OrderStatus.Paid) return null;

        Guid? eventId = null;

        if (order.OrderType is OrderType.Package or OrderType.Upgrade)
        {
            var subscription = await db.Subscriptions
                .Include(s => s.Package)
                .FirstOrDefaultAsync(s => s.Id == order.SubscriptionId);
            if (subscription is null) return null;
            eventId = subscription.EventId;

            if (order.OrderType == OrderType.Upgrade)
            {
                var previous = await db.Subscriptions
                    .Where(s => s.TenantId == subscription.TenantId
                                && s.EventId == subscription.EventId
                                && s.Status == SubscriptionStatus.Active
                                && s.Id != subscription.Id)
                    .ToListAsync();
                foreach (var p in previous)
                    p.Status = SubscriptionStatus.Cancelled;
            }

            var months = await db.PackageFeatures
                .Where(pf => pf.PackageId == subscription.PackageId && pf.Feature.Key == "event_duration_months")
                .Select(pf => pf.IntegerValue)
                .FirstOrDefaultAsync();

            subscription.Status = SubscriptionStatus.Active;
            subscription.ActivatedAt = DateTime.UtcNow;
            subscription.PaidAt = DateTime.UtcNow;
            subscription.ExpiresAt = DateTime.UtcNow.AddMonths(months is > 0 ? months.Value : 12);
            if (!string.IsNullOrEmpty(sessionId) && !sessionId.StartsWith("dev_"))
                subscription.StripeSessionId = sessionId;
            if (!string.IsNullOrEmpty(paymentIntentId))
                subscription.StripePaymentIntentId = paymentIntentId;

            var evt = await db.Events.FirstOrDefaultAsync(e => e.Id == subscription.EventId);
            if (evt is not null)
                evt.ExpiresAt = subscription.ExpiresAt;
        }
        else if (order.OrderType == OrderType.AddOn && order.RelatedEntityId is Guid addOnId)
        {
            var addOn = await db.AddOnProducts.FirstOrDefaultAsync(a => a.Id == addOnId);
            if (addOn is null) return null;

            if (order.StripePaymentIntentId?.StartsWith("event:") == true
                && Guid.TryParse(order.StripePaymentIntentId["event:".Length..], out var eid))
            {
                eventId = eid;
            }

            if (eventId is null) return null;

            db.TenantFeatureOverrides.Add(new TenantFeatureOverride
            {
                Id = Guid.NewGuid(),
                TenantId = order.TenantId,
                EventId = eventId,
                FeatureKey = addOn.FeatureKey,
                IntegerValue = addOn.IntegerDelta > 0 ? addOn.IntegerDelta : null,
                BooleanValue = addOn.BooleanValue,
                Reason = $"Purchased add-on {addOn.Key}"
            });
        }

        order.Status = OrderStatus.Paid;
        order.PaidAt = DateTime.UtcNow;
        if (!string.IsNullOrEmpty(sessionId)) order.StripeSessionId = sessionId;
        if (!string.IsNullOrEmpty(paymentIntentId) && !paymentIntentId.StartsWith("event:"))
            order.StripePaymentIntentId = paymentIntentId;
        else if (order.StripePaymentIntentId?.StartsWith("event:") == true)
            order.StripePaymentIntentId = paymentIntentId;

        await db.SaveChangesAsync();
        await audit.LogAsync("checkout.activated", tenantId: order.TenantId, eventId: eventId,
            entityType: "Order", entityId: order.Id.ToString(), details: $"type={order.OrderType}");
        return eventId;
    }
}
