using System.Security.Claims;
using InvitationPlatform.Application.Common.Interfaces;
using InvitationPlatform.Domain.Entities;
using InvitationPlatform.Domain.Enums;
using InvitationPlatform.Infrastructure.Persistence;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace InvitationPlatform.Api.Controllers;

[ApiController]
[Route("api/v1/admin")]
[Authorize]
public class AdminController(
    ApplicationDbContext db,
    ITenantContext tenantContext,
    UserManager<ApplicationUser> userManager,
    SignInManager<ApplicationUser> signInManager,
    IStripeCheckoutService stripe,
    IAuditService audit) : ControllerBase
{
    private IActionResult? AdminGuard() =>
        tenantContext.IsSystemAdmin ? null : Forbid();

    [HttpGet("dashboard")]
    public async Task<IActionResult> GetDashboard()
    {
        if (AdminGuard() is { } f) return f;

        var totalCustomers = await db.Tenants.CountAsync();
        var activeCustomers = await db.Tenants.CountAsync(t => t.Status == TenantStatus.Active);
        var totalEvents = await db.Events.CountAsync();
        var publishedEvents = await db.Events.CountAsync(e => e.Status == EventStatus.Published);
        var totalRsvps = await db.Rsvps.CountAsync();
        var activeSubscriptions = await db.Subscriptions.CountAsync(s => s.Status == SubscriptionStatus.Active);
        var totalRevenue = await db.Orders
            .Where(o => o.Status == OrderStatus.Paid)
            .SumAsync(o => (decimal?)o.Amount) ?? 0;

        var recentEvents = await db.Events
            .OrderByDescending(e => e.CreatedAt)
            .Take(5)
            .Select(e => new
            {
                e.Id,
                e.Title,
                EventType = e.EventType.ToString(),
                Status = e.Status.ToString(),
                e.CreatedAt,
                TenantName = e.Tenant.Name
            })
            .ToListAsync();

        var recentOrders = await db.Orders
            .OrderByDescending(o => o.CreatedAt)
            .Take(5)
            .Select(o => new
            {
                o.Id,
                o.Amount,
                o.Currency,
                Status = o.Status.ToString(),
                o.CreatedAt,
                TenantName = o.Tenant.Name,
                PackageName = o.Subscription != null ? o.Subscription.Package.DisplayName : null
            })
            .ToListAsync();

        return Ok(new
        {
            totalCustomers,
            activeCustomers,
            totalEvents,
            publishedEvents,
            totalRsvps,
            activeSubscriptions,
            totalRevenue,
            recentEvents,
            recentOrders
        });
    }

    [HttpGet("customers")]
    public async Task<IActionResult> GetCustomers(
        [FromQuery] string? search,
        [FromQuery] string? status,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        if (AdminGuard() is { } f) return f;

        var query = db.Tenants.AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
            query = query.Where(t => t.Name.Contains(search) || t.Slug.Contains(search));

        if (!string.IsNullOrWhiteSpace(status) && Enum.TryParse<TenantStatus>(status, out var s))
            query = query.Where(t => t.Status == s);

        var total = await query.CountAsync();

        var items = await query
            .OrderByDescending(t => t.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(t => new
            {
                t.Id,
                t.Name,
                t.Slug,
                Status = t.Status.ToString(),
                t.Locale,
                t.CreatedAt,
                EventCount = t.Events.Count(e => !e.IsDeleted)
            })
            .ToListAsync();

        return Ok(new { items, total, page, pageSize });
    }

    [HttpGet("customers/{tenantId:guid}")]
    public async Task<IActionResult> GetCustomerDetail(Guid tenantId)
    {
        if (AdminGuard() is { } f) return f;

        var tenant = await db.Tenants
            .Where(t => t.Id == tenantId)
            .Select(t => new
            {
                t.Id,
                t.Name,
                t.Slug,
                Status = t.Status.ToString(),
                t.Locale,
                t.CreatedAt,
                Events = t.Events.Where(e => !e.IsDeleted).Select(e => new
                {
                    e.Id,
                    e.Title,
                    EventType = e.EventType.ToString(),
                    Status = e.Status.ToString(),
                    e.EventDate,
                    e.CreatedAt
                })
            })
            .FirstOrDefaultAsync();

        if (tenant is null) return NotFound();

        var userIds = await db.UserTenants
            .Where(ut => ut.TenantId == tenantId)
            .Select(ut => ut.UserId)
            .ToListAsync();

        var users = await db.Users
            .Where(u => userIds.Contains(u.Id))
            .Select(u => new
            {
                u.Id,
                u.Email,
                u.FirstName,
                u.LastName,
                u.CreatedAt,
                IsOwner = db.UserTenants.Any(ut => ut.UserId == u.Id && ut.TenantId == tenantId && ut.IsOwner)
            })
            .ToListAsync();

        var subscriptions = await db.Subscriptions
            .Where(s => s.TenantId == tenantId)
            .Include(s => s.Package)
            .OrderByDescending(s => s.CreatedAt)
            .Select(s => new
            {
                s.Id,
                s.EventId,
                PackageName = s.Package.DisplayName,
                PackageTier = s.Package.Tier.ToString(),
                Status = s.Status.ToString(),
                s.PaidAmount,
                s.ActivatedAt,
                s.ExpiresAt
            })
            .ToListAsync();

        var overrides = await db.TenantFeatureOverrides
            .Where(o => o.TenantId == tenantId)
            .OrderByDescending(o => o.CreatedAt)
            .Select(o => new
            {
                o.Id,
                o.EventId,
                o.FeatureKey,
                o.BooleanValue,
                o.IntegerValue,
                o.StringValue,
                o.Reason,
                o.CreatedAt
            })
            .ToListAsync();

        return Ok(new
        {
            tenant.Id,
            tenant.Name,
            tenant.Slug,
            tenant.Status,
            tenant.Locale,
            tenant.CreatedAt,
            tenant.Events,
            users,
            subscriptions,
            featureOverrides = overrides
        });
    }

    [HttpPost("customers/{tenantId:guid}/feature-overrides")]
    public async Task<IActionResult> CreateFeatureOverride(Guid tenantId, [FromBody] FeatureOverrideRequest request)
    {
        if (AdminGuard() is { } f) return f;

        if (!await db.Tenants.AnyAsync(t => t.Id == tenantId))
            return NotFound();

        if (string.IsNullOrWhiteSpace(request.FeatureKey))
            return BadRequest(new ProblemDetails { Title = "FeatureKey is required." });

        var entity = new TenantFeatureOverride
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            EventId = request.EventId,
            FeatureKey = request.FeatureKey.Trim(),
            BooleanValue = request.BooleanValue,
            IntegerValue = request.IntegerValue,
            StringValue = request.StringValue,
            Reason = request.Reason,
            GrantedByUserId = tenantContext.UserId
        };
        db.TenantFeatureOverrides.Add(entity);
        await db.SaveChangesAsync();

        await audit.LogAsync(
            "admin.feature_override",
            actorUserId: tenantContext.UserId,
            tenantId: tenantId,
            eventId: request.EventId,
            entityType: "TenantFeatureOverride",
            entityId: entity.Id.ToString(),
            details: request.FeatureKey,
            ipAddress: HttpContext.Connection.RemoteIpAddress?.ToString());

        return Ok(new
        {
            entity.Id,
            entity.FeatureKey,
            entity.BooleanValue,
            entity.IntegerValue,
            entity.StringValue,
            entity.EventId
        });
    }

    /// <summary>
    /// Impersonation sets cookie claim ImpersonatedTenantId. TenantResolutionMiddleware
    /// prefers that claim. Pass stop=true to clear.
    /// </summary>
    [HttpPost("impersonate/{tenantId:guid}")]
    public async Task<IActionResult> Impersonate(Guid tenantId, [FromQuery] bool stop = false)
    {
        if (AdminGuard() is { } f) return f;

        var userId = tenantContext.UserId;
        if (userId is null) return Unauthorized();

        var user = await userManager.FindByIdAsync(userId.Value.ToString());
        if (user is null) return Unauthorized();

        if (stop)
        {
            await signInManager.SignInAsync(user, isPersistent: false);
            await audit.LogAsync("admin.impersonate_stop", actorUserId: userId, tenantId: tenantId,
                ipAddress: HttpContext.Connection.RemoteIpAddress?.ToString());
            return Ok(new { impersonating = false });
        }

        if (!await db.Tenants.AnyAsync(t => t.Id == tenantId))
            return NotFound();

        var principal = await signInManager.CreateUserPrincipalAsync(user);
        if (principal.Identity is ClaimsIdentity identity)
            identity.AddClaim(new Claim("ImpersonatedTenantId", tenantId.ToString()));

        await HttpContext.SignInAsync(
            IdentityConstants.ApplicationScheme,
            principal,
            new Microsoft.AspNetCore.Authentication.AuthenticationProperties { IsPersistent = false });

        await audit.LogAsync(
            "admin.impersonate_start",
            actorUserId: userId,
            tenantId: tenantId,
            ipAddress: HttpContext.Connection.RemoteIpAddress?.ToString());

        return Ok(new { impersonating = true, tenantId });
    }

    [HttpPut("customers/{tenantId:guid}/status")]
    public async Task<IActionResult> UpdateCustomerStatus(Guid tenantId, [FromBody] UpdateStatusRequest request)
    {
        if (AdminGuard() is { } f) return f;

        var tenant = await db.Tenants.FindAsync(tenantId);
        if (tenant is null) return NotFound();

        if (!Enum.TryParse<TenantStatus>(request.Status, out var newStatus))
            return BadRequest(new { message = "Invalid status" });

        tenant.Status = newStatus;
        await db.SaveChangesAsync();

        return Ok(new { status = tenant.Status.ToString() });
    }

    [HttpGet("audit-logs")]
    public async Task<IActionResult> SearchAuditLogs(
        [FromQuery] string? action,
        [FromQuery] Guid? tenantId,
        [FromQuery] Guid? eventId,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 50)
    {
        if (AdminGuard() is { } f) return f;

        page = Math.Max(1, page);
        pageSize = Math.Clamp(pageSize, 1, 200);

        var query = db.AuditLogs.AsQueryable();
        if (!string.IsNullOrWhiteSpace(action))
            query = query.Where(a => a.Action.Contains(action));
        if (tenantId.HasValue)
            query = query.Where(a => a.TenantId == tenantId);
        if (eventId.HasValue)
            query = query.Where(a => a.EventId == eventId);

        var total = await query.CountAsync();
        var items = await query
            .OrderByDescending(a => a.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(a => new
            {
                a.Id,
                a.Action,
                a.ActorUserId,
                a.TenantId,
                a.EventId,
                a.EntityType,
                a.EntityId,
                a.Details,
                a.IpAddress,
                a.CreatedAt
            })
            .ToListAsync();

        return Ok(new { items, total, page, pageSize });
    }

    [HttpPost("audit-logs")]
    public async Task<IActionResult> CreateAuditLog([FromBody] CreateAuditLogRequest request)
    {
        if (AdminGuard() is { } f) return f;

        await audit.LogAsync(
            request.Action,
            actorUserId: tenantContext.UserId,
            tenantId: request.TenantId,
            eventId: request.EventId,
            entityType: request.EntityType,
            entityId: request.EntityId,
            details: request.Details,
            ipAddress: HttpContext.Connection.RemoteIpAddress?.ToString());

        return Ok(new { message = "Logged" });
    }

    [HttpGet("media/moderation")]
    public async Task<IActionResult> GetModerationQueue([FromQuery] int page = 1, [FromQuery] int pageSize = 20)
    {
        if (AdminGuard() is { } f) return f;

        page = Math.Max(1, page);
        pageSize = Math.Clamp(pageSize, 1, 100);

        var query = db.MediaFiles.Where(m => m.IsFlagged || !m.IsModerated);
        var total = await query.CountAsync();
        var items = await query
            .OrderByDescending(m => m.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(m => new
            {
                m.Id,
                m.TenantId,
                m.EventId,
                m.OriginalFileName,
                m.ContentType,
                MediaType = m.MediaType.ToString(),
                m.IsFlagged,
                m.IsModerated,
                m.CreatedAt
            })
            .ToListAsync();

        return Ok(new { items, total, page, pageSize });
    }

    [HttpPost("media/{id:guid}/flag")]
    public async Task<IActionResult> FlagMedia(Guid id)
    {
        if (AdminGuard() is { } f) return f;

        var media = await db.MediaFiles.FindAsync(id);
        if (media is null) return NotFound();

        media.IsFlagged = true;
        await db.SaveChangesAsync();
        await audit.LogAsync("admin.media_flag", actorUserId: tenantContext.UserId,
            tenantId: media.TenantId, eventId: media.EventId,
            entityType: "MediaFile", entityId: id.ToString());
        return Ok(new { media.Id, media.IsFlagged });
    }

    [HttpPost("media/{id:guid}/moderate")]
    public async Task<IActionResult> ModerateMedia(Guid id, [FromBody] ModerateMediaRequest request)
    {
        if (AdminGuard() is { } f) return f;

        var media = await db.MediaFiles.FindAsync(id);
        if (media is null) return NotFound();

        media.IsModerated = true;
        media.IsFlagged = request.KeepFlagged;
        await db.SaveChangesAsync();
        await audit.LogAsync("admin.media_moderate", actorUserId: tenantContext.UserId,
            tenantId: media.TenantId, eventId: media.EventId,
            entityType: "MediaFile", entityId: id.ToString(),
            details: request.KeepFlagged ? "flagged" : "cleared");
        return Ok(new { media.Id, media.IsModerated, media.IsFlagged });
    }

    [HttpGet("events")]
    public async Task<IActionResult> GetEvents(
        [FromQuery] string? search,
        [FromQuery] string? status,
        [FromQuery] string? eventType,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        if (AdminGuard() is { } f) return f;

        var query = db.Events.AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
            query = query.Where(e => e.Title.Contains(search) || (e.Slug != null && e.Slug.Contains(search)));

        if (!string.IsNullOrWhiteSpace(status) && Enum.TryParse<EventStatus>(status, out var s))
            query = query.Where(e => e.Status == s);

        if (!string.IsNullOrWhiteSpace(eventType) && Enum.TryParse<EventType>(eventType, out var et))
            query = query.Where(e => e.EventType == et);

        var total = await query.CountAsync();

        var items = await query
            .OrderByDescending(e => e.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(e => new
            {
                e.Id,
                e.Title,
                EventType = e.EventType.ToString(),
                Status = e.Status.ToString(),
                e.Slug,
                e.EventDate,
                e.CreatedAt,
                TenantName = e.Tenant.Name,
                e.TenantId,
                GuestCount = e.Guests.Count(g => !g.IsDeleted),
                RsvpCount = e.Rsvps.Count
            })
            .ToListAsync();

        return Ok(new { items, total, page, pageSize });
    }

    [HttpPost("events/{eventId:guid}/unpublish")]
    public async Task<IActionResult> UnpublishEvent(Guid eventId)
    {
        if (AdminGuard() is { } f) return f;

        var ev = await db.Events.FindAsync(eventId);
        if (ev is null) return NotFound();

        ev.Status = EventStatus.Draft;
        ev.PublishedAt = null;
        await db.SaveChangesAsync();

        return Ok(new { status = "Draft" });
    }

    [HttpGet("orders")]
    public async Task<IActionResult> GetOrders(
        [FromQuery] string? status,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        if (AdminGuard() is { } f) return f;

        var query = db.Orders.AsQueryable();

        if (!string.IsNullOrWhiteSpace(status) && Enum.TryParse<OrderStatus>(status, out var s))
            query = query.Where(o => o.Status == s);

        var total = await query.CountAsync();

        var items = await query
            .OrderByDescending(o => o.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(o => new
            {
                o.Id,
                o.Amount,
                o.Currency,
                Status = o.Status.ToString(),
                OrderType = o.OrderType.ToString(),
                o.PaidAt,
                o.CreatedAt,
                TenantName = o.Tenant.Name,
                o.TenantId,
                SubscriptionId = o.SubscriptionId
            })
            .ToListAsync();

        return Ok(new { items, total, page, pageSize });
    }

    [HttpPost("orders/{orderId:guid}/refund")]
    public async Task<IActionResult> RefundOrder(Guid orderId)
    {
        if (AdminGuard() is { } f) return f;

        var order = await db.Orders.FindAsync(orderId);
        if (order is null) return NotFound();

        if (order.Status != OrderStatus.Paid)
            return BadRequest(new { message = "Only paid orders can be refunded" });

        if (!string.IsNullOrWhiteSpace(order.StripePaymentIntentId) && stripe.IsConfigured)
            await stripe.RefundAsync(order.StripePaymentIntentId);

        order.Status = OrderStatus.Refunded;
        order.RefundedAt = DateTime.UtcNow;
        await db.SaveChangesAsync();

        await audit.LogAsync("admin.order_refund", actorUserId: tenantContext.UserId,
            tenantId: order.TenantId, entityType: "Order", entityId: orderId.ToString());

        return Ok(new { status = "Refunded" });
    }

    [HttpGet("users")]
    public async Task<IActionResult> GetUsers(
        [FromQuery] string? search,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        if (AdminGuard() is { } f) return f;

        page = Math.Max(1, page);
        pageSize = Math.Clamp(pageSize, 1, 100);

        var query = db.Users.AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim();
            query = query.Where(u =>
                (u.Email != null && u.Email.Contains(term)) ||
                u.FirstName.Contains(term) ||
                u.LastName.Contains(term));
        }

        var total = await query.CountAsync();

        var pageUsers = await query
            .OrderByDescending(u => u.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(u => new
            {
                u.Id,
                u.Email,
                u.FirstName,
                u.LastName,
                u.IsSystemAdmin,
                u.IsDeleted,
                u.LockoutEnd,
                u.CreatedAt,
                TenantCount = db.UserTenants.Count(ut => ut.UserId == u.Id)
            })
            .ToListAsync();

        var userIds = pageUsers.Select(u => u.Id).ToList();
        var rolesByUser = await db.UserRoles
            .Where(ur => userIds.Contains(ur.UserId))
            .Join(db.Roles, ur => ur.RoleId, r => r.Id, (ur, r) => new { ur.UserId, RoleName = r.Name! })
            .ToListAsync();

        var items = pageUsers.Select(u => new
        {
            u.Id,
            u.Email,
            u.FirstName,
            u.LastName,
            u.IsSystemAdmin,
            u.IsDeleted,
            LockoutEnd = u.LockoutEnd,
            u.CreatedAt,
            u.TenantCount,
            Roles = rolesByUser.Where(r => r.UserId == u.Id).Select(r => r.RoleName).ToList()
        });

        return Ok(new { items, total, page, pageSize });
    }

    [HttpGet("users/{userId:guid}")]
    public async Task<IActionResult> GetUserDetail(Guid userId)
    {
        if (AdminGuard() is { } f) return f;

        var user = await db.Users
            .Where(u => u.Id == userId)
            .Select(u => new
            {
                u.Id,
                u.Email,
                u.FirstName,
                u.LastName,
                u.Locale,
                u.IsSystemAdmin,
                u.IsDeleted,
                u.DeletedAt,
                u.LockoutEnd,
                u.AccessFailedCount,
                u.CreatedAt,
                u.UpdatedAt
            })
            .FirstOrDefaultAsync();

        if (user is null) return NotFound();

        var roles = await db.UserRoles
            .Where(ur => ur.UserId == userId)
            .Join(db.Roles, ur => ur.RoleId, r => r.Id, (_, r) => r.Name!)
            .ToListAsync();

        var tenants = await db.UserTenants
            .Where(ut => ut.UserId == userId)
            .Select(ut => new
            {
                ut.TenantId,
                ut.Tenant.Name,
                ut.Tenant.Slug,
                Status = ut.Tenant.Status.ToString(),
                ut.IsOwner,
                ut.JoinedAt
            })
            .ToListAsync();

        return Ok(new
        {
            user.Id,
            user.Email,
            user.FirstName,
            user.LastName,
            user.Locale,
            user.IsSystemAdmin,
            user.IsDeleted,
            user.DeletedAt,
            user.LockoutEnd,
            user.AccessFailedCount,
            user.CreatedAt,
            user.UpdatedAt,
            roles,
            tenants
        });
    }

    [HttpPut("users/{userId:guid}/status")]
    public async Task<IActionResult> UpdateUserStatus(Guid userId, [FromBody] UpdateUserStatusRequest request)
    {
        if (AdminGuard() is { } f) return f;

        var user = await userManager.FindByIdAsync(userId.ToString());
        if (user is null) return NotFound();

        var action = request.Action?.Trim().ToLowerInvariant();
        switch (action)
        {
            case "softdelete":
                if (user.IsSystemAdmin)
                    return BadRequest(new ProblemDetails { Title = "Cannot soft-delete a system admin." });
                user.IsDeleted = true;
                user.DeletedAt = DateTime.UtcNow;
                user.UpdatedAt = DateTime.UtcNow;
                await userManager.UpdateAsync(user);
                break;

            case "restore":
                user.IsDeleted = false;
                user.DeletedAt = null;
                user.UpdatedAt = DateTime.UtcNow;
                await userManager.UpdateAsync(user);
                break;

            case "unlock":
                await userManager.SetLockoutEndDateAsync(user, null);
                await userManager.ResetAccessFailedCountAsync(user);
                break;

            default:
                return BadRequest(new ProblemDetails
                {
                    Title = "Invalid action. Use softDelete, restore, or unlock."
                });
        }

        return Ok(new
        {
            user.Id,
            user.IsDeleted,
            user.DeletedAt,
            LockoutEnd = user.LockoutEnd
        });
    }

    [HttpPut("templates/{templateId:guid}")]
    public async Task<IActionResult> UpdateTemplate(Guid templateId, [FromBody] UpdateTemplateRequest request)
    {
        if (AdminGuard() is { } f) return f;

        var template = await db.InvitationTemplates.FindAsync(templateId);
        if (template is null) return NotFound();

        if (request.Name is not null) template.Name = request.Name;
        if (request.Description is not null) template.Description = request.Description;
        if (request.IsActive.HasValue) template.IsActive = request.IsActive.Value;
        if (request.IsPremium.HasValue) template.IsPremium = request.IsPremium.Value;

        await db.SaveChangesAsync();
        return Ok(new { template.Id, template.Name, template.IsActive, template.IsPremium });
    }

    [HttpPut("packages/{packageId:guid}")]
    public async Task<IActionResult> UpdatePackage(Guid packageId, [FromBody] UpdatePackageRequest request)
    {
        if (AdminGuard() is { } f) return f;

        var package_ = await db.Packages.FindAsync(packageId);
        if (package_ is null) return NotFound();

        if (request.DisplayName is not null) package_.DisplayName = request.DisplayName;
        if (request.Description is not null) package_.Description = request.Description;
        if (request.PriceAmount.HasValue) package_.PriceAmount = request.PriceAmount.Value;
        if (request.IsActive.HasValue) package_.IsActive = request.IsActive.Value;

        await db.SaveChangesAsync();
        return Ok(new { package_.Id, package_.DisplayName, package_.PriceAmount, package_.IsActive });
    }

    public record UpdateStatusRequest(string Status);
    public record UpdateUserStatusRequest(string Action);
    public record UpdateTemplateRequest(string? Name, string? Description, bool? IsActive, bool? IsPremium);
    public record UpdatePackageRequest(string? DisplayName, string? Description, decimal? PriceAmount, bool? IsActive);
    public record FeatureOverrideRequest(
        string FeatureKey,
        Guid? EventId,
        bool? BooleanValue,
        int? IntegerValue,
        string? StringValue,
        string? Reason);
    public record CreateAuditLogRequest(
        string Action,
        Guid? TenantId,
        Guid? EventId,
        string? EntityType,
        string? EntityId,
        string? Details);
    public record ModerateMediaRequest(bool KeepFlagged = false);
}
