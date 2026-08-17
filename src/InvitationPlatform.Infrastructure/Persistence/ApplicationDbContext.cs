using InvitationPlatform.Domain.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace InvitationPlatform.Infrastructure.Persistence;

public class ApplicationUser : IdentityUser<Guid>
{
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Locale { get; set; } = "el";
    public string? AvatarUrl { get; set; }
    public bool IsSystemAdmin { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
    public bool IsDeleted { get; set; }
    public DateTime? DeletedAt { get; set; }
}

public class ApplicationRole : IdentityRole<Guid>
{
    public string? Description { get; set; }
    public bool IsSystemRole { get; set; }
}

public class ApplicationDbContext : IdentityDbContext<ApplicationUser, ApplicationRole, Guid>
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }

    public DbSet<Tenant> Tenants => Set<Tenant>();
    public DbSet<Event> Events => Set<Event>();
    public DbSet<Venue> Venues => Set<Venue>();
    public DbSet<EventPerson> EventPersons => Set<EventPerson>();
    public DbSet<UserTenant> UserTenants => Set<UserTenant>();
    public DbSet<Theme> Themes => Set<Theme>();
    public DbSet<InvitationTemplate> InvitationTemplates => Set<InvitationTemplate>();
    public DbSet<TemplateSectionDefinition> TemplateSectionDefinitions => Set<TemplateSectionDefinition>();
    public DbSet<InvitationVersion> InvitationVersions => Set<InvitationVersion>();
    public DbSet<InvitationSection> InvitationSections => Set<InvitationSection>();
    public DbSet<GuestGroup> GuestGroups => Set<GuestGroup>();
    public DbSet<Guest> Guests => Set<Guest>();
    public DbSet<Rsvp> Rsvps => Set<Rsvp>();
    public DbSet<Package> Packages => Set<Package>();
    public DbSet<Feature> Features => Set<Feature>();
    public DbSet<PackageFeature> PackageFeatures => Set<PackageFeature>();
    public DbSet<Subscription> Subscriptions => Set<Subscription>();
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<MediaFile> MediaFiles => Set<MediaFile>();
    public DbSet<TenantFeatureOverride> TenantFeatureOverrides => Set<TenantFeatureOverride>();
    public DbSet<AddOnProduct> AddOnProducts => Set<AddOnProduct>();
    public DbSet<AuditLog> AuditLogs => Set<AuditLog>();
    public DbSet<RsvpQuestion> RsvpQuestions => Set<RsvpQuestion>();
    public DbSet<RsvpAnswer> RsvpAnswers => Set<RsvpAnswer>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.ApplyConfigurationsFromAssembly(typeof(ApplicationDbContext).Assembly);

        // Rename Identity tables
        modelBuilder.Entity<ApplicationUser>(b => b.ToTable("Users"));
        modelBuilder.Entity<ApplicationRole>(b => b.ToTable("Roles"));
        modelBuilder.Entity<IdentityUserRole<Guid>>(b => b.ToTable("UserRoles"));
        modelBuilder.Entity<IdentityUserClaim<Guid>>(b => b.ToTable("UserClaims"));
        modelBuilder.Entity<IdentityUserLogin<Guid>>(b => b.ToTable("UserLogins"));
        modelBuilder.Entity<IdentityUserToken<Guid>>(b => b.ToTable("UserTokens"));
        modelBuilder.Entity<IdentityRoleClaim<Guid>>(b => b.ToTable("RoleClaims"));
    }

    public override int SaveChanges()
    {
        UpdateTimestamps();
        return base.SaveChanges();
    }

    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        UpdateTimestamps();
        return base.SaveChangesAsync(cancellationToken);
    }

    private void UpdateTimestamps()
    {
        var entries = ChangeTracker.Entries()
            .Where(e => e.State == EntityState.Modified);

        foreach (var entry in entries)
        {
            if (entry.Entity is Domain.Common.BaseEntity entity)
            {
                entity.UpdatedAt = DateTime.UtcNow;
            }
        }
    }
}
