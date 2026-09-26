using InvitationPlatform.Application.Common.Interfaces;
using InvitationPlatform.Domain.Common;
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
    private readonly ITenantContext? _tenantContext;

    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }

    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options, ITenantContext tenantContext)
        : base(options)
    {
        _tenantContext = tenantContext;
    }

    /// <summary>
    /// Current tenant ID used for query filters. Returns Guid.Empty for system admins 
    /// (which will filter nothing since no entity has TenantId = Guid.Empty).
    /// This is evaluated at query time, not model building time.
    /// </summary>
    private Guid CurrentTenantId => _tenantContext?.TenantId ?? Guid.Empty;
    private bool IsSystemAdmin => _tenantContext?.IsSystemAdmin ?? false;

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
    public DbSet<EventTable> EventTables => Set<EventTable>();
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
    public DbSet<GuestWish> GuestWishes => Set<GuestWish>();

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

        // Global tenant query filters for all ITenantEntity types
        // System admins bypass the filter; regular users only see their tenant's data
        ApplyTenantFilter<EventPerson>(modelBuilder);
        ApplyTenantFilter<EventTable>(modelBuilder);
        ApplyTenantFilter<GuestGroup>(modelBuilder);
        ApplyTenantFilter<GuestWish>(modelBuilder);
        ApplyTenantFilter<InvitationSection>(modelBuilder);
        ApplyTenantFilter<InvitationVersion>(modelBuilder);
        ApplyTenantFilter<MediaFile>(modelBuilder);
        ApplyTenantFilter<Order>(modelBuilder);
        ApplyTenantFilter<Rsvp>(modelBuilder);
        ApplyTenantFilter<RsvpAnswer>(modelBuilder);
        ApplyTenantFilter<RsvpQuestion>(modelBuilder);
        ApplyTenantFilter<Subscription>(modelBuilder);
        ApplyTenantFilter<TenantFeatureOverride>(modelBuilder);
        ApplyTenantFilter<Venue>(modelBuilder);

        // Entities with soft-delete need combined filters
        ApplyTenantFilterWithSoftDelete<Event>(modelBuilder);
        ApplyTenantFilterWithSoftDelete<Guest>(modelBuilder);
    }

    private void ApplyTenantFilter<TEntity>(ModelBuilder modelBuilder)
        where TEntity : class, ITenantEntity
    {
        modelBuilder.Entity<TEntity>().HasQueryFilter(
            e => IsSystemAdmin || e.TenantId == CurrentTenantId);
    }

    private void ApplyTenantFilterWithSoftDelete<TEntity>(ModelBuilder modelBuilder)
        where TEntity : class, ITenantEntity, ISoftDeletable
    {
        modelBuilder.Entity<TEntity>().HasQueryFilter(
            e => !e.IsDeleted && (IsSystemAdmin || e.TenantId == CurrentTenantId));
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
