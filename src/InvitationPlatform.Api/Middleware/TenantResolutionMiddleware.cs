using System.Security.Claims;
using InvitationPlatform.Application.Common.Interfaces;
using InvitationPlatform.Infrastructure.Identity;
using InvitationPlatform.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace InvitationPlatform.Api.Middleware;

public class TenantResolutionMiddleware(RequestDelegate next)
{
    public async Task InvokeAsync(HttpContext context, ITenantContext tenantContext, ApplicationDbContext db)
    {
        if (context.User.Identity?.IsAuthenticated == true)
        {
            var tc = (TenantContext)tenantContext;
            var userIdClaim = context.User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (Guid.TryParse(userIdClaim, out var userId))
            {
                tc.UserId = userId;
                tc.IsAuthenticated = true;

                var isAdmin = context.User.IsInRole("Admin");
                tc.IsSystemAdmin = isAdmin;

                var impersonated = context.User.FindFirstValue("ImpersonatedTenantId");
                if (isAdmin && Guid.TryParse(impersonated, out var impersonatedTenantId))
                {
                    tc.TenantId = impersonatedTenantId;
                }
                else
                {
                    var userTenant = await db.Set<Domain.Entities.UserTenant>()
                        .Where(ut => ut.UserId == userId)
                        .OrderByDescending(ut => ut.IsOwner)
                        .ThenBy(ut => ut.JoinedAt)
                        .FirstOrDefaultAsync();

                    if (userTenant != null)
                        tc.TenantId = userTenant.TenantId;
                }
            }
        }

        await next(context);
    }
}
