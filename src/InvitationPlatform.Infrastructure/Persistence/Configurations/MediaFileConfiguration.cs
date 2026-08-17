using InvitationPlatform.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace InvitationPlatform.Infrastructure.Persistence.Configurations;

public class MediaFileConfiguration : IEntityTypeConfiguration<MediaFile>
{
    public void Configure(EntityTypeBuilder<MediaFile> builder)
    {
        builder.ToTable("MediaFiles");
        builder.HasKey(m => m.Id);
        builder.Property(m => m.Id).HasDefaultValueSql("NEWSEQUENTIALID()");
        builder.Property(m => m.OriginalFileName).HasMaxLength(500).IsRequired();
        builder.Property(m => m.StoredFileName).HasMaxLength(500).IsRequired();
        builder.Property(m => m.ContentType).HasMaxLength(100).IsRequired();
        builder.Property(m => m.ThumbnailFileName).HasMaxLength(500);
        builder.Property(m => m.AltText).HasMaxLength(500);
        builder.Property(m => m.GuestDisplayName).HasMaxLength(200);
        builder.Property(m => m.CreatedAt).HasDefaultValueSql("SYSUTCDATETIME()");

        builder.HasOne(m => m.Tenant)
            .WithMany()
            .HasForeignKey(m => m.TenantId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(m => m.Event)
            .WithMany()
            .HasForeignKey(m => m.EventId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(m => new { m.TenantId, m.EventId });
        builder.HasIndex(m => new { m.EventId, m.IsGuestUpload });
    }
}
