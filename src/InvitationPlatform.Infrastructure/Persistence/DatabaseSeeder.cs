using InvitationPlatform.Domain.Entities;
using InvitationPlatform.Domain.Enums;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using System.Text.Json.Nodes;

namespace InvitationPlatform.Infrastructure.Persistence;

public static class DatabaseSeeder
{
    public static async Task SeedAsync(IServiceProvider serviceProvider)
    {
        using var scope = serviceProvider.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        var userManager = scope.ServiceProvider.GetRequiredService<UserManager<ApplicationUser>>();
        var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<ApplicationRole>>();

        await context.Database.MigrateAsync();

        // Seed roles
        var roles = new[] { "Admin", "Owner", "Editor", "Viewer" };
        foreach (var roleName in roles)
        {
            if (!await roleManager.RoleExistsAsync(roleName))
            {
                await roleManager.CreateAsync(new ApplicationRole
                {
                    Name = roleName,
                    IsSystemRole = roleName == "Admin"
                });
            }
        }

        // Seed admin user
        var adminEmail = "admin@yido.gr";
        if (await userManager.FindByEmailAsync(adminEmail) == null)
        {
            var admin = new ApplicationUser
            {
                UserName = adminEmail,
                Email = adminEmail,
                EmailConfirmed = true,
                FirstName = "System",
                LastName = "Administrator",
                IsSystemAdmin = true,
                Locale = "el"
            };
            var adminCreate = await userManager.CreateAsync(admin, "Admin123!");
            if (!adminCreate.Succeeded)
                throw new InvalidOperationException(
                    $"Failed to seed admin user: {string.Join("; ", adminCreate.Errors.Select(e => e.Description))}");

            var adminRole = await userManager.AddToRoleAsync(admin, "Admin");
            if (!adminRole.Succeeded)
                throw new InvalidOperationException(
                    $"Failed to assign Admin role: {string.Join("; ", adminRole.Errors.Select(e => e.Description))}");
        }

        // Seed demo customer
        var customerEmail = "maria@example.com";
        var customer = await userManager.FindByEmailAsync(customerEmail);
        if (customer == null)
        {
            customer = new ApplicationUser
            {
                UserName = customerEmail,
                Email = customerEmail,
                EmailConfirmed = true,
                FirstName = "Μαρία",
                LastName = "Παπαδοπούλου",
                Locale = "el"
            };
            var customerCreate = await userManager.CreateAsync(customer, "Demo123!");
            if (!customerCreate.Succeeded)
                throw new InvalidOperationException(
                    $"Failed to seed demo customer: {string.Join("; ", customerCreate.Errors.Select(e => e.Description))}");

            var customerRole = await userManager.AddToRoleAsync(customer, "Owner");
            if (!customerRole.Succeeded)
                throw new InvalidOperationException(
                    $"Failed to assign Owner role: {string.Join("; ", customerRole.Errors.Select(e => e.Description))}");
        }

        // Seed demo tenant
        if (!await context.Tenants.AnyAsync())
        {
            var tenant = new Tenant
            {
                Id = Guid.Parse("00000000-0000-0000-0000-000000000001"),
                Name = "Μαρία & Γιώργος",
                Slug = "maria-giorgos",
                Status = TenantStatus.Active,
                Locale = "el"
            };
            context.Tenants.Add(tenant);

            // Link customer to tenant
            var ownerRole = await context.Set<ApplicationRole>().FirstAsync(r => r.Name == "Owner");
            context.UserTenants.Add(new UserTenant
            {
                UserId = customer.Id,
                TenantId = tenant.Id,
                RoleId = ownerRole.Id,
                IsOwner = true
            });

            // Demo event
            var evt = new Event
            {
                Id = Guid.Parse("00000000-0000-0000-0000-000000000010"),
                TenantId = tenant.Id,
                Title = "Γάμος Μαρίας & Γιώργου",
                EventType = EventType.Wedding,
                EventDate = new DateTime(2027, 9, 18, 17, 0, 0, DateTimeKind.Utc),
                Status = EventStatus.Published,
                Slug = "maria-giorgos-gamos",
                Locale = "el",
                Description = "Σας προσκαλούμε με χαρά στον γάμο μας",
                PublishedAt = DateTime.UtcNow,
                CreatedBy = customer.Id
            };
            context.Events.Add(evt);

            // Demo venues
            context.Venues.AddRange(
                new Venue
                {
                    TenantId = tenant.Id,
                    EventId = evt.Id,
                    Name = "Ιερός Ναός Αγίου Νικολάου",
                    VenueType = VenueType.Church,
                    Address = "Πλατεία Αγίου Νικολάου",
                    City = "Αθήνα",
                    GoogleMapsUrl = "https://maps.google.com/?q=Agios+Nikolaos+Athens",
                    Time = new TimeOnly(17, 0),
                    SortOrder = 0
                },
                new Venue
                {
                    TenantId = tenant.Id,
                    EventId = evt.Id,
                    Name = "Κτήμα Ελαιών",
                    VenueType = VenueType.Reception,
                    Address = "Λεωφόρος Βάρης-Κορωπίου",
                    City = "Βάρη",
                    GoogleMapsUrl = "https://maps.google.com/?q=Ktima+Elaion+Vari",
                    Time = new TimeOnly(20, 0),
                    SortOrder = 1
                }
            );

            // Demo event persons
            context.EventPersons.AddRange(
                new EventPerson
                {
                    TenantId = tenant.Id,
                    EventId = evt.Id,
                    Role = EventPersonRole.Bride,
                    DisplayName = "Μαρία Παπαδοπούλου",
                    Side = PersonSide.Bride,
                    SortOrder = 0
                },
                new EventPerson
                {
                    TenantId = tenant.Id,
                    EventId = evt.Id,
                    Role = EventPersonRole.Groom,
                    DisplayName = "Γιώργος Αντωνίου",
                    Side = PersonSide.Groom,
                    SortOrder = 1
                },
                new EventPerson
                {
                    TenantId = tenant.Id,
                    EventId = evt.Id,
                    Role = EventPersonRole.BestMan,
                    DisplayName = "Νίκος Δημητρίου",
                    Side = PersonSide.Groom,
                    SortOrder = 2
                },
                new EventPerson
                {
                    TenantId = tenant.Id,
                    EventId = evt.Id,
                    Role = EventPersonRole.MaidOfHonor,
                    DisplayName = "Ελένη Κωνσταντίνου",
                    Side = PersonSide.Bride,
                    SortOrder = 3
                }
            );

            await context.SaveChangesAsync();
        }

        // Seed themes
        if (!await context.Themes.AnyAsync())
        {
            var classicTheme = new Theme
            {
                Id = Guid.Parse("00000000-0000-0000-0000-000000000100"),
                Name = "Κλασικό Ελληνικό",
                DisplayFontFamily = "Literata",
                BodyFontFamily = "Inter",
                PrimaryColor = "#2E5A4C",
                SecondaryColor = "#FAFAF7",
                AccentColor = "#2E5A4C",
                BackgroundColor = "#FAFAF7",
                TextColor = "#1A1A18",
                SurfaceColor = "#FFFFFF",
                BorderRadius = "2px"
            };

            var romanticTheme = new Theme
            {
                Id = Guid.Parse("00000000-0000-0000-0000-000000000101"),
                Name = "Ρομαντικό",
                DisplayFontFamily = "Literata",
                BodyFontFamily = "Inter",
                PrimaryColor = "#8B4557",
                SecondaryColor = "#FFF5F5",
                AccentColor = "#8B4557",
                BackgroundColor = "#FFF5F5",
                TextColor = "#2D1F24",
                SurfaceColor = "#FFFFFF",
                BorderRadius = "12px"
            };

            var modernTheme = new Theme
            {
                Id = Guid.Parse("00000000-0000-0000-0000-000000000102"),
                Name = "Μοντέρνο",
                DisplayFontFamily = "Inter",
                BodyFontFamily = "Inter",
                PrimaryColor = "#1A1A18",
                SecondaryColor = "#F5F5F5",
                AccentColor = "#D4A574",
                BackgroundColor = "#FFFFFF",
                TextColor = "#1A1A18",
                SurfaceColor = "#F5F5F5",
                BorderRadius = "4px"
            };

            var baptismTheme = new Theme
            {
                Id = Guid.Parse("00000000-0000-0000-0000-000000000103"),
                Name = "Βάπτιση",
                DisplayFontFamily = "Literata",
                BodyFontFamily = "Inter",
                PrimaryColor = "#3D6B5C",
                SecondaryColor = "#F7F4EE",
                AccentColor = "#3D6B5C",
                BackgroundColor = "#F7F4EE",
                TextColor = "#1A1A18",
                SurfaceColor = "#FFFFFF",
                BorderRadius = "8px"
            };

            context.Themes.AddRange(classicTheme, romanticTheme, modernTheme, baptismTheme);
            await context.SaveChangesAsync();

            // Seed wedding style templates (Classic Greek Make designs)
            var weddingStyles = new (Guid id, string category, string name, string description, int sort, string? preview)[]
            {
                (Guid.Parse("00000000-0000-0000-0000-000000000210"), "rustic", "Ρουστίκ", "Φυσικά υλικά, ξύλο & γήινα χρώματα", 0, "https://images.unsplash.com/photo-1519741497674-611481863552?w=900&h=700&fit=crop"),
                (Guid.Parse("00000000-0000-0000-0000-000000000211"), "boho", "Boho Chic", "Αέρινα υφάσματα, pampas & ελεύθερο πνεύμα", 1, "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=900&h=700&fit=crop"),
                (Guid.Parse("00000000-0000-0000-0000-000000000212"), "minimal", "Minimal Chic", "Καθαρές γραμμές, λευκό & λιτή κομψότητα", 2, "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=900&h=700&fit=crop"),
                (Guid.Parse("00000000-0000-0000-0000-000000000213"), "vintage", "Vintage", "Δαντέλες, παστέλ & ρομαντική νοσταλγία", 3, "https://images.unsplash.com/photo-1556337137-c7de215dfa78?w=900&h=700&fit=crop"),
                (Guid.Parse("00000000-0000-0000-0000-000000000214"), "elegant", "Κλασικό Elegant", "Μεγαλοπρεπής δεξίωση & επίσημο στυλ", 4, "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=900&h=700&fit=crop"),
                (Guid.Parse("00000000-0000-0000-0000-000000000215"), "floral", "Floral Romance", "Τριαντάφυλλα, μπορντό & ρομαντικό script", 5, "https://images.unsplash.com/photo-1520854221256-1744189951c6?w=900&h=700&fit=crop"),
                (Guid.Parse("00000000-0000-0000-0000-000000000216"), "wreath", "Botanical Wreath", "Χρυσό στεφάνι & πράσινα φύλλα", 6, "https://images.unsplash.com/photo-1460978812857-470ed1c77af0?w=900&h=700&fit=crop"),
                (Guid.Parse("00000000-0000-0000-0000-000000000217"), "dusty", "Dusty Blue", "Απαλό μπλε & ροζ υδατογραφία", 7, "https://images.unsplash.com/photo-1529636798458-92182e662485?w=900&h=700&fit=crop"),
                (Guid.Parse("00000000-0000-0000-0000-000000000218"), "greengold", "Green & Gold", "Editorial Save the Date, πράσινο & χρυσό", 8, "https://images.unsplash.com/photo-1511285560929-80b456fe9cab?w=900&h=700&fit=crop"),
                (Guid.Parse("00000000-0000-0000-0000-000000000219"), "geometric", "Geometric Floral", "Γεωμετρικό πλαίσιο & peony", 9, "https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=900&h=700&fit=crop"),
            };

            var rusticTemplate = null as InvitationTemplate;

            foreach (var (id, category, name, description, sort, preview) in weddingStyles)
            {
                var tmpl = new InvitationTemplate
                {
                    Id = id,
                    Name = name,
                    Description = description,
                    EventType = EventType.Wedding,
                    Category = category,
                    PreviewImageUrl = preview,
                    DefaultThemeId = classicTheme.Id,
                    SortOrder = sort,
                    IsActive = true
                };
                context.InvitationTemplates.Add(tmpl);
                if (category == "rustic") rusticTemplate = tmpl;
            }

            // Legacy IDs kept inactive for FK safety on older DBs / demos
            var legacyClassicWedding = new InvitationTemplate
            {
                Id = Guid.Parse("00000000-0000-0000-0000-000000000200"),
                Name = "Κλασικός Γάμος (παλιό)",
                Description = "Αντικαταστάθηκε από τα Classic Greek στυλ",
                EventType = EventType.Wedding,
                Category = "classic",
                DefaultThemeId = classicTheme.Id,
                SortOrder = 100,
                IsActive = false
            };
            var legacyRomanticWedding = new InvitationTemplate
            {
                Id = Guid.Parse("00000000-0000-0000-0000-000000000201"),
                Name = "Ρομαντικός Γάμος (παλιό)",
                Description = "Αντικαταστάθηκε από τα Classic Greek στυλ",
                EventType = EventType.Wedding,
                Category = "romantic",
                DefaultThemeId = romanticTheme.Id,
                SortOrder = 101,
                IsActive = false
            };

            var baptismTemplate = new InvitationTemplate
            {
                Id = Guid.Parse("00000000-0000-0000-0000-000000000202"),
                Name = "Βάπτιση",
                Description = "Χαρούμενη πρόσκληση βάπτισης",
                EventType = EventType.Baptism,
                Category = "classic",
                DefaultThemeId = baptismTheme.Id,
                SortOrder = 20
            };

            var birthdayTemplate = new InvitationTemplate
            {
                Id = Guid.Parse("00000000-0000-0000-0000-000000000203"),
                Name = "Γενέθλια",
                Description = "Εορταστική πρόσκληση γενεθλίων",
                EventType = EventType.Party,
                Category = "birthday",
                DefaultThemeId = modernTheme.Id,
                SortOrder = 30
            };

            context.InvitationTemplates.AddRange(
                legacyClassicWedding, legacyRomanticWedding, baptismTemplate, birthdayTemplate);

            // Section definitions for wedding style templates
            var sectionTypes = new[]
            {
                ("hero", 0, true, true, "{\"title\":\"\",\"subtitle\":\"Σας προσκαλούμε στον γάμο μας\",\"overlayOpacity\":0.3}"),
                ("welcome_text", 1, false, true, "{\"heading\":\"\",\"text\":\"Με ανοιχτές αγκάλες και χαρούμενες καρδιές, σας καλούμε να μοιραστείτε μαζί μας αυτή τη μαγική στιγμή. Ο γάμος μας είναι μια γιορτή αγάπης, και η παρουσία σας θα την κάνει ακόμα πιο ξεχωριστή.\"}"),
                ("event_details", 2, true, true, "{\"heading\":\"Η Μέρα μας\",\"label\":\"Λεπτομέρειες Τελετής\",\"dressCode\":\"Επίσημο\",\"dateLabel\":\"Ημερομηνία\",\"timeLabel\":\"Ώρα Έναρξης\",\"attireLabel\":\"Ενδυμασία\",\"attireSub\":\"Dress Code\",\"showPrintedCard\":true,\"paperLabel\":\"Η Πρόσκληση\",\"paperHeading\":\"Η Έντυπη Πρόσκλησή μας\",\"paperEventType\":\"Γάμος\",\"paperInviteLine\":\"Σας προσκαλούμε στον γάμο μας\"}"),
                ("countdown", 3, false, true, "{\"heading\":\"Αντίστροφη μέτρηση\"}"),
                ("venue", 4, true, true, "{\"heading\":\"Οι Χώροι μας\",\"label\":\"Τοποθεσίες\",\"showMap\":true,\"mapsLabel\":\"Οδηγίες (Google Maps)\"}"),
                ("participants", 5, false, true, "{\"heading\":\"Με Χαρά Παρουσιάζουμε\",\"label\":\"Οι Πρωταγωνιστές\"}"),
                ("gallery", 6, false, true, "{\"heading\":\"Εμείς\",\"label\":\"Φωτογραφικές Στιγμές\",\"columns\":3,\"hint\":\"Κάντε κλικ σε κάθε φωτογραφία για μεγέθυνση\",\"emptyText\":\"Σύντομα φωτογραφίες από την εκδήλωση.\"}"),
                ("rsvp", 7, false, true, "{\"heading\":\"Επιβεβαίωση Παρουσίας\",\"label\":\"Παρακαλούμε Απαντήστε\",\"description\":\"Παρακαλούμε απαντήστε\",\"showPlusOne\":true,\"showChildrenCount\":true,\"showMealPreference\":false,\"attendingYes\":\"Θα παραστώ\",\"attendingNo\":\"Δεν μπορώ\",\"submitLabel\":\"Αποστολή\",\"submittingLabel\":\"Αποστολή...\",\"nameLabel\":\"Ονοματεπώνυμο\",\"emailLabel\":\"Email (προαιρετικό)\",\"attendingLabel\":\"Παρουσία\",\"adultsLabel\":\"Αριθμός Ατόμων\",\"childrenLabel\":\"Αριθμός παιδιών\",\"plusOneLabel\":\"Όνομα συνοδού\",\"mealLabel\":\"Διατροφική προτίμηση\",\"notesLabel\":\"Σημειώσεις\",\"successTitle\":\"Ευχαριστούμε!\",\"successText\":\"Η απάντησή σας καταχωρήθηκε με επιτυχία.\",\"declineTitle\":\"Λυπούμαστε!\",\"declineText\":\"Η απάντησή σας καταγράφηκε.\"}"),
                ("gift_list", 8, false, false, "{\"heading\":\"Δώρα\",\"text\":\"\"}"),
                ("video", 9, false, false, "{\"heading\":\"Το Βίντεό μας\",\"label\":\"Η Ιστορία μας\",\"emptyText\":\"Δεν υπάρχει βίντεο ακόμα.\"}"),
                ("footer", 10, true, true, "{\"text\":\"Σας περιμένουμε με χαρά!\"}")
            };

            foreach (var (id, _, _, _, _, _) in weddingStyles)
            {
                foreach (var (sectionType, sortOrder, isRequired, isEnabled, defaultConfig) in sectionTypes)
                {
                    context.TemplateSectionDefinitions.Add(new TemplateSectionDefinition
                    {
                        TemplateId = id,
                        SectionType = sectionType,
                        DefaultSortOrder = sortOrder,
                        IsRequired = isRequired,
                        IsEnabledByDefault = isEnabled,
                        DefaultConfigJson = defaultConfig
                    });
                }
            }

            // Keep section defs on legacy templates for any existing invitation versions
            foreach (var (sectionType, sortOrder, isRequired, isEnabled, defaultConfig) in sectionTypes)
            {
                context.TemplateSectionDefinitions.Add(new TemplateSectionDefinition
                {
                    TemplateId = legacyClassicWedding.Id,
                    SectionType = sectionType,
                    DefaultSortOrder = sortOrder,
                    IsRequired = isRequired,
                    IsEnabledByDefault = isEnabled,
                    DefaultConfigJson = defaultConfig
                });
                context.TemplateSectionDefinitions.Add(new TemplateSectionDefinition
                {
                    TemplateId = legacyRomanticWedding.Id,
                    SectionType = sectionType,
                    DefaultSortOrder = sortOrder,
                    IsRequired = isRequired,
                    IsEnabledByDefault = sectionType == "gallery" ? false : isEnabled,
                    DefaultConfigJson = defaultConfig
                });
            }

            // Baptism gets fewer sections
            var baptismSections = new[]
            {
                ("hero", 0, true, true, "{\"title\":\"\",\"subtitle\":\"Σας προσκαλούμε στη βάπτιση\",\"overlayOpacity\":0.3}"),
                ("welcome_text", 1, false, true, "{\"heading\":\"Καλωσήρθατε\",\"text\":\"\"}"),
                ("event_details", 2, true, true, "{\"heading\":\"Λεπτομέρειες\"}"),
                ("venue", 3, true, true, "{\"heading\":\"Τοποθεσία\",\"showMap\":true}"),
                ("participants", 4, false, true, "{\"heading\":\"Πρόσωπα\"}"),
                ("rsvp", 5, false, true, "{\"heading\":\"Επιβεβαίωση Παρουσίας\",\"description\":\"Παρακαλούμε απαντήστε\",\"showPlusOne\":true,\"showChildrenCount\":false,\"showMealPreference\":false}"),
                ("footer", 6, true, true, "{\"text\":\"Σας περιμένουμε με χαρά!\"}")
            };

            foreach (var (sectionType, sortOrder, isRequired, isEnabled, defaultConfig) in baptismSections)
            {
                context.TemplateSectionDefinitions.Add(new TemplateSectionDefinition
                {
                    TemplateId = baptismTemplate.Id,
                    SectionType = sectionType,
                    DefaultSortOrder = sortOrder,
                    IsRequired = isRequired,
                    IsEnabledByDefault = isEnabled,
                    DefaultConfigJson = defaultConfig
                });
            }

            var birthdaySections = new[]
            {
                ("hero", 0, true, true, "{\"title\":\"\",\"subtitle\":\"Σας προσκαλούμε\",\"overlayOpacity\":0.35}"),
                ("welcome_text", 1, false, true, "{\"heading\":\"Γιορτάζουμε\",\"text\":\"\"}"),
                ("event_details", 2, true, true, "{\"heading\":\"Λεπτομέρειες\"}"),
                ("countdown", 3, false, true, "{\"heading\":\"Αντίστροφη μέτρηση\"}"),
                ("venue", 4, true, true, "{\"heading\":\"Τοποθεσία\",\"showMap\":true}"),
                ("participants", 5, false, false, "{\"heading\":\"Διοργανωτής\"}"),
                ("gallery", 6, false, true, "{\"heading\":\"Φωτογραφίες\",\"columns\":2}"),
                ("rsvp", 7, false, true, "{\"heading\":\"Θα έρθετε;\",\"description\":\"Παρακαλούμε απαντήστε\",\"showPlusOne\":true,\"showChildrenCount\":true,\"showMealPreference\":false}"),
                ("footer", 8, true, true, "{\"text\":\"Τα λέμε εκεί!\"}")
            };

            foreach (var (sectionType, sortOrder, isRequired, isEnabled, defaultConfig) in birthdaySections)
            {
                context.TemplateSectionDefinitions.Add(new TemplateSectionDefinition
                {
                    TemplateId = birthdayTemplate.Id,
                    SectionType = sectionType,
                    DefaultSortOrder = sortOrder,
                    IsRequired = isRequired,
                    IsEnabledByDefault = isEnabled,
                    DefaultConfigJson = defaultConfig
                });
            }

            await context.SaveChangesAsync();

            // Create demo invitation version for the existing demo event
            var demoEvent = await context.Events.FirstOrDefaultAsync(e => e.Id == Guid.Parse("00000000-0000-0000-0000-000000000010"));
            if (demoEvent != null && rusticTemplate != null)
            {
                var demoVersion = new InvitationVersion
                {
                    Id = Guid.Parse("00000000-0000-0000-0000-000000000300"),
                    TenantId = demoEvent.TenantId,
                    EventId = demoEvent.Id,
                    TemplateId = rusticTemplate.Id,
                    ThemeId = classicTheme.Id,
                    VersionNumber = 1,
                    IsPublished = true,
                    PublishedAt = DateTime.UtcNow
                };
                context.InvitationVersions.Add(demoVersion);

                // Add sections from template defaults
                foreach (var (sectionType, sortOrder, _, isEnabled, defaultConfig) in sectionTypes)
                {
                    var config = sectionType switch
                    {
                        "hero" => "{\"title\":\"Μαρία & Γιώργος\",\"subtitle\":\"Σας προσκαλούμε στον γάμο μας\",\"overlayOpacity\":0.3}",
                        "welcome_text" => "{\"heading\":\"\",\"text\":\"Με ανοιχτές αγκάλες και χαρούμενες καρδιές, σας καλούμε να μοιραστείτε μαζί μας αυτή τη μαγική στιγμή. Ο γάμος μας είναι μια γιορτή αγάπης, και η παρουσία σας θα την κάνει ακόμα πιο ξεχωριστή.\"}",
                        "rsvp" => "{\"heading\":\"Επιβεβαίωση Παρουσίας\",\"description\":\"Παρακαλούμε απαντήστε έως τις 31 Αυγούστου 2027\",\"showPlusOne\":true,\"showChildrenCount\":true,\"showMealPreference\":false,\"deadline\":\"2027-08-31\"}",
                        "footer" => "{\"text\":\"Σας περιμένουμε με χαρά!\"}",
                        _ => defaultConfig
                    };

                    context.InvitationSections.Add(new InvitationSection
                    {
                        TenantId = demoEvent.TenantId,
                        InvitationVersionId = demoVersion.Id,
                        SectionType = sectionType,
                        SortOrder = sortOrder,
                        IsEnabled = isEnabled,
                        ConfigurationJson = config
                    });
                }

                await context.SaveChangesAsync();
            }
        }

        // Seed packages and features
        if (!await context.Packages.AnyAsync())
        {
            // Features
            var features = new (string key, string name, string category, FeatureValueType vt)[]
            {
                ("custom_slug", "Custom URL slug", "invitation", FeatureValueType.Boolean),
                ("rsvp_full", "Full RSVP (meal, questions, +1)", "rsvp", FeatureValueType.Boolean),
                ("max_guests", "Maximum guests", "guests", FeatureValueType.Integer),
                ("gallery", "Photo gallery", "media", FeatureValueType.Boolean),
                ("max_photos", "Maximum gallery photos", "media", FeatureValueType.Integer),
                ("video_section", "Video invitation section", "media", FeatureValueType.Boolean),
                ("background_audio", "Background audio", "media", FeatureValueType.Boolean),
                ("qr_code", "QR code generation", "sharing", FeatureValueType.Boolean),
                ("gift_list", "Gift list / IBAN", "features", FeatureValueType.Boolean),
                ("custom_colors", "Custom color palette", "design", FeatureValueType.Boolean),
                ("custom_fonts", "Custom font selection", "design", FeatureValueType.String),
                ("premium_templates", "Premium templates", "design", FeatureValueType.Boolean),
                ("printable_upload", "Printable invitation upload", "media", FeatureValueType.Boolean),
                ("guest_photo_uploads", "Guest photo uploads via QR", "media", FeatureValueType.Boolean),
                ("excel_export", "Excel export", "data", FeatureValueType.Boolean),
                ("max_emails", "Email notifications limit", "notifications", FeatureValueType.Integer),
                ("event_duration_months", "Event active duration (months)", "lifecycle", FeatureValueType.Integer),
                ("seating_plan", "Reception seating / table management", "guests", FeatureValueType.Boolean),
            };

            var featureEntities = new Dictionary<string, Feature>();
            foreach (var (key, name, category, vt) in features)
            {
                var f = new Feature { Key = key, Name = name, Category = category, ValueType = vt };
                context.Features.Add(f);
                featureEntities[key] = f;
            }
            await context.SaveChangesAsync();

            // Packages
            var mini = new Package
            {
                Id = Guid.Parse("00000000-0000-0000-0000-000000000401"),
                Name = "mini",
                DisplayName = "Mini",
                Description = "Ιδανικό για μικρές εκδηλώσεις με βασικές ανάγκες",
                Tier = PackageTier.Mini,
                PriceAmount = 49m,
                SortOrder = 0
            };
            var digital = new Package
            {
                Id = Guid.Parse("00000000-0000-0000-0000-000000000402"),
                Name = "digital",
                DisplayName = "Digital",
                Description = "Η πλήρης ψηφιακή πρόσκληση με όλα τα εργαλεία",
                Tier = PackageTier.Digital,
                PriceAmount = 99m,
                SortOrder = 1
            };
            var video = new Package
            {
                Id = Guid.Parse("00000000-0000-0000-0000-000000000403"),
                Name = "video",
                DisplayName = "Video",
                Description = "Η premium εμπειρία με video, audio και απεριόριστες δυνατότητες",
                Tier = PackageTier.Video,
                PriceAmount = 179m,
                SortOrder = 2
            };
            context.Packages.AddRange(mini, digital, video);
            await context.SaveChangesAsync();

            // Package features - Mini
            AddFeature(context, mini.Id, featureEntities, "custom_slug", boolVal: false);
            AddFeature(context, mini.Id, featureEntities, "rsvp_full", boolVal: false);
            AddFeature(context, mini.Id, featureEntities, "max_guests", intVal: 100);
            AddFeature(context, mini.Id, featureEntities, "gallery", boolVal: false);
            AddFeature(context, mini.Id, featureEntities, "max_photos", intVal: 0);
            AddFeature(context, mini.Id, featureEntities, "video_section", boolVal: false);
            AddFeature(context, mini.Id, featureEntities, "background_audio", boolVal: false);
            AddFeature(context, mini.Id, featureEntities, "qr_code", boolVal: false);
            AddFeature(context, mini.Id, featureEntities, "gift_list", boolVal: false);
            AddFeature(context, mini.Id, featureEntities, "custom_colors", boolVal: false);
            AddFeature(context, mini.Id, featureEntities, "custom_fonts", strVal: "none");
            AddFeature(context, mini.Id, featureEntities, "premium_templates", boolVal: false);
            AddFeature(context, mini.Id, featureEntities, "printable_upload", boolVal: false);
            AddFeature(context, mini.Id, featureEntities, "guest_photo_uploads", boolVal: false);
            AddFeature(context, mini.Id, featureEntities, "excel_export", boolVal: false);
            AddFeature(context, mini.Id, featureEntities, "max_emails", intVal: 0);
            AddFeature(context, mini.Id, featureEntities, "event_duration_months", intVal: 3);
            AddFeature(context, mini.Id, featureEntities, "seating_plan", boolVal: false);

            // Package features - Digital
            AddFeature(context, digital.Id, featureEntities, "custom_slug", boolVal: true);
            AddFeature(context, digital.Id, featureEntities, "rsvp_full", boolVal: true);
            AddFeature(context, digital.Id, featureEntities, "max_guests", intVal: 300);
            AddFeature(context, digital.Id, featureEntities, "gallery", boolVal: true);
            AddFeature(context, digital.Id, featureEntities, "max_photos", intVal: 20);
            AddFeature(context, digital.Id, featureEntities, "video_section", boolVal: false);
            AddFeature(context, digital.Id, featureEntities, "background_audio", boolVal: false);
            AddFeature(context, digital.Id, featureEntities, "qr_code", boolVal: true);
            AddFeature(context, digital.Id, featureEntities, "gift_list", boolVal: true);
            AddFeature(context, digital.Id, featureEntities, "custom_colors", boolVal: true);
            AddFeature(context, digital.Id, featureEntities, "custom_fonts", strVal: "limited");
            AddFeature(context, digital.Id, featureEntities, "premium_templates", boolVal: false);
            AddFeature(context, digital.Id, featureEntities, "printable_upload", boolVal: true);
            AddFeature(context, digital.Id, featureEntities, "guest_photo_uploads", boolVal: false);
            AddFeature(context, digital.Id, featureEntities, "excel_export", boolVal: true);
            AddFeature(context, digital.Id, featureEntities, "max_emails", intVal: 100);
            AddFeature(context, digital.Id, featureEntities, "event_duration_months", intVal: 6);
            AddFeature(context, digital.Id, featureEntities, "seating_plan", boolVal: false);

            // Package features - Video
            AddFeature(context, video.Id, featureEntities, "custom_slug", boolVal: true);
            AddFeature(context, video.Id, featureEntities, "rsvp_full", boolVal: true);
            AddFeature(context, video.Id, featureEntities, "max_guests", intVal: 500);
            AddFeature(context, video.Id, featureEntities, "gallery", boolVal: true);
            AddFeature(context, video.Id, featureEntities, "max_photos", intVal: 50);
            AddFeature(context, video.Id, featureEntities, "video_section", boolVal: true);
            AddFeature(context, video.Id, featureEntities, "background_audio", boolVal: true);
            AddFeature(context, video.Id, featureEntities, "qr_code", boolVal: true);
            AddFeature(context, video.Id, featureEntities, "gift_list", boolVal: true);
            AddFeature(context, video.Id, featureEntities, "custom_colors", boolVal: true);
            AddFeature(context, video.Id, featureEntities, "custom_fonts", strVal: "full");
            AddFeature(context, video.Id, featureEntities, "premium_templates", boolVal: true);
            AddFeature(context, video.Id, featureEntities, "printable_upload", boolVal: true);
            AddFeature(context, video.Id, featureEntities, "guest_photo_uploads", boolVal: true);
            AddFeature(context, video.Id, featureEntities, "excel_export", boolVal: true);
            AddFeature(context, video.Id, featureEntities, "max_emails", intVal: 300);
            AddFeature(context, video.Id, featureEntities, "event_duration_months", intVal: 12);
            AddFeature(context, video.Id, featureEntities, "seating_plan", boolVal: true);

            await context.SaveChangesAsync();

            // Create demo subscription for the demo event
            var demoEvent = await context.Events.FirstOrDefaultAsync(e => e.Id == Guid.Parse("00000000-0000-0000-0000-000000000010"));
            if (demoEvent != null)
            {
                context.Subscriptions.Add(new Subscription
                {
                    TenantId = demoEvent.TenantId,
                    EventId = demoEvent.Id,
                    PackageId = digital.Id,
                    Status = SubscriptionStatus.Active,
                    PaidAmount = 99m,
                    PaidCurrency = "EUR",
                    PaidAt = DateTime.UtcNow,
                    ActivatedAt = DateTime.UtcNow,
                    ExpiresAt = DateTime.UtcNow.AddMonths(6)
                });
                await context.SaveChangesAsync();
            }
        }

        if (await context.Packages.AnyAsync() && !await context.AddOnProducts.AnyAsync())
        {
            context.AddOnProducts.AddRange(
                new AddOnProduct
                {
                    Id = Guid.Parse("00000000-0000-0000-0000-000000000501"),
                    Key = "extra_100_guests",
                    DisplayName = "+100 καλεσμένοι",
                    Description = "Επιπλέον 100 θέσεις καλεσμένων",
                    PriceAmount = 19m,
                    FeatureKey = "max_guests",
                    IntegerDelta = 100,
                    SortOrder = 0
                },
                new AddOnProduct
                {
                    Id = Guid.Parse("00000000-0000-0000-0000-000000000502"),
                    Key = "extra_20_photos",
                    DisplayName = "+20 φωτογραφίες",
                    Description = "Επιπλέον 20 φωτογραφίες γκαλερί",
                    PriceAmount = 9m,
                    FeatureKey = "max_photos",
                    IntegerDelta = 20,
                    SortOrder = 1
                },
                new AddOnProduct
                {
                    Id = Guid.Parse("00000000-0000-0000-0000-000000000503"),
                    Key = "guest_photo_uploads",
                    DisplayName = "Φωτογραφίες καλεσμένων (QR)",
                    Description = "Οι καλεσμένοι ανεβάζουν φωτογραφίες σκανάροντας QR κατά την εκδήλωση",
                    PriceAmount = 29m,
                    FeatureKey = "guest_photo_uploads",
                    IntegerDelta = 0,
                    BooleanValue = true,
                    SortOrder = 2
                });
            await context.SaveChangesAsync();
        }
        else if (!await context.AddOnProducts.AnyAsync(a => a.Key == "guest_photo_uploads"))
        {
            context.AddOnProducts.Add(new AddOnProduct
            {
                Id = Guid.Parse("00000000-0000-0000-0000-000000000503"),
                Key = "guest_photo_uploads",
                DisplayName = "Φωτογραφίες καλεσμένων (QR)",
                Description = "Οι καλεσμένοι ανεβάζουν φωτογραφίες σκανάροντας QR κατά την εκδήλωση",
                PriceAmount = 29m,
                FeatureKey = "guest_photo_uploads",
                IntegerDelta = 0,
                BooleanValue = true,
                SortOrder = 2
            });
            await context.SaveChangesAsync();
        }

        // Idempotent: ensure guest_photo_uploads feature exists on existing DBs
        if (!await context.Features.AnyAsync(f => f.Key == "guest_photo_uploads"))
        {
            var feature = new Feature
            {
                Id = Guid.NewGuid(),
                Key = "guest_photo_uploads",
                Name = "Guest photo uploads via QR",
                Category = "media",
                ValueType = FeatureValueType.Boolean
            };
            context.Features.Add(feature);
            await context.SaveChangesAsync();

            var packages = await context.Packages.ToListAsync();
            foreach (var pkg in packages)
            {
                context.PackageFeatures.Add(new PackageFeature
                {
                    PackageId = pkg.Id,
                    FeatureId = feature.Id,
                    BooleanValue = pkg.Tier == PackageTier.Video
                });
            }
            await context.SaveChangesAsync();
        }

        // Idempotent: ensure seating_plan feature exists on existing DBs (Video = max plan only)
        if (!await context.Features.AnyAsync(f => f.Key == "seating_plan"))
        {
            var feature = new Feature
            {
                Id = Guid.NewGuid(),
                Key = "seating_plan",
                Name = "Reception seating / table management",
                Category = "guests",
                ValueType = FeatureValueType.Boolean
            };
            context.Features.Add(feature);
            await context.SaveChangesAsync();

            var packages = await context.Packages.ToListAsync();
            foreach (var pkg in packages)
            {
                context.PackageFeatures.Add(new PackageFeature
                {
                    PackageId = pkg.Id,
                    FeatureId = feature.Id,
                    BooleanValue = pkg.Tier == PackageTier.Video
                });
            }
            await context.SaveChangesAsync();
        }

        await SeedBirthdayTemplateIfMissingAsync(context);
        await SeedClassicGreekWeddingTemplatesAsync(context);
        await ApplyClassicFigmaSkinAsync(context);

        // Demo seed: enable guest uploads + seating on the sample wedding
        var demoEvt = await context.Events.FirstOrDefaultAsync(e =>
            e.Id == Guid.Parse("00000000-0000-0000-0000-000000000010"));
        if (demoEvt is not null
            && !await context.TenantFeatureOverrides.AnyAsync(o =>
                o.EventId == demoEvt.Id && o.FeatureKey == "guest_photo_uploads"))
        {
            context.TenantFeatureOverrides.Add(new TenantFeatureOverride
            {
                Id = Guid.NewGuid(),
                TenantId = demoEvt.TenantId,
                EventId = demoEvt.Id,
                FeatureKey = "guest_photo_uploads",
                BooleanValue = true,
                Reason = "Demo seed"
            });
            await context.SaveChangesAsync();
        }

        if (demoEvt is not null
            && !await context.TenantFeatureOverrides.AnyAsync(o =>
                o.EventId == demoEvt.Id && o.FeatureKey == "seating_plan"))
        {
            context.TenantFeatureOverrides.Add(new TenantFeatureOverride
            {
                Id = Guid.NewGuid(),
                TenantId = demoEvt.TenantId,
                EventId = demoEvt.Id,
                FeatureKey = "seating_plan",
                BooleanValue = true,
                Reason = "Demo seed"
            });
            await context.SaveChangesAsync();
        }
    }

    private static async Task SeedClassicGreekWeddingTemplatesAsync(ApplicationDbContext context)
    {
        var classicTheme = await context.Themes.FirstOrDefaultAsync(t =>
            t.Id == Guid.Parse("00000000-0000-0000-0000-000000000100"));
        if (classicTheme is null)
            classicTheme = await context.Themes.FirstOrDefaultAsync();
        if (classicTheme is null) return;

        var weddingStyles = new (Guid id, string category, string name, string description, int sort, string preview)[]
        {
            (Guid.Parse("00000000-0000-0000-0000-000000000210"), "rustic", "Ρουστίκ", "Φυσικά υλικά, ξύλο & γήινα χρώματα", 0, "https://images.unsplash.com/photo-1519741497674-611481863552?w=900&h=700&fit=crop"),
            (Guid.Parse("00000000-0000-0000-0000-000000000211"), "boho", "Boho Chic", "Αέρινα υφάσματα, pampas & ελεύθερο πνεύμα", 1, "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=900&h=700&fit=crop"),
            (Guid.Parse("00000000-0000-0000-0000-000000000212"), "minimal", "Minimal Chic", "Καθαρές γραμμές, λευκό & λιτή κομψότητα", 2, "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=900&h=700&fit=crop"),
            (Guid.Parse("00000000-0000-0000-0000-000000000213"), "vintage", "Vintage", "Δαντέλες, παστέλ & ρομαντική νοσταλγία", 3, "https://images.unsplash.com/photo-1556337137-c7de215dfa78?w=900&h=700&fit=crop"),
            (Guid.Parse("00000000-0000-0000-0000-000000000214"), "elegant", "Κλασικό Elegant", "Μεγαλοπρεπής δεξίωση & επίσημο στυλ", 4, "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=900&h=700&fit=crop"),
            (Guid.Parse("00000000-0000-0000-0000-000000000215"), "floral", "Floral Romance", "Τριαντάφυλλα, μπορντό & ρομαντικό script", 5, "https://images.unsplash.com/photo-1520854221256-1744189951c6?w=900&h=700&fit=crop"),
            (Guid.Parse("00000000-0000-0000-0000-000000000216"), "wreath", "Botanical Wreath", "Χρυσό στεφάνι & πράσινα φύλλα", 6, "https://images.unsplash.com/photo-1460978812857-470ed1c77af0?w=900&h=700&fit=crop"),
            (Guid.Parse("00000000-0000-0000-0000-000000000217"), "dusty", "Dusty Blue", "Απαλό μπλε & ροζ υδατογραφία", 7, "https://images.unsplash.com/photo-1529636798458-92182e662485?w=900&h=700&fit=crop"),
            (Guid.Parse("00000000-0000-0000-0000-000000000218"), "greengold", "Green & Gold", "Editorial Save the Date, πράσινο & χρυσό", 8, "https://images.unsplash.com/photo-1511285560929-80b456fe9cab?w=900&h=700&fit=crop"),
            (Guid.Parse("00000000-0000-0000-0000-000000000219"), "geometric", "Geometric Floral", "Γεωμετρικό πλαίσιο & peony", 9, "https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=900&h=700&fit=crop"),
        };

        var sectionTypes = new[]
        {
            ("hero", 0, true, true, "{\"title\":\"\",\"subtitle\":\"Σας προσκαλούμε στον γάμο μας\",\"overlayOpacity\":0.3}"),
            ("welcome_text", 1, false, true, "{\"heading\":\"\",\"text\":\"Με ανοιχτές αγκάλες και χαρούμενες καρδιές, σας καλούμε να μοιραστείτε μαζί μας αυτή τη μαγική στιγμή.\"}"),
            ("event_details", 2, true, true, "{\"heading\":\"Η Μέρα μας\",\"dressCode\":\"Επίσημο\"}"),
            ("countdown", 3, false, true, "{\"heading\":\"Αντίστροφη μέτρηση\"}"),
            ("venue", 4, true, true, "{\"heading\":\"Οι Χώροι μας\",\"showMap\":true}"),
            ("participants", 5, false, true, "{\"heading\":\"Με Χαρά Παρουσιάζουμε\"}"),
            ("gallery", 6, false, true, "{\"heading\":\"Εμείς\",\"columns\":3}"),
            ("rsvp", 7, false, true, "{\"heading\":\"Επιβεβαίωση Παρουσίας\",\"showPlusOne\":true,\"showChildrenCount\":true}"),
            ("gift_list", 8, false, false, "{\"heading\":\"Δώρα\"}"),
            ("video", 9, false, false, "{\"heading\":\"Το Βίντεό μας\",\"title\":\"Το Βίντεό μας\",\"subtitle\":\"WEDDING FILM\"}"),
            ("wishes", 10, false, false, "{\"heading\":\"Οι Ευχές σας\",\"title\":\"Οι Ευχές σας\",\"subtitle\":\"Βιβλίο Ευχών\"}"),
            ("quiz", 11, false, false, "{\"heading\":\"Πόσο τους ξέρετε;\",\"title\":\"Πόσο τους ξέρετε;\",\"subtitle\":\"Διασκέδαση\"}"),
            ("vendors", 12, false, false, "{\"heading\":\"Ευχαριστούμε\",\"title\":\"Ευχαριστούμε\",\"subtitle\":\"Οι Συνεργάτες μας\"}"),
            ("footer", 13, true, true, "{\"text\":\"Σας περιμένουμε με χαρά!\"}")
        };

        foreach (var (id, category, name, description, sort, preview) in weddingStyles)
        {
            var existing = await context.InvitationTemplates.FirstOrDefaultAsync(t => t.Id == id);
            if (existing is null)
            {
                context.InvitationTemplates.Add(new InvitationTemplate
                {
                    Id = id,
                    Name = name,
                    Description = description,
                    EventType = EventType.Wedding,
                    Category = category,
                    PreviewImageUrl = preview,
                    DefaultThemeId = classicTheme.Id,
                    SortOrder = sort,
                    IsActive = true
                });
                foreach (var (sectionType, sortOrder, isRequired, isEnabled, defaultConfig) in sectionTypes)
                {
                    context.TemplateSectionDefinitions.Add(new TemplateSectionDefinition
                    {
                        TemplateId = id,
                        SectionType = sectionType,
                        DefaultSortOrder = sortOrder,
                        IsRequired = isRequired,
                        IsEnabledByDefault = isEnabled,
                        DefaultConfigJson = defaultConfig
                    });
                }
            }
            else
            {
                existing.Name = name;
                existing.Description = description;
                existing.Category = category;
                existing.PreviewImageUrl = preview;
                existing.SortOrder = sort;
                existing.IsActive = true;
                existing.EventType = EventType.Wedding;

                var existingTypes = await context.TemplateSectionDefinitions
                    .Where(d => d.TemplateId == id)
                    .Select(d => d.SectionType)
                    .ToListAsync();
                foreach (var (sectionType, sortOrder, isRequired, isEnabled, defaultConfig) in sectionTypes)
                {
                    if (existingTypes.Contains(sectionType)) continue;
                    context.TemplateSectionDefinitions.Add(new TemplateSectionDefinition
                    {
                        TemplateId = id,
                        SectionType = sectionType,
                        DefaultSortOrder = sortOrder,
                        IsRequired = isRequired,
                        IsEnabledByDefault = isEnabled,
                        DefaultConfigJson = defaultConfig
                    });
                }
            }
        }

        // Deactivate legacy wedding templates
        foreach (var legacyId in new[]
        {
            Guid.Parse("00000000-0000-0000-0000-000000000200"),
            Guid.Parse("00000000-0000-0000-0000-000000000201")
        })
        {
            var legacy = await context.InvitationTemplates.FirstOrDefaultAsync(t => t.Id == legacyId);
            if (legacy is not null)
            {
                legacy.IsActive = false;
                if (!legacy.Name.Contains("παλιό", StringComparison.OrdinalIgnoreCase))
                    legacy.Name = legacy.Name + " (παλιό)";
            }
        }

        await context.SaveChangesAsync();

        // Point all published demo invitation versions at rustic style
        var rusticId = Guid.Parse("00000000-0000-0000-0000-000000000210");
        var demoEventId = Guid.Parse("00000000-0000-0000-0000-000000000010");
        if (await context.InvitationTemplates.AnyAsync(t => t.Id == rusticId))
        {
            var demoVersions = await context.InvitationVersions
                .Where(v => v.EventId == demoEventId && v.IsPublished)
                .ToListAsync();
            foreach (var version in demoVersions)
                version.TemplateId = rusticId;
            if (demoVersions.Count > 0)
                await context.SaveChangesAsync();
        }
    }

    private static async Task SeedBirthdayTemplateIfMissingAsync(ApplicationDbContext context)
    {
        var baptismThemeId = Guid.Parse("00000000-0000-0000-0000-000000000103");
        if (!await context.Themes.AnyAsync(t => t.Id == baptismThemeId))
        {
            context.Themes.Add(new Theme
            {
                Id = baptismThemeId,
                Name = "Βάπτιση",
                DisplayFontFamily = "Literata",
                BodyFontFamily = "Inter",
                PrimaryColor = "#3D6B5C",
                SecondaryColor = "#F7F4EE",
                AccentColor = "#3D6B5C",
                BackgroundColor = "#F7F4EE",
                TextColor = "#1A1A18",
                SurfaceColor = "#FFFFFF",
                BorderRadius = "8px"
            });
            await context.SaveChangesAsync();
        }

        var baptismTemplate = await context.InvitationTemplates
            .FirstOrDefaultAsync(t => t.Id == Guid.Parse("00000000-0000-0000-0000-000000000202"));
        if (baptismTemplate is not null && baptismTemplate.DefaultThemeId != baptismThemeId)
        {
            baptismTemplate.DefaultThemeId = baptismThemeId;
            await context.SaveChangesAsync();
        }

        var birthdayId = Guid.Parse("00000000-0000-0000-0000-000000000203");
        if (await context.InvitationTemplates.AnyAsync(t => t.Id == birthdayId || t.Category == "birthday"))
            return;

        var modernTheme = await context.Themes.FirstOrDefaultAsync(t =>
            t.Id == Guid.Parse("00000000-0000-0000-0000-000000000102"));
        if (modernTheme is null)
            modernTheme = await context.Themes.FirstOrDefaultAsync();
        if (modernTheme is null) return;

        var birthdayTemplate = new InvitationTemplate
        {
            Id = birthdayId,
            Name = "Γενέθλια",
            Description = "Εορταστική πρόσκληση γενεθλίων",
            EventType = EventType.Party,
            Category = "birthday",
            DefaultThemeId = modernTheme.Id,
            SortOrder = 0
        };
        context.InvitationTemplates.Add(birthdayTemplate);

        var birthdaySections = new[]
        {
            ("hero", 0, true, true, "{\"title\":\"\",\"subtitle\":\"Σας προσκαλούμε\",\"overlayOpacity\":0.35}"),
            ("welcome_text", 1, false, true, "{\"heading\":\"Γιορτάζουμε\",\"text\":\"\"}"),
            ("event_details", 2, true, true, "{\"heading\":\"Λεπτομέρειες\"}"),
            ("countdown", 3, false, true, "{\"heading\":\"Αντίστροφη μέτρηση\"}"),
            ("venue", 4, true, true, "{\"heading\":\"Τοποθεσία\",\"showMap\":true}"),
            ("participants", 5, false, false, "{\"heading\":\"Διοργανωτής\"}"),
            ("gallery", 6, false, true, "{\"heading\":\"Φωτογραφίες\",\"columns\":2}"),
            ("rsvp", 7, false, true, "{\"heading\":\"Θα έρθετε;\",\"description\":\"Παρακαλούμε απαντήστε\",\"showPlusOne\":true,\"showChildrenCount\":true,\"showMealPreference\":false}"),
            ("footer", 8, true, true, "{\"text\":\"Τα λέμε εκεί!\"}")
        };

        foreach (var (sectionType, sortOrder, isRequired, isEnabled, defaultConfig) in birthdaySections)
        {
            context.TemplateSectionDefinitions.Add(new TemplateSectionDefinition
            {
                TemplateId = birthdayId,
                SectionType = sectionType,
                DefaultSortOrder = sortOrder,
                IsRequired = isRequired,
                IsEnabledByDefault = isEnabled,
                DefaultConfigJson = defaultConfig
            });
        }

        await context.SaveChangesAsync();
    }

    private static async Task ApplyClassicFigmaSkinAsync(ApplicationDbContext context)
    {
        var classicId = Guid.Parse("00000000-0000-0000-0000-000000000100");
        var weddingId = Guid.Parse("00000000-0000-0000-0000-000000000200");
        var demoVersionId = Guid.Parse("00000000-0000-0000-0000-000000000300");

        var classic = await context.Themes.FirstOrDefaultAsync(t => t.Id == classicId);
        if (classic is not null)
        {
            classic.PrimaryColor = "#2E5A4C";
            classic.AccentColor = "#2E5A4C";
            classic.BackgroundColor = "#FAFAF7";
            classic.TextColor = "#1A1A18";
            classic.SurfaceColor = "#FFFFFF";
            classic.BorderRadius = "2px";
            classic.DisplayFontFamily = "Literata";
            classic.BodyFontFamily = "Inter";
        }

        var wedding = await context.InvitationTemplates.FirstOrDefaultAsync(t => t.Id == weddingId);
        if (wedding is not null)
        {
            // Legacy classic template stays inactive; category retained for old invitation versions
            wedding.IsActive = false;
            wedding.SortOrder = 100;
            wedding.PreviewImageUrl = "/templates/classic-wedding-cover.svg";
        }

        var defaultsByType = ClassicWeddingSectionDefaults();

        var templateDefs = await context.TemplateSectionDefinitions
            .Where(d => d.TemplateId == weddingId)
            .ToListAsync();
        foreach (var def in templateDefs)
        {
            if (defaultsByType.TryGetValue(def.SectionType, out var json))
                def.DefaultConfigJson = MergeMissingJson(def.DefaultConfigJson, json);
        }

        var demoSections = await context.InvitationSections
            .Where(s => s.InvitationVersionId == demoVersionId)
            .ToListAsync();
        foreach (var section in demoSections)
        {
            if (defaultsByType.TryGetValue(section.SectionType, out var json))
                section.ConfigurationJson = MergeMissingJson(section.ConfigurationJson, json);
        }

        await context.SaveChangesAsync();
    }

    private static Dictionary<string, string> ClassicWeddingSectionDefaults() => new()
    {
        ["welcome_text"] = "{\"heading\":\"\",\"text\":\"Με ανοιχτές αγκάλες και χαρούμενες καρδιές, σας καλούμε να μοιραστείτε μαζί μας αυτή τη μαγική στιγμή. Ο γάμος μας είναι μια γιορτή αγάπης, και η παρουσία σας θα την κάνει ακόμα πιο ξεχωριστή.\"}",
        ["event_details"] = "{\"heading\":\"Η Μέρα μας\",\"label\":\"Λεπτομέρειες Τελετής\",\"dressCode\":\"Επίσημο\",\"dateLabel\":\"Ημερομηνία\",\"timeLabel\":\"Ώρα Έναρξης\",\"attireLabel\":\"Ενδυμασία\",\"attireSub\":\"Dress Code\",\"showPrintedCard\":true,\"paperLabel\":\"Η Πρόσκληση\",\"paperHeading\":\"Η Έντυπη Πρόσκλησή μας\",\"paperEventType\":\"Γάμος\",\"paperInviteLine\":\"Σας προσκαλούμε στον γάμο μας\"}",
        ["venue"] = "{\"heading\":\"Οι Χώροι μας\",\"label\":\"Τοποθεσίες\",\"showMap\":true,\"mapsLabel\":\"Οδηγίες (Google Maps)\"}",
        ["participants"] = "{\"heading\":\"Με Χαρά Παρουσιάζουμε\",\"label\":\"Οι Πρωταγωνιστές\"}",
        ["gallery"] = "{\"heading\":\"Εμείς\",\"label\":\"Φωτογραφικές Στιγμές\",\"columns\":3,\"hint\":\"Κάντε κλικ σε κάθε φωτογραφία για μεγέθυνση\",\"emptyText\":\"Σύντομα φωτογραφίες από την εκδήλωση.\"}",
        ["rsvp"] = "{\"heading\":\"Επιβεβαίωση Παρουσίας\",\"label\":\"Παρακαλούμε Απαντήστε\",\"description\":\"Παρακαλούμε απαντήστε\",\"showPlusOne\":true,\"showChildrenCount\":true,\"showMealPreference\":false,\"attendingYes\":\"Θα παραστώ\",\"attendingNo\":\"Δεν μπορώ\",\"submitLabel\":\"Αποστολή\",\"submittingLabel\":\"Αποστολή...\",\"nameLabel\":\"Ονοματεπώνυμο\",\"emailLabel\":\"Email (προαιρετικό)\",\"attendingLabel\":\"Παρουσία\",\"adultsLabel\":\"Αριθμός Ατόμων\",\"childrenLabel\":\"Αριθμός παιδιών\",\"plusOneLabel\":\"Όνομα συνοδού\",\"mealLabel\":\"Διατροφική προτίμηση\",\"notesLabel\":\"Σημειώσεις\",\"successTitle\":\"Ευχαριστούμε!\",\"successText\":\"Η απάντησή σας καταχωρήθηκε με επιτυχία.\",\"declineTitle\":\"Λυπούμαστε!\",\"declineText\":\"Η απάντησή σας καταγράφηκε.\"}",
        ["video"] = "{\"heading\":\"Το Βίντεό μας\",\"label\":\"Η Ιστορία μας\",\"emptyText\":\"Δεν υπάρχει βίντεο ακόμα.\"}",
        ["footer"] = "{\"text\":\"Σας περιμένουμε με χαρά!\"}"
    };

    private static string MergeMissingJson(string? currentJson, string defaultsJson)
    {
        var current = JsonNode.Parse(string.IsNullOrWhiteSpace(currentJson) ? "{}" : currentJson) as JsonObject
            ?? new JsonObject();
        var defaults = JsonNode.Parse(defaultsJson) as JsonObject ?? new JsonObject();
        foreach (var kv in defaults)
        {
            if (!current.ContainsKey(kv.Key))
                current[kv.Key] = kv.Value?.DeepClone();
        }
        return current.ToJsonString();
    }

    private static void AddFeature(
        ApplicationDbContext context,
        Guid packageId,
        Dictionary<string, Feature> features,
        string key,
        bool? boolVal = null,
        int? intVal = null,
        string? strVal = null)
    {
        context.PackageFeatures.Add(new PackageFeature
        {
            PackageId = packageId,
            FeatureId = features[key].Id,
            BooleanValue = boolVal,
            IntegerValue = intVal,
            StringValue = strVal
        });
    }
}
