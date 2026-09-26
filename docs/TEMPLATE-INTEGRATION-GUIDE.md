# Template Integration Guide

This guide explains how to integrate the new Figma templates and enable section management features.

## Progress Summary

### ✅ Completed
1. **Section Management UI Component** - `SectionManager.tsx`
   - Enable/disable sections
   - Reorder sections via drag & drop
   - Edit section configuration (title, text, IBAN, video URL, etc.)
   - Save changes to API

2. **API Support** - Already exists
   - `PUT /api/v1/events/{eventId}/invitation/sections/{sectionId}` - Update section
   - `PUT /api/v1/events/{eventId}/invitation/sections/reorder` - Reorder sections
   - `PATCH /api/v1/events/{eventId}/invitation/theme` - Change theme

### 🚧 In Progress
1. **Template Switching** - Need to add API endpoint
2. **New Section Components** - Need to copy from Figma folder
3. **Editor Integration** - Need to add SectionManager to editor page

### 📋 TODO

#### 1. Add Template Switching API Endpoint

```csharp
// In InvitationsController.cs
[HttpPatch("template")]
public async Task<IActionResult> UpdateTemplate(Guid eventId, [FromBody] UpdateTemplateRequest request)
{
    if (tenantContext.TenantId is null) return Forbid();

    var version = await EnsureEditableDraftAsync(eventId);
    if (version is null) return NotFound();

    var template = await db.InvitationTemplates
        .Include(t => t.SectionDefinitions)
        .Where(t => t.Id == request.TemplateId && t.IsActive)
        .FirstOrDefaultAsync();
    if (template is null) return BadRequest(new { title = "Template not found." });

    // Remove old sections
    var oldSections = await db.InvitationSections
        .Where(s => s.InvitationVersionId == version.Id)
        .ToListAsync();
    db.InvitationSections.RemoveRange(oldSections);

    // Add new sections from template
    foreach (var def in template.SectionDefinitions.OrderBy(s => s.DefaultSortOrder))
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

    version.TemplateId = request.TemplateId;
    await db.SaveChangesAsync();

    return Ok(new { version.Id, templateId = version.TemplateId });
}

public record UpdateTemplateRequest(Guid TemplateId);
```

#### 2. Integrate SectionManager into Editor

Update `src/InvitationPlatform.Web/src/app/dashboard/events/[id]/editor/page.tsx`:

```typescript
import { SectionManager } from "@/components/invitations/SectionManager";

// In the editor page component:
<Tabs defaultValue="content">
  <TabsList>
    <TabsTrigger value="content">Περιεχόμενο</TabsTrigger>
    <TabsTrigger value="sections">Ενότητες</TabsTrigger>
    <TabsTrigger value="theme">Θέμα</TabsTrigger>
    <TabsTrigger value="template">Πρότυπο</TabsTrigger>
  </TabsList>

  <TabsContent value="sections">
    <SectionManager
      sections={invitation.sections}
      onUpdate={async (sections) => {
        // Call API to update sections
        for (const section of sections) {
          await fetch(`/api/v1/events/${eventId}/invitation/sections/${section.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              isEnabled: section.isEnabled,
              sortOrder: section.sortOrder,
              configurationJson: section.configuration,
            }),
          });
        }
      }}
    />
  </TabsContent>
</Tabs>
```

#### 3. Add Template Selector Component

```typescript
// src/InvitationPlatform.Web/src/components/invitations/TemplateSwitcher.tsx
"use client";

import { useState } from "react";
import { Check } from "lucide-react";

interface Template {
  id: string;
  name: string;
  category: string;
  previewImageUrl: string | null;
}

interface TemplateSwitcherProps {
  currentTemplateId: string;
  templates: Template[];
  onSwitch: (templateId: string) => Promise<void>;
}

export function TemplateSwitcher({
  currentTemplateId,
  templates,
  onSwitch,
}: TemplateSwitcherProps) {
  const [switching, setSwitching] = useState(false);

  const handleSwitch = async (templateId: string) => {
    if (templateId === currentTemplateId) return;

    const confirmed = confirm(
      "Η αλλαγή προτύπου θα αντικαταστήσει τις τρέχουσες ενότητες. Είστε σίγουροι;"
    );
    if (!confirmed) return;

    setSwitching(true);
    try {
      await onSwitch(templateId);
    } finally {
      setSwitching(false);
    }
  };

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
      {templates.map((template) => (
        <button
          key={template.id}
          onClick={() => handleSwitch(template.id)}
          disabled={switching || template.id === currentTemplateId}
          className={`relative overflow-hidden rounded-lg border-2 transition-all ${
            template.id === currentTemplateId
              ? "border-primary"
              : "border-border hover:border-primary/50"
          }`}
        >
          {template.previewImageUrl ? (
            <img
              src={template.previewImageUrl}
              alt={template.name}
              className="aspect-[3/4] w-full object-cover"
            />
          ) : (
            <div className="aspect-[3/4] w-full bg-muted" />
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

          <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
            <div className="text-sm font-medium">{template.name}</div>
            <div className="text-xs opacity-80">{template.category}</div>
          </div>

          {template.id === currentTemplateId && (
            <div className="absolute right-2 top-2 rounded-full bg-primary p-1">
              <Check className="h-4 w-4 text-primary-foreground" />
            </div>
          )}
        </button>
      ))}
    </div>
  );
}
```

#### 4. Copy New Section Components from Figma

Copy these files from `Classic Greek Wedding Invitation/src/components/wedding/` to `src/InvitationPlatform.Web/src/components/invitations/sections/`:

- `CoupleGallery.tsx` - Extended photo gallery
- `QuizSection.tsx` - Interactive quiz about the couple
- `VideoSection.tsx` - Video with controls
- `WeddingCast.tsx` - Groomsmen, bridesmaids display
- `WishesSection.tsx` - Guest wishes/messages
- `ThankYouVendors.tsx` - Vendor acknowledgments

Then update the section type definitions in the database seeder to include these new types.

#### 5. Update Database Seed Data

Add new section types to templates in `DatabaseSeeder.cs`:

```csharp
// Add to wedding template section definitions
new TemplateSectionDefinition
{
    Id = Guid.NewGuid(),
    TemplateId = classicTemplate.Id,
    SectionType = "couple_gallery",
    DefaultSortOrder = 8,
    IsEnabledByDefault = false,
    DefaultConfigJson = null,
    MinPackageTier = PackageTier.Digital
},
new TemplateSectionDefinition
{
    Id = Guid.NewGuid(),
    TemplateId = classicTemplate.Id,
    SectionType = "quiz",
    DefaultSortOrder = 9,
    IsEnabledByDefault = false,
    MinPackageTier = PackageTier.Video
},
// ... etc
```

## Testing Checklist

- [ ] User can enable/disable sections in editor
- [ ] User can reorder sections via drag & drop
- [ ] User can edit section content (text, IBAN, video URL)
- [ ] Changes are saved to API correctly
- [ ] User can switch templates
- [ ] Template switching warns about replacing sections
- [ ] New sections render correctly in preview
- [ ] Section changes reflect immediately in preview

## File Structure

```
src/InvitationPlatform.Web/src/
├── components/
│   └── invitations/
│       ├── SectionManager.tsx          ✅ DONE
│       ├── TemplateSwitcher.tsx       📋 TODO
│       ├── sections/
│       │   ├── CoupleGallery.tsx      📋 TODO (copy from Figma)
│       │   ├── QuizSection.tsx        📋 TODO
│       │   ├── VideoSection.tsx       📋 TODO
│       │   ├── WeddingCast.tsx        📋 TODO
│       │   ├── WishesSection.tsx      📋 TODO
│       │   └── ThankYouVendors.tsx    📋 TODO
│       └── templates/
│           ├── RusticInvitation.tsx   📋 TODO (update from Figma)
│           ├── ElegantInvitation.tsx  📋 TODO
│           └── ... (other templates)
└── app/
    └── dashboard/
        └── events/
            └── [id]/
                └── editor/
                    └── page.tsx       📋 TODO (integrate SectionManager)
```

## Next Steps

1. **Add template switching API endpoint** to `InvitationsController.cs`
2. **Integrate SectionManager** into the editor page with tabs
3. **Create TemplateSwitcher component** for changing templates
4. **Copy new section components** from Figma folder
5. **Update templates** with new Figma versions
6. **Test thoroughly** with all features

## API Endpoints Summary

| Endpoint | Method | Purpose | Status |
|----------|--------|---------|--------|
| `/api/v1/events/{id}/invitation/sections/{sectionId}` | PUT | Update section | ✅ Exists |
| `/api/v1/events/{id}/invitation/sections/reorder` | PUT | Reorder sections | ✅ Exists |
| `/api/v1/events/{id}/invitation/theme` | PATCH | Change theme | ✅ Exists |
| `/api/v1/events/{id}/invitation/template` | PATCH | Change template | 📋 Need to add |
| `/api/v1/templates` | GET | List templates | ✅ Exists |
