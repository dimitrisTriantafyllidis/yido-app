using InvitationPlatform.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace InvitationPlatform.Infrastructure.Persistence.Configurations;

public class VenueConfiguration : IEntityTypeConfiguration<Venue>
{
    public void Configure(EntityTypeBuilder<Venue> builder)
    {
        builder.ToTable("Venues");

        builder.HasKey(v => v.Id);
        builder.Property(v => v.Id).HasDefaultValueSql("NEWSEQUENTIALID()");

        builder.Property(v => v.TenantId).IsRequired();
        builder.Property(v => v.EventId).IsRequired();
        builder.Property(v => v.Name).HasMaxLength(200).IsRequired();
        builder.Property(v => v.VenueType).IsRequired();
        builder.Property(v => v.Address).HasMaxLength(500);
        builder.Property(v => v.City).HasMaxLength(100);
        builder.Property(v => v.GoogleMapsUrl).HasMaxLength(500);
        builder.Property(v => v.Latitude).HasColumnType("decimal(9,6)");
        builder.Property(v => v.Longitude).HasColumnType("decimal(9,6)");
        builder.Property(v => v.Notes).HasMaxLength(1000);
        builder.Property(v => v.CreatedAt).HasDefaultValueSql("SYSUTCDATETIME()");

        builder.HasOne(v => v.Event)
            .WithMany(e => e.Venues)
            .HasForeignKey(v => v.EventId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
