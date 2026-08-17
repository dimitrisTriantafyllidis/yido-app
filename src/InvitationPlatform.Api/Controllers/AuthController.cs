using System.Security.Claims;
using System.Text;
using System.Text.Encodings.Web;
using Hangfire;
using InvitationPlatform.Application.Auth.DTOs;
using InvitationPlatform.Application.Common.Interfaces;
using InvitationPlatform.Domain.Entities;
using InvitationPlatform.Domain.Enums;
using InvitationPlatform.Infrastructure.Jobs;
using InvitationPlatform.Infrastructure.Persistence;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.EntityFrameworkCore;

namespace InvitationPlatform.Api.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
public class AuthController(
    UserManager<ApplicationUser> userManager,
    SignInManager<ApplicationUser> signInManager,
    ApplicationDbContext db,
    IEmailSender emailSender,
    IConfiguration configuration,
    IWebHostEnvironment env,
    ITenantContext tenantContext) : ControllerBase
{
    [HttpPost("register")]
    [EnableRateLimiting("auth")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
            return BadRequest(new ProblemDetails { Title = "Email and password are required." });

        if (string.IsNullOrWhiteSpace(request.FirstName) || string.IsNullOrWhiteSpace(request.LastName))
            return BadRequest(new ProblemDetails { Title = "First name and last name are required." });

        var existingUser = await userManager.FindByEmailAsync(request.Email);
        if (existingUser != null)
            return Conflict(new ProblemDetails { Title = "An account with this email already exists." });

        var user = new ApplicationUser
        {
            UserName = request.Email,
            Email = request.Email,
            FirstName = request.FirstName,
            LastName = request.LastName,
            Locale = request.Locale,
            EmailConfirmed = env.IsDevelopment()
        };

        var result = await userManager.CreateAsync(user, request.Password);
        if (!result.Succeeded)
        {
            return BadRequest(new ProblemDetails
            {
                Title = "Registration failed.",
                Extensions = { ["errors"] = result.Errors.Select(e => e.Description).ToArray() }
            });
        }

        await userManager.AddToRoleAsync(user, "Owner");

        var tenantName = request.OrganizationName ?? $"{request.FirstName} {request.LastName}";
        var slug = GenerateSlug(tenantName);

        var tenant = new Tenant
        {
            Id = Guid.NewGuid(),
            Name = tenantName,
            Slug = slug,
            Status = TenantStatus.Active,
            Locale = request.Locale
        };
        db.Tenants.Add(tenant);

        var ownerRole = await db.Roles.FirstAsync(r => r.Name == "Owner");

        var userTenant = new UserTenant
        {
            Id = Guid.NewGuid(),
            UserId = user.Id,
            TenantId = tenant.Id,
            RoleId = ownerRole.Id,
            IsOwner = true,
            Tenant = tenant
        };
        db.UserTenants.Add(userTenant);

        await db.SaveChangesAsync();

        if (!user.EmailConfirmed)
        {
            var token = await userManager.GenerateEmailConfirmationTokenAsync(user);
            var frontend = configuration["Frontend:Url"] ?? "http://localhost:3000";
            var encoded = WebEncoders.Base64UrlEncode(Encoding.UTF8.GetBytes(token));
            var verifyUrl = $"{frontend.TrimEnd('/')}/verify-email?email={Uri.EscapeDataString(user.Email!)}&token={encoded}";
            try
            {
                BackgroundJob.Enqueue<HangfireJobRunner>(j => j.SendEmailVerification(user.Email!, verifyUrl));
            }
            catch
            {
                await emailSender.SendAsync(user.Email!, "Επιβεβαίωση email — YIDO",
                    $"<p><a href=\"{HtmlEncoder.Default.Encode(verifyUrl)}\">Επιβεβαίωση</a></p>");
            }
        }

        await signInManager.SignInAsync(user, isPersistent: false);

        return Ok(await BuildAuthResponse(user));
    }

    [HttpPost("verify-email")]
    [EnableRateLimiting("auth")]
    public async Task<IActionResult> VerifyEmail([FromBody] VerifyEmailRequest request)
    {
        var user = await userManager.FindByEmailAsync(request.Email);
        if (user is null)
            return BadRequest(new ProblemDetails { Title = "Invalid verification request." });

        string token;
        try
        {
            token = Encoding.UTF8.GetString(WebEncoders.Base64UrlDecode(request.Token));
        }
        catch
        {
            token = request.Token;
        }

        var result = await userManager.ConfirmEmailAsync(user, token);
        if (!result.Succeeded)
            return BadRequest(new ProblemDetails { Title = "Email verification failed." });

        return Ok(new { message = "Email confirmed." });
    }

    [HttpPost("login")]
    [EnableRateLimiting("auth")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
            return BadRequest(new ProblemDetails { Title = "Email and password are required." });

        var user = await userManager.FindByEmailAsync(request.Email);
        if (user == null || user.IsDeleted)
            return Unauthorized(new ProblemDetails { Title = "Invalid email or password." });

        var result = await signInManager.CheckPasswordSignInAsync(user, request.Password, lockoutOnFailure: true);

        if (result.IsLockedOut)
            return Problem("Account is temporarily locked. Please try again later.", statusCode: 429);

        if (!result.Succeeded)
            return Unauthorized(new ProblemDetails { Title = "Invalid email or password." });

        if (await userManager.GetTwoFactorEnabledAsync(user))
        {
            if (string.IsNullOrWhiteSpace(request.MfaCode))
                return Ok(new { requiresMfa = true });

            var valid = await userManager.VerifyTwoFactorTokenAsync(
                user, TokenOptions.DefaultAuthenticatorProvider, request.MfaCode);
            if (!valid)
                return Unauthorized(new ProblemDetails { Title = "Invalid MFA code." });
        }

        await signInManager.SignInAsync(user, isPersistent: request.RememberMe);

        return Ok(await BuildAuthResponse(user));
    }

    [HttpPost("logout")]
    [Authorize]
    public async Task<IActionResult> Logout()
    {
        await signInManager.SignOutAsync();
        return Ok(new { message = "Logged out successfully." });
    }

    [HttpGet("me")]
    [Authorize]
    public async Task<IActionResult> GetCurrentUser()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId == null) return Unauthorized();

        var user = await userManager.FindByIdAsync(userId);
        if (user == null || user.IsDeleted) return Unauthorized();

        return Ok(await BuildAuthResponse(user));
    }

    [HttpPut("me")]
    [Authorize]
    public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileRequest request)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId == null) return Unauthorized();

        var user = await userManager.FindByIdAsync(userId);
        if (user == null) return Unauthorized();

        user.FirstName = request.FirstName;
        user.LastName = request.LastName;
        user.Locale = request.Locale;
        user.UpdatedAt = DateTime.UtcNow;

        await userManager.UpdateAsync(user);

        return Ok(await BuildAuthResponse(user));
    }

    [HttpPost("change-password")]
    [Authorize]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest request)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId == null) return Unauthorized();

        var user = await userManager.FindByIdAsync(userId);
        if (user == null) return Unauthorized();

        var result = await userManager.ChangePasswordAsync(user, request.CurrentPassword, request.NewPassword);
        if (!result.Succeeded)
        {
            return BadRequest(new ProblemDetails
            {
                Title = "Password change failed.",
                Extensions = { ["errors"] = result.Errors.Select(e => e.Description).ToArray() }
            });
        }

        return Ok(new { message = "Password changed successfully." });
    }

    [HttpPost("forgot-password")]
    [EnableRateLimiting("auth")]
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequest request)
    {
        var user = await userManager.FindByEmailAsync(request.Email);
        if (user != null)
        {
            var token = await userManager.GeneratePasswordResetTokenAsync(user);
            var frontend = configuration["Frontend:Url"] ?? "http://localhost:3000";
            var encoded = WebEncoders.Base64UrlEncode(Encoding.UTF8.GetBytes(token));
            var resetUrl =
                $"{frontend.TrimEnd('/')}/reset-password?email={Uri.EscapeDataString(user.Email!)}&token={encoded}";

            try
            {
                BackgroundJob.Enqueue<HangfireJobRunner>(j => j.SendPasswordResetEmail(user.Email!, resetUrl));
            }
            catch
            {
                await emailSender.SendAsync(user.Email!, "Επαναφορά κωδικού — YIDO",
                    $"<p><a href=\"{HtmlEncoder.Default.Encode(resetUrl)}\">Επαναφορά</a></p>");
            }
        }

        return Ok(new { message = "If the email exists, a password reset link has been sent." });
    }

    [HttpPost("reset-password")]
    [EnableRateLimiting("auth")]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequest request)
    {
        var user = await userManager.FindByEmailAsync(request.Email);
        if (user == null)
            return BadRequest(new ProblemDetails { Title = "Invalid reset request." });

        string token;
        try
        {
            token = Encoding.UTF8.GetString(WebEncoders.Base64UrlDecode(request.Token));
        }
        catch
        {
            token = request.Token;
        }

        var result = await userManager.ResetPasswordAsync(user, token, request.NewPassword);
        if (!result.Succeeded)
        {
            return BadRequest(new ProblemDetails
            {
                Title = "Password reset failed.",
                Extensions = { ["errors"] = result.Errors.Select(e => e.Description).ToArray() }
            });
        }

        return Ok(new { message = "Password has been reset successfully." });
    }

    [HttpPost("invite")]
    [Authorize]
    public async Task<IActionResult> Invite([FromBody] InviteUserRequest request)
    {
        if (tenantContext.TenantId is null) return Forbid();

        var isOwner = await db.UserTenants.AnyAsync(ut =>
            ut.UserId == tenantContext.UserId && ut.TenantId == tenantContext.TenantId && ut.IsOwner);
        if (!isOwner && !tenantContext.IsSystemAdmin)
            return Forbid();

        if (string.IsNullOrWhiteSpace(request.Email))
            return BadRequest(new ProblemDetails { Title = "Email is required." });

        var roleName = string.IsNullOrWhiteSpace(request.Role) ? "Editor" : request.Role;
        var role = await db.Roles.FirstOrDefaultAsync(r => r.Name == roleName);
        if (role is null)
            return BadRequest(new ProblemDetails { Title = $"Role '{roleName}' not found." });

        var inviteToken = Guid.NewGuid().ToString("N");
        // Store pending invite as audit detail + claim-less token in AuditLogs for simplicity
        await db.AuditLogs.AddAsync(new AuditLog
        {
            Id = Guid.NewGuid(),
            ActorUserId = tenantContext.UserId,
            TenantId = tenantContext.TenantId,
            Action = "auth.invite_created",
            EntityType = "Invite",
            EntityId = inviteToken,
            Details = $"{request.Email}|{role.Id}|{roleName}"
        });
        await db.SaveChangesAsync();

        var frontend = configuration["Frontend:Url"] ?? "http://localhost:3000";
        var acceptUrl =
            $"{frontend.TrimEnd('/')}/accept-invite?token={inviteToken}&email={Uri.EscapeDataString(request.Email)}";

        try
        {
            await emailSender.SendAsync(request.Email, "Πρόσκληση — YIDO",
                $"<p>Σας προσκάλεσαν στο YIDO.</p><p><a href=\"{HtmlEncoder.Default.Encode(acceptUrl)}\">Αποδοχή</a></p>");
        }
        catch
        {
            // ignore send failures in dev without SMTP
        }

        return Ok(new { inviteToken, acceptUrl });
    }

    [HttpPost("accept-invite")]
    [EnableRateLimiting("auth")]
    public async Task<IActionResult> AcceptInvite([FromBody] AcceptInviteRequest request)
    {
        var invite = await db.AuditLogs
            .Where(a => a.Action == "auth.invite_created" && a.EntityId == request.Token)
            .OrderByDescending(a => a.CreatedAt)
            .FirstOrDefaultAsync();

        if (invite is null || invite.TenantId is null || string.IsNullOrWhiteSpace(invite.Details))
            return BadRequest(new ProblemDetails { Title = "Invalid or expired invite." });

        var parts = invite.Details.Split('|');
        if (parts.Length < 2 || !Guid.TryParse(parts[1], out var roleId))
            return BadRequest(new ProblemDetails { Title = "Invalid invite payload." });

        var email = parts[0];
        if (!string.Equals(email, request.Email, StringComparison.OrdinalIgnoreCase))
            return BadRequest(new ProblemDetails { Title = "Email does not match invite." });

        var user = await userManager.FindByEmailAsync(email);
        if (user is null)
        {
            if (string.IsNullOrWhiteSpace(request.Password) || string.IsNullOrWhiteSpace(request.FirstName))
                return BadRequest(new ProblemDetails { Title = "New users must provide name and password." });

            user = new ApplicationUser
            {
                UserName = email,
                Email = email,
                FirstName = request.FirstName,
                LastName = request.LastName ?? "",
                EmailConfirmed = true
            };
            var create = await userManager.CreateAsync(user, request.Password);
            if (!create.Succeeded)
                return BadRequest(new ProblemDetails { Title = "Could not create account." });
        }

        var exists = await db.UserTenants.AnyAsync(ut => ut.UserId == user.Id && ut.TenantId == invite.TenantId);
        if (!exists)
        {
            db.UserTenants.Add(new UserTenant
            {
                Id = Guid.NewGuid(),
                UserId = user.Id,
                TenantId = invite.TenantId.Value,
                RoleId = roleId,
                IsOwner = false
            });
            await db.SaveChangesAsync();
        }

        invite.Action = "auth.invite_accepted";
        await db.SaveChangesAsync();

        await signInManager.SignInAsync(user, isPersistent: false);
        return Ok(await BuildAuthResponse(user));
    }

    [HttpPost("mfa/enable")]
    [Authorize]
    public async Task<IActionResult> EnableMfa()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId == null) return Unauthorized();
        var user = await userManager.FindByIdAsync(userId);
        if (user == null) return Unauthorized();

        await userManager.ResetAuthenticatorKeyAsync(user);
        var key = await userManager.GetAuthenticatorKeyAsync(user);
        var email = user.Email ?? user.UserName ?? "user";
        var otpauth =
            $"otpauth://totp/YIDO:{Uri.EscapeDataString(email)}?secret={key}&issuer=YIDO&digits=6";

        return Ok(new { sharedKey = key, authenticatorUri = otpauth });
    }

    [HttpPost("mfa/verify")]
    [Authorize]
    public async Task<IActionResult> VerifyMfa([FromBody] MfaVerifyRequest request)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId == null) return Unauthorized();
        var user = await userManager.FindByIdAsync(userId);
        if (user == null) return Unauthorized();

        var valid = await userManager.VerifyTwoFactorTokenAsync(
            user, TokenOptions.DefaultAuthenticatorProvider, request.Code);
        if (!valid)
            return BadRequest(new ProblemDetails { Title = "Invalid MFA code." });

        await userManager.SetTwoFactorEnabledAsync(user, true);
        return Ok(new { enabled = true });
    }

    private async Task<AuthResponse> BuildAuthResponse(ApplicationUser user)
    {
        var userTenant = await db.UserTenants
            .Include(ut => ut.Tenant)
            .Where(ut => ut.UserId == user.Id)
            .OrderByDescending(ut => ut.IsOwner)
            .ThenBy(ut => ut.JoinedAt)
            .FirstOrDefaultAsync();

        TenantInfo? tenantInfo = null;
        if (userTenant != null)
        {
            var role = await db.Roles.FindAsync(userTenant.RoleId);
            tenantInfo = new TenantInfo(
                userTenant.TenantId,
                userTenant.Tenant.Name,
                userTenant.Tenant.Slug,
                role?.Name ?? "Owner",
                userTenant.IsOwner
            );
        }

        return new AuthResponse(
            user.Id,
            user.Email!,
            user.FirstName,
            user.LastName,
            user.Locale,
            user.IsSystemAdmin,
            tenantInfo
        );
    }

    private static string GenerateSlug(string name)
    {
        var slug = name.ToLowerInvariant()
            .Replace(" & ", "-")
            .Replace("&", "-")
            .Replace(" ", "-");

        var cleaned = System.Text.RegularExpressions.Regex.Replace(slug, @"[^a-z0-9\-]", "");
        cleaned = System.Text.RegularExpressions.Regex.Replace(cleaned, @"-+", "-").Trim('-');

        if (string.IsNullOrEmpty(cleaned))
            cleaned = Guid.NewGuid().ToString("N")[..8];

        return cleaned + "-" + Guid.NewGuid().ToString("N")[..6];
    }
}

public record VerifyEmailRequest(string Email, string Token);
public record InviteUserRequest(string Email, string? Role);
public record AcceptInviteRequest(string Token, string Email, string? Password, string? FirstName, string? LastName);
public record MfaVerifyRequest(string Code);
