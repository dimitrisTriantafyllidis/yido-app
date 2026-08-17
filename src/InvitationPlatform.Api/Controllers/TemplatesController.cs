using InvitationPlatform.Domain.Enums;
using InvitationPlatform.Infrastructure.Persistence;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace InvitationPlatform.Api.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
[Authorize]
public class TemplatesController(ApplicationDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] EventType? eventType)
    {
        var query = db.InvitationTemplates
            .Where(t => t.IsActive);

        if (eventType.HasValue)
            query = query.Where(t => t.EventType == eventType.Value);

        var templates = await query
            .OrderBy(t => t.SortOrder)
            .Select(t => new
            {
                t.Id,
                t.Name,
                t.Description,
                EventType = t.EventType.ToString(),
                t.Category,
                t.PreviewImageUrl,
                t.IsPremium,
                t.MinPackageTier,
                DefaultTheme = t.DefaultTheme == null ? null : new
                {
                    t.DefaultTheme.Id,
                    t.DefaultTheme.Name
                },
                SectionCount = t.SectionDefinitions.Count
            })
            .ToListAsync();

        return Ok(templates);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var template = await db.InvitationTemplates
            .Include(t => t.DefaultTheme)
            .Include(t => t.SectionDefinitions.OrderBy(s => s.DefaultSortOrder))
            .Where(t => t.Id == id && t.IsActive)
            .FirstOrDefaultAsync();

        if (template is null) return NotFound();

        return Ok(new
        {
            template.Id,
            template.Name,
            template.Description,
            EventType = template.EventType.ToString(),
            template.Category,
            template.PreviewImageUrl,
            template.IsPremium,
            template.MinPackageTier,
            DefaultTheme = template.DefaultTheme == null ? null : new
            {
                template.DefaultTheme.Id,
                template.DefaultTheme.Name,
                template.DefaultTheme.PrimaryColor,
                template.DefaultTheme.BackgroundColor,
                template.DefaultTheme.DisplayFontFamily,
                template.DefaultTheme.BodyFontFamily
            },
            Sections = template.SectionDefinitions.Select(s => new
            {
                s.Id,
                s.SectionType,
                s.DefaultSortOrder,
                s.IsRequired,
                s.IsEnabledByDefault,
                s.DefaultConfigJson,
                s.MinPackageTier
            })
        });
    }

    [HttpGet("themes")]
    public async Task<IActionResult> GetThemes()
    {
        var themes = await db.Themes
            .Where(t => t.IsActive)
            .OrderBy(t => t.Name)
            .Select(t => new
            {
                t.Id,
                t.Name,
                t.DisplayFontFamily,
                t.BodyFontFamily,
                t.PrimaryColor,
                t.SecondaryColor,
                t.AccentColor,
                t.BackgroundColor,
                t.TextColor,
                t.SurfaceColor,
                t.BorderRadius,
                t.IsPremium,
                t.PreviewImageUrl
            })
            .ToListAsync();

        return Ok(themes);
    }
}
