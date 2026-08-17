using InvitationPlatform.Infrastructure.Persistence;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace InvitationPlatform.Api.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
public class PackagesController(ApplicationDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var packages = await db.Packages
            .Where(p => p.IsActive)
            .OrderBy(p => p.SortOrder)
            .Select(p => new
            {
                p.Id,
                p.Name,
                p.DisplayName,
                p.Description,
                Tier = p.Tier.ToString(),
                p.PriceAmount,
                p.PriceCurrency,
                Features = p.PackageFeatures.Select(pf => new
                {
                    pf.Feature.Key,
                    pf.Feature.Name,
                    pf.Feature.Description,
                    ValueType = pf.Feature.ValueType.ToString(),
                    pf.Feature.Category,
                    pf.BooleanValue,
                    pf.IntegerValue,
                    pf.StringValue
                })
            })
            .ToListAsync();

        return Ok(packages);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var package = await db.Packages
            .Include(p => p.PackageFeatures)
                .ThenInclude(pf => pf.Feature)
            .Where(p => p.Id == id && p.IsActive)
            .FirstOrDefaultAsync();

        if (package is null) return NotFound();

        return Ok(new
        {
            package.Id,
            package.Name,
            package.DisplayName,
            package.Description,
            Tier = package.Tier.ToString(),
            package.PriceAmount,
            package.PriceCurrency,
            Features = package.PackageFeatures.Select(pf => new
            {
                pf.Feature.Key,
                pf.Feature.Name,
                pf.Feature.Description,
                ValueType = pf.Feature.ValueType.ToString(),
                pf.Feature.Category,
                pf.BooleanValue,
                pf.IntegerValue,
                pf.StringValue
            })
        });
    }

    [HttpGet("/api/v1/addons")]
    public async Task<IActionResult> GetAddOns()
    {
        var addOns = await db.AddOnProducts
            .Where(a => a.IsActive)
            .OrderBy(a => a.SortOrder)
            .Select(a => new
            {
                a.Id,
                a.Key,
                a.DisplayName,
                a.Description,
                a.PriceAmount,
                a.PriceCurrency,
                a.FeatureKey,
                a.IntegerDelta,
                a.BooleanValue
            })
            .ToListAsync();

        return Ok(addOns);
    }
}
