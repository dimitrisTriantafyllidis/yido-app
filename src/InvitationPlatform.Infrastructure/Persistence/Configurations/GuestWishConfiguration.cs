using InvitationPlatform.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace InvitationPlatform.Infrastructure.Persistence.Configurations;

public class GuestWishConfiguration : IEntityTypeConfiguration<GuestWish>
{
    public void Configure(EntityTypeBuilder<GuestWish> builder)
    {
        builder.ToTable("GuestWishes");
        builder.HasKey(w => w.Id);
        builder.Property(w => w.Id).HasDefaultValueSql("NEWSEQUENTIALID()");
        builder.Property(w => w.TenantId).IsRequired();
        builder.Property(w => w.EventId).IsRequired();
        builder.Property(w => w.GuestName).HasMaxLength(120).IsRequired();
        builder.Property(w => w.Message).HasMaxLength(1000).IsRequired();
        builder.Property(w => w.CreatedAt).HasDefaultValueSql("SYSUTCDATETIME()");

        builder.HasOne(w => w.Event)
            .WithMany(e => e.Wishes)
            .HasForeignKey(w => w.EventId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(w => w.EventId);
        builder.HasIndex(w => new { w.TenantId, w.EventId, w.CreatedAt });
    }
}
