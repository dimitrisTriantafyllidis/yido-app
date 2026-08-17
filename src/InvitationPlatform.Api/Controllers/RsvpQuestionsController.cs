using InvitationPlatform.Application.Common;
using InvitationPlatform.Application.Common.Interfaces;
using InvitationPlatform.Domain.Entities;
using InvitationPlatform.Infrastructure.Persistence;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace InvitationPlatform.Api.Controllers;

[ApiController]
[Route("api/v1/events/{eventId:guid}/rsvp-questions")]
[Authorize]
public class RsvpQuestionsController(
    ApplicationDbContext db,
    ITenantContext tenantContext,
    IFeatureEntitlementService entitlements) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll(Guid eventId)
    {
        if (tenantContext.TenantId is null) return Forbid();

        var questions = await db.RsvpQuestions
            .Where(q => q.EventId == eventId && q.TenantId == tenantContext.TenantId)
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

        return Ok(questions);
    }

    [HttpGet("/api/v1/public/events/{slug}/rsvp-questions")]
    [AllowAnonymous]
    public async Task<IActionResult> GetPublicBySlug(string slug)
    {
        var evt = await db.Events
            .Where(e => e.Slug == slug && e.Status == Domain.Enums.EventStatus.Published)
            .FirstOrDefaultAsync();
        if (evt is null) return NotFound();

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

        return Ok(questions);
    }

    [HttpPost]
    public async Task<IActionResult> Create(Guid eventId, [FromBody] RsvpQuestionRequest request)
    {
        if (tenantContext.TenantId is null) return Forbid();
        var tenantId = tenantContext.TenantId.Value;

        if (!await db.Events.AnyAsync(e => e.Id == eventId && e.TenantId == tenantId))
            return NotFound();

        try
        {
            await entitlements.EnsureBooleanFeatureAsync(tenantId, eventId, "rsvp_full");
        }
        catch (EntitlementException ex)
        {
            return StatusCode(StatusCodes.Status403Forbidden, new ProblemDetails
            {
                Title = ex.Message,
                Status = StatusCodes.Status403Forbidden
            });
        }

        if (string.IsNullOrWhiteSpace(request.Prompt))
            return BadRequest(new ProblemDetails { Title = "Prompt is required." });

        var question = new RsvpQuestion
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            EventId = eventId,
            Prompt = request.Prompt.Trim(),
            QuestionType = string.IsNullOrWhiteSpace(request.QuestionType) ? "text" : request.QuestionType,
            OptionsJson = request.OptionsJson,
            IsRequired = request.IsRequired,
            SortOrder = request.SortOrder ?? await db.RsvpQuestions.CountAsync(q => q.EventId == eventId)
        };

        db.RsvpQuestions.Add(question);
        await db.SaveChangesAsync();

        return Ok(new
        {
            question.Id,
            question.Prompt,
            question.QuestionType,
            question.OptionsJson,
            question.IsRequired,
            question.SortOrder
        });
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid eventId, Guid id, [FromBody] RsvpQuestionRequest request)
    {
        if (tenantContext.TenantId is null) return Forbid();
        var tenantId = tenantContext.TenantId.Value;

        try
        {
            await entitlements.EnsureBooleanFeatureAsync(tenantId, eventId, "rsvp_full");
        }
        catch (EntitlementException ex)
        {
            return StatusCode(StatusCodes.Status403Forbidden, new ProblemDetails
            {
                Title = ex.Message,
                Status = StatusCodes.Status403Forbidden
            });
        }

        var question = await db.RsvpQuestions
            .FirstOrDefaultAsync(q => q.Id == id && q.EventId == eventId && q.TenantId == tenantId);
        if (question is null) return NotFound();

        if (!string.IsNullOrWhiteSpace(request.Prompt))
            question.Prompt = request.Prompt.Trim();
        if (!string.IsNullOrWhiteSpace(request.QuestionType))
            question.QuestionType = request.QuestionType;
        if (request.OptionsJson is not null)
            question.OptionsJson = request.OptionsJson;
        question.IsRequired = request.IsRequired;
        if (request.SortOrder.HasValue)
            question.SortOrder = request.SortOrder.Value;

        await db.SaveChangesAsync();
        return Ok(new
        {
            question.Id,
            question.Prompt,
            question.QuestionType,
            question.OptionsJson,
            question.IsRequired,
            question.SortOrder
        });
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid eventId, Guid id)
    {
        if (tenantContext.TenantId is null) return Forbid();
        var tenantId = tenantContext.TenantId.Value;

        try
        {
            await entitlements.EnsureBooleanFeatureAsync(tenantId, eventId, "rsvp_full");
        }
        catch (EntitlementException ex)
        {
            return StatusCode(StatusCodes.Status403Forbidden, new ProblemDetails
            {
                Title = ex.Message,
                Status = StatusCodes.Status403Forbidden
            });
        }

        var question = await db.RsvpQuestions
            .FirstOrDefaultAsync(q => q.Id == id && q.EventId == eventId && q.TenantId == tenantId);
        if (question is null) return NotFound();

        db.RsvpQuestions.Remove(question);
        await db.SaveChangesAsync();
        return NoContent();
    }
}

public record RsvpQuestionRequest(
    string Prompt,
    string? QuestionType = "text",
    string? OptionsJson = null,
    bool IsRequired = false,
    int? SortOrder = null);
