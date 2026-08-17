using InvitationPlatform.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace InvitationPlatform.Infrastructure.Persistence.Configurations;

public class EventConfiguration : IEntityTypeConfiguration<Event>
{
    public void Configure(EntityTypeBuilder<Event> builder)
    {
        builder.ToTable("Events");

        builder.HasKey(e => e.Id);
        builder.Property(e => e.Id).HasDefaultValueSql("NEWSEQUENTIALID()");

        builder.Property(e => e.TenantId).IsRequired();
        builder.Property(e => e.Title).HasMaxLength(300).IsRequired();
        builder.Property(e => e.EventType).IsRequired();
        builder.Property(e => e.Timezone).HasMaxLength(50).IsRequired().HasDefaultValue("Europe/Athens");
        builder.Property(e => e.Status).IsRequired();
        builder.Property(e => e.Slug).HasMaxLength(150);
        builder.Property(e => e.Locale).HasMaxLength(10).IsRequired().HasDefaultValue("el");
        builder.Property(e => e.CoverImageUrl).HasMaxLength(500);
        builder.Property(e => e.Description).HasMaxLength(2000);
        builder.Property(e => e.Settings).HasColumnType("nvarchar(max)");
        builder.Property(e => e.RowVersion).IsRowVersion();
        builder.Property(e => e.CreatedAt).HasDefaultValueSql("SYSUTCDATETIME()");

        builder.HasIndex(e => e.TenantId);
        builder.HasIndex(e => e.Slug)
            .IsUnique()
            .HasFilter("[Slug] IS NOT NULL AND [IsDeleted] = 0");
        builder.HasIndex(e => new { e.TenantId, e.Status });
        builder.HasIndex(e => e.EventDate);

        builder.HasOne(e => e.Tenant)
            .WithMany(t => t.Events)
            .HasForeignKey(e => e.TenantId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasQueryFilter(e => !e.IsDeleted);
    }
}
