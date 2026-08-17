using InvitationPlatform.Domain.Entities;
using InvitationPlatform.Domain.Enums;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

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
                BorderRadius = "8px"
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

            context.Themes.AddRange(classicTheme, romanticTheme, modernTheme);
            await context.SaveChangesAsync();

            // Seed templates
            var weddingTemplate = new InvitationTemplate
            {
                Id = Guid.Parse("00000000-0000-0000-0000-000000000200"),
                Name = "Κλασικός Γάμος",
                Description = "Κομψή πρόσκληση γάμου με κλασικό ελληνικό στυλ",
                EventType = EventType.Wedding,
                Category = "classic",
                DefaultThemeId = classicTheme.Id,
                SortOrder = 0
            };

            var romanticWeddingTemplate = new InvitationTemplate
            {
                Id = Guid.Parse("00000000-0000-0000-0000-000000000201"),
                Name = "Ρομαντικός Γάμος",
                Description = "Ρομαντική πρόσκληση με απαλά χρώματα και λουλούδια",
                EventType = EventType.Wedding,
                Category = "romantic",
                DefaultThemeId = romanticTheme.Id,
                SortOrder = 1
            };

            var baptismTemplate = new InvitationTemplate
            {
                Id = Guid.Parse("00000000-0000-0000-0000-000000000202"),
                Name = "Βάπτιση",
                Description = "Χαρούμενη πρόσκληση βάπτισης",
                EventType = EventType.Baptism,
                Category = "classic",
                DefaultThemeId = classicTheme.Id,
                SortOrder = 0
            };

            context.InvitationTemplates.AddRange(weddingTemplate, romanticWeddingTemplate, baptismTemplate);

            // Section definitions for classic wedding template
            var sectionTypes = new[]
            {
                ("hero", 0, true, true, "{\"title\":\"\",\"subtitle\":\"Σας προσκαλούμε στον γάμο μας\",\"overlayOpacity\":0.3}"),
                ("welcome_text", 1, false, true, "{\"heading\":\"Καλωσήρθατε\",\"text\":\"\"}"),
                ("event_details", 2, true, true, "{\"heading\":\"Λεπτομέρειες\"}"),
                ("countdown", 3, false, true, "{\"heading\":\"Αντίστροφη μέτρηση\"}"),
                ("venue", 4, true, true, "{\"heading\":\"Τοποθεσία\",\"showMap\":true}"),
                ("participants", 5, false, true, "{\"heading\":\"Πρόσωπα\"}"),
                ("gallery", 6, false, false, "{\"heading\":\"Φωτογραφίες\",\"columns\":3}"),
                ("rsvp", 7, false, true, "{\"heading\":\"Επιβεβαίωση Παρουσίας\",\"description\":\"Παρακαλούμε απαντήστε\",\"showPlusOne\":true,\"showChildrenCount\":true,\"showMealPreference\":false}"),
                ("gift_list", 8, false, false, "{\"heading\":\"Δώρα\"}"),
                ("video", 9, false, false, "{\"heading\":\"Βίντεο\"}"),
                ("footer", 10, true, true, "{\"text\":\"Σας περιμένουμε με χαρά!\"}")
            };

            foreach (var (sectionType, sortOrder, isRequired, isEnabled, defaultConfig) in sectionTypes)
            {
                context.TemplateSectionDefinitions.Add(new TemplateSectionDefinition
                {
                    TemplateId = weddingTemplate.Id,
                    SectionType = sectionType,
                    DefaultSortOrder = sortOrder,
                    IsRequired = isRequired,
                    IsEnabledByDefault = isEnabled,
                    DefaultConfigJson = defaultConfig
                });

                // Same sections for romantic wedding
                context.TemplateSectionDefinitions.Add(new TemplateSectionDefinition
                {
                    TemplateId = romanticWeddingTemplate.Id,
                    SectionType = sectionType,
                    DefaultSortOrder = sortOrder,
                    IsRequired = isRequired,
                    IsEnabledByDefault = isEnabled,
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

            await context.SaveChangesAsync();

            // Create demo invitation version for the existing demo event
            var demoEvent = await context.Events.FirstOrDefaultAsync(e => e.Id == Guid.Parse("00000000-0000-0000-0000-000000000010"));
            if (demoEvent != null)
            {
                var demoVersion = new InvitationVersion
                {
                    Id = Guid.Parse("00000000-0000-0000-0000-000000000300"),
                    TenantId = demoEvent.TenantId,
                    EventId = demoEvent.Id,
                    TemplateId = weddingTemplate.Id,
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
                        "welcome_text" => "{\"heading\":\"Καλωσήρθατε\",\"text\":\"Με μεγάλη χαρά σας προσκαλούμε να γιορτάσουμε μαζί την ένωσή μας.\"}",
                        "rsvp" => "{\"heading\":\"Επιβεβαίωση Παρουσίας\",\"description\":\"Παρακαλούμε απαντήστε έως τις 31 Αυγούστου 2027\",\"showPlusOne\":true,\"showChildrenCount\":true,\"showMealPreference\":false,\"deadline\":\"2027-08-31\"}",
                        "footer" => "{\"text\":\"Σας περιμένουμε με χαρά! 💕\"}",
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

        // Demo seed: enable guest uploads on the sample wedding (Digital package otherwise lacks it)
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
