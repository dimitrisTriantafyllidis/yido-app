using InvitationPlatform.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace InvitationPlatform.Infrastructure.Persistence.Configurations;

public class EventTableConfiguration : IEntityTypeConfiguration<EventTable>
{
    public void Configure(EntityTypeBuilder<EventTable> builder)
    {
        builder.ToTable("EventTables");

        builder.HasKey(t => t.Id);
        builder.Property(t => t.Id).HasDefaultValueSql("NEWSEQUENTIALID()");
        builder.Property(t => t.TenantId).IsRequired();
        builder.Property(t => t.EventId).IsRequired();
        builder.Property(t => t.Name).HasMaxLength(100).IsRequired();
        builder.Property(t => t.CategoryLabel).HasMaxLength(200);
        builder.Property(t => t.Capacity).IsRequired();
        builder.Property(t => t.CreatedAt).HasDefaultValueSql("SYSUTCDATETIME()");

        builder.HasOne(t => t.Event)
            .WithMany(e => e.Tables)
            .HasForeignKey(t => t.EventId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(t => new { t.TenantId, t.EventId });
        builder.HasIndex(t => new { t.EventId, t.SortOrder });
    }
}
