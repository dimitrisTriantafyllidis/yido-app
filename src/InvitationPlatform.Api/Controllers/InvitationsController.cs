using InvitationPlatform.Application.Common;
using InvitationPlatform.Application.Common.Interfaces;
using InvitationPlatform.Domain.Entities;
using InvitationPlatform.Domain.Enums;
using InvitationPlatform.Infrastructure.Persistence;
using InvitationPlatform.Infrastructure.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace InvitationPlatform.Api.Controllers;

[ApiController]
[Route("api/v1/events/{eventId:guid}/invitation")]
[Authorize]
public class InvitationsController(
    ApplicationDbContext db,
    ITenantContext tenantContext,
    IFileStorageService fileStorage,
    IFeatureEntitlementService entitlements) : ControllerBase
{
    /// <summary>Get the current invitation (latest version) for an event.</summary>
    [HttpGet]
    public async Task<IActionResult> Get(Guid eventId)
    {
        if (tenantContext.TenantId is null) return Forbid();

        var version = await db.InvitationVersions
            .Include(v => v.Template)
            .Include(v => v.Theme)
            .Include(v => v.Sections.OrderBy(s => s.SortOrder))
            .Where(v => v.EventId == eventId && v.TenantId == tenantContext.TenantId)
            .OrderByDescending(v => v.VersionNumber)
            .FirstOrDefaultAsync();

        if (version is null) return NotFound();

        return Ok(MapVersion(version));
    }

    /// <summary>Initialize an invitation by selecting a template.</summary>
    [HttpPost]
    public async Task<IActionResult> Create(Guid eventId, [FromBody] CreateInvitationRequest request)
    {
        if (tenantContext.TenantId is null) return Forbid();

        var evt = await db.Events
            .Where(e => e.Id == eventId && e.TenantId == tenantContext.TenantId)
            .FirstOrDefaultAsync();
        if (evt is null) return NotFound();

        var existing = await db.InvitationVersions
            .AnyAsync(v => v.EventId == eventId && v.TenantId == tenantContext.TenantId);
        if (existing) return Conflict(new { title = "An invitation already exists for this event." });

        var template = await db.InvitationTemplates
            .Include(t => t.SectionDefinitions.OrderBy(s => s.DefaultSortOrder))
            .Where(t => t.Id == request.TemplateId && t.IsActive)
            .FirstOrDefaultAsync();
        if (template is null) return BadRequest(new { title = "Template not found." });

        var themeId = request.ThemeId ?? template.DefaultThemeId;

        var version = new InvitationVersion
        {
            Id = Guid.NewGuid(),
            TenantId = tenantContext.TenantId.Value,
            EventId = eventId,
            TemplateId = template.Id,
            ThemeId = themeId,
            VersionNumber = 1,
            IsPublished = false
        };
        db.InvitationVersions.Add(version);

        foreach (var def in template.SectionDefinitions)
        {
            db.InvitationSections.Add(new InvitationSection
            {
                Id = Guid.NewGuid(),
                TenantId = tenantContext.TenantId.Value,
                InvitationVersionId = version.Id,
                SectionType = def.SectionType,
                SortOrder = def.DefaultSortOrder,
                IsEnabled = def.IsEnabledByDefault,
                ConfigurationJson = def.DefaultConfigJson
            });
        }

        await db.SaveChangesAsync();

        var created = await db.InvitationVersions
            .Include(v => v.Template)
            .Include(v => v.Theme)
            .Include(v => v.Sections.OrderBy(s => s.SortOrder))
            .FirstAsync(v => v.Id == version.Id);

        return CreatedAtAction(nameof(Get), new { eventId }, MapVersion(created));
    }

    [HttpPut("slug")]
    public async Task<IActionResult> UpdateSlug(Guid eventId, [FromBody] UpdateSlugRequest request)
    {
        if (tenantContext.TenantId is null) return Forbid();
        var tenantId = tenantContext.TenantId.Value;

        var evt = await db.Events
            .FirstOrDefaultAsync(e => e.Id == eventId && e.TenantId == tenantId);
        if (evt is null) return NotFound();

        try
        {
            await entitlements.EnsureBooleanFeatureAsync(tenantId, eventId, "custom_slug");
        }
        catch (EntitlementException ex)
        {
            return StatusCode(StatusCodes.Status403Forbidden, new ProblemDetails
            {
                Title = ex.Message,
                Status = StatusCodes.Status403Forbidden
            });
        }

        var slug = (request.Slug ?? "").Trim().ToLowerInvariant();
        slug = System.Text.RegularExpressions.Regex.Replace(slug, @"[^a-z0-9\-]", "");
        slug = System.Text.RegularExpressions.Regex.Replace(slug, @"-+", "-").Trim('-');
        if (string.IsNullOrEmpty(slug) || slug.Length < 3)
            return BadRequest(new ProblemDetails { Title = "Slug must be at least 3 characters (a-z, 0-9, -)." });

        var taken = await db.Events.IgnoreQueryFilters()
            .AnyAsync(e => e.Slug == slug && e.Id != eventId);
        if (taken)
            return Conflict(new ProblemDetails { Title = "This slug is already in use." });

        evt.Slug = slug;
        await db.SaveChangesAsync();
        return Ok(new { evt.Id, evt.Slug });
    }

    [HttpPatch("theme")]
    public async Task<IActionResult> UpdateTheme(Guid eventId, [FromBody] UpdateThemeRequest request)
    {
        if (tenantContext.TenantId is null) return Forbid();

        var version = await EnsureEditableDraftAsync(eventId);
        if (version is null) return NotFound();

        var theme = await db.Themes.FindAsync(request.ThemeId);
        if (theme is null || !theme.IsActive)
            return BadRequest(new { title = "Theme not found." });

        version.ThemeId = request.ThemeId;
        await db.SaveChangesAsync();

        return Ok(new { version.Id, themeId = version.ThemeId, version.VersionNumber, version.IsPublished });
    }

    [HttpPut("sections/{sectionId:guid}")]
    public async Task<IActionResult> UpdateSection(Guid eventId, Guid sectionId, [FromBody] UpdateSectionRequest request)
    {
        if (tenantContext.TenantId is null) return Forbid();

        var section = await db.InvitationSections
            .Include(s => s.InvitationVersion)
            .Where(s => s.Id == sectionId
                && s.TenantId == tenantContext.TenantId
                && s.InvitationVersion.EventId == eventId)
            .FirstOrDefaultAsync();

        if (section is null) return NotFound();

        // If editing a published version, clone a new draft first
        if (section.InvitationVersion.IsPublished)
        {
            var draft = await CloneAsDraftAsync(section.InvitationVersion);
            section = draft.Sections.First(s =>
                s.SectionType == section.SectionType && s.SortOrder == section.SortOrder);
        }

        if (request.IsEnabled.HasValue)
            section.IsEnabled = request.IsEnabled.Value;
        if (request.SortOrder.HasValue)
            section.SortOrder = request.SortOrder.Value;
        if (request.ConfigurationJson is not null)
            section.ConfigurationJson = request.ConfigurationJson;

        await db.SaveChangesAsync();

        return Ok(new
        {
            section.Id,
            section.SectionType,
            section.SortOrder,
            section.IsEnabled,
            section.ConfigurationJson,
            InvitationVersionId = section.InvitationVersionId
        });
    }

    [HttpPut("sections/reorder")]
    public async Task<IActionResult> ReorderSections(Guid eventId, [FromBody] ReorderSectionsRequest request)
    {
        if (tenantContext.TenantId is null) return Forbid();

        var version = await EnsureEditableDraftAsync(eventId);
        if (version is null) return NotFound();

        await db.Entry(version).Collection(v => v.Sections).LoadAsync();

        foreach (var item in request.SectionOrders)
        {
            var section = version.Sections.FirstOrDefault(s => s.Id == item.SectionId);
            if (section != null)
                section.SortOrder = item.SortOrder;
        }

        await db.SaveChangesAsync();
        return Ok(new { message = "Sections reordered.", version.VersionNumber });
    }

    [HttpPost("publish")]
    public async Task<IActionResult> Publish(Guid eventId)
    {
        if (tenantContext.TenantId is null) return Forbid();
        var tenantId = tenantContext.TenantId.Value;

        var evt = await db.Events
            .FirstOrDefaultAsync(e => e.Id == eventId && e.TenantId == tenantId);
        if (evt is null) return NotFound();

        var features = await entitlements.GetEffectiveFeaturesAsync(tenantId, eventId);
        var hasActiveSub = await db.Subscriptions.AnyAsync(s =>
            s.TenantId == tenantId
            && s.EventId == eventId
            && s.Status == SubscriptionStatus.Active
            && (s.ExpiresAt == null || s.ExpiresAt > DateTime.UtcNow));

        if (!hasActiveSub && features.Count == 0)
        {
            return StatusCode(StatusCodes.Status403Forbidden, new ProblemDetails
            {
                Title = "An active subscription is required to publish.",
                Status = StatusCodes.Status403Forbidden
            });
        }

        var version = await GetLatestVersion(eventId);
        if (version is null)
            return NotFound(new ProblemDetails
            {
                Title = "No invitation draft found. Select a template in the editor first."
            });

        version.IsPublished = true;
        version.PublishedAt = DateTime.UtcNow;

        evt.Status = EventStatus.Published;
        evt.PublishedAt ??= DateTime.UtcNow;
        if (string.IsNullOrWhiteSpace(evt.Slug))
            evt.Slug = await GenerateUniqueEventSlug(evt.Title);

        await db.SaveChangesAsync();

        return Ok(new
        {
            version.Id,
            version.IsPublished,
            version.PublishedAt,
            EventStatus = evt.Status.ToString(),
            evt.Slug,
            QrPath = $"/api/v1/events/{eventId}/qr"
        });
    }

    /// <summary>Public endpoint: get the published invitation for rendering.</summary>
    [HttpGet("/api/v1/invitations/by-slug/{slug}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetPublishedBySlug(string slug, [FromQuery(Name = "t")] string? inviteToken)
    {
        var evt = await db.Events
            .Include(e => e.Venues.OrderBy(v => v.SortOrder))
            .Include(e => e.Persons.OrderBy(p => p.SortOrder))
            .Where(e => e.Slug == slug && e.Status == EventStatus.Published)
            .FirstOrDefaultAsync();

        if (evt is null) return NotFound();

        var version = await db.InvitationVersions
            .Include(v => v.Template)
            .Include(v => v.Theme)
            .Include(v => v.Sections.OrderBy(s => s.SortOrder))
            .Where(v => v.EventId == evt.Id && v.IsPublished)
            .OrderByDescending(v => v.VersionNumber)
            .FirstOrDefaultAsync();

        if (version is null) return NotFound();

        Guest? guest = null;
        if (!string.IsNullOrWhiteSpace(inviteToken))
        {
            guest = await db.Guests
                .FirstOrDefaultAsync(g => g.EventId == evt.Id && g.InviteToken == inviteToken);
        }

        var venues = evt.Venues.AsEnumerable();
        if (guest is { IsCeremonyOnly: true })
        {
            venues = venues.Where(v =>
                v.VenueType is not VenueType.Reception and not VenueType.Party);
        }

        var media = await db.MediaFiles
            .Where(m => m.EventId == evt.Id && !m.IsFlagged
                        && (!m.IsGuestUpload || m.IsModerated))
            .OrderBy(m => m.SortOrder)
            .ThenByDescending(m => m.CreatedAt)
            .ToListAsync();

        var questions = await db.RsvpQuestions
            .Where(q => q.EventId == evt.Id)
            .OrderBy(q => q.SortOrder)
            .Select(q => new
            {
                q.Id,
                q.Prompt,
                q.QuestionType,
                q.OptionsJson,
                q.IsRequired,
                q.SortOrder
            })
            .ToListAsync();

        return Ok(new
        {
            Event = new
            {
                evt.Id,
                evt.Title,
                EventType = evt.EventType.ToString(),
                evt.EventDate,
                evt.Slug,
                evt.Locale,
                evt.Description,
                CoverImageUrl = evt.CoverImageUrl != null
                    ? (evt.CoverImageUrl.StartsWith("http")
                        ? evt.CoverImageUrl
                        : fileStorage.GetFileUrl(evt.CoverImageUrl))
                    : media.FirstOrDefault(m => m.MediaType == MediaType.Image && !m.IsGuestUpload) is { } cover
                        ? fileStorage.GetFileUrl(cover.StoredFileName)
                        : null,
                Venues = venues.Select(v => new
                {
                    v.Id, v.Name,
                    VenueType = v.VenueType.ToString(),
                    v.Address, v.City, v.GoogleMapsUrl,
                    Time = v.Time.HasValue ? v.Time.Value.ToString("HH:mm") : null
                }),
                Persons = evt.Persons.Select(p => new
                {
                    p.Id,
                    Role = p.Role.ToString(),
                    p.DisplayName,
                    Side = p.Side?.ToString(),
                    PhotoUrl = p.PhotoUrl != null ? fileStorage.GetFileUrl(p.PhotoUrl) : null
                })
            },
            Invitation = MapVersion(version),
            Media = media.Select(m => new
            {
                m.Id,
                MediaType = m.MediaType.ToString(),
                m.ContentType,
                m.AltText,
                m.SortOrder,
                Url = fileStorage.GetFileUrl(m.StoredFileName),
                ThumbnailUrl = m.ThumbnailFileName != null ? fileStorage.GetFileUrl(m.ThumbnailFileName) : null
            }),
            Guest = guest == null ? null : new
            {
                guest.Id,
                guest.FirstName,
                guest.LastName,
                guest.IsCeremonyOnly,
                guest.InviteToken
            },
            RsvpQuestions = questions,
            QrUrl = $"/api/v1/events/{evt.Id}/qr"
        });
    }

    private async Task<InvitationVersion?> GetLatestVersion(Guid eventId)
    {
        return await db.InvitationVersions
            .Where(v => v.EventId == eventId && v.TenantId == tenantContext.TenantId)
            .OrderByDescending(v => v.VersionNumber)
            .FirstOrDefaultAsync();
    }

    private async Task<InvitationVersion?> EnsureEditableDraftAsync(Guid eventId)
    {
        var version = await GetLatestVersion(eventId);
        if (version is null) return null;
        if (!version.IsPublished) return version;
        return await CloneAsDraftAsync(version);
    }

    private async Task<InvitationVersion> CloneAsDraftAsync(InvitationVersion published)
    {
        await db.Entry(published).Collection(v => v.Sections).LoadAsync();

        var draft = new InvitationVersion
        {
            Id = Guid.NewGuid(),
            TenantId = published.TenantId,
            EventId = published.EventId,
            TemplateId = published.TemplateId,
            ThemeId = published.ThemeId,
            VersionNumber = published.VersionNumber + 1,
            IsPublished = false,
            PublishedAt = null
        };
        db.InvitationVersions.Add(draft);

        foreach (var s in published.Sections.OrderBy(x => x.SortOrder))
        {
            draft.Sections.Add(new InvitationSection
            {
                Id = Guid.NewGuid(),
                TenantId = published.TenantId,
                InvitationVersionId = draft.Id,
                SectionType = s.SectionType,
                SortOrder = s.SortOrder,
                IsEnabled = s.IsEnabled,
                ConfigurationJson = s.ConfigurationJson
            });
        }

        await db.SaveChangesAsync();
        return draft;
    }

    private async Task<string> GenerateUniqueEventSlug(string title)
    {
        var baseSlug = TransliterateGreek(title.ToLowerInvariant())
            .Replace(" & ", "-")
            .Replace("&", "-")
            .Replace(" ", "-");
        baseSlug = System.Text.RegularExpressions.Regex.Replace(baseSlug, @"[^a-z0-9\-]", "");
        baseSlug = System.Text.RegularExpressions.Regex.Replace(baseSlug, @"-+", "-").Trim('-');
        if (string.IsNullOrEmpty(baseSlug))
            baseSlug = "event";

        for (var i = 0; i < 8; i++)
        {
            var candidate = $"{baseSlug}-{Guid.NewGuid().ToString("N")[..6]}";
            var exists = await db.Events.IgnoreQueryFilters()
                .AnyAsync(e => e.Slug == candidate);
            if (!exists) return candidate;
        }

        return $"{baseSlug}-{Guid.NewGuid():N}";
    }

    private static string TransliterateGreek(string input)
    {
        var map = new Dictionary<char, string>
        {
            ['α'] = "a", ['ά'] = "a", ['β'] = "v", ['γ'] = "g", ['δ'] = "d",
            ['ε'] = "e", ['έ'] = "e", ['ζ'] = "z", ['η'] = "i", ['ή'] = "i",
            ['θ'] = "th", ['ι'] = "i", ['ί'] = "i", ['ϊ'] = "i", ['ΐ'] = "i",
            ['κ'] = "k", ['λ'] = "l", ['μ'] = "m", ['ν'] = "n", ['ξ'] = "x",
            ['ο'] = "o", ['ό'] = "o", ['π'] = "p", ['ρ'] = "r", ['σ'] = "s",
            ['ς'] = "s", ['τ'] = "t", ['υ'] = "y", ['ύ'] = "y", ['ϋ'] = "y",
            ['ΰ'] = "y", ['φ'] = "f", ['χ'] = "ch", ['ψ'] = "ps", ['ω'] = "o",
            ['ώ'] = "o"
        };

        var sb = new System.Text.StringBuilder(input.Length * 2);
        foreach (var ch in input)
        {
            if (map.TryGetValue(ch, out var latin))
                sb.Append(latin);
            else
                sb.Append(ch);
        }
        return sb.ToString();
    }

    private static object MapVersion(InvitationVersion v) => new
    {
        v.Id,
        v.EventId,
        v.VersionNumber,
        v.IsPublished,
        v.PublishedAt,
        Template = new
        {
            v.Template.Id,
            v.Template.Name,
            EventType = v.Template.EventType.ToString()
        },
        Theme = v.Theme == null ? null : new
        {
            v.Theme.Id,
            v.Theme.Name,
            v.Theme.DisplayFontFamily,
            v.Theme.BodyFontFamily,
            v.Theme.PrimaryColor,
            v.Theme.SecondaryColor,
            v.Theme.AccentColor,
            v.Theme.BackgroundColor,
            v.Theme.TextColor,
            v.Theme.SurfaceColor,
            v.Theme.BorderRadius
        },
        Sections = v.Sections.Select(s => new
        {
            s.Id,
            s.SectionType,
            s.SortOrder,
            s.IsEnabled,
            s.ConfigurationJson
        })
    };
}

public record CreateInvitationRequest(Guid TemplateId, Guid? ThemeId);
public record UpdateThemeRequest(Guid ThemeId);
public record UpdateSlugRequest(string Slug);
public record UpdateSectionRequest(bool? IsEnabled, int? SortOrder, string? ConfigurationJson);
public record ReorderSectionsRequest(List<SectionOrder> SectionOrders);
public record SectionOrder(Guid SectionId, int SortOrder);
