using InvitationPlatform.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace InvitationPlatform.Infrastructure.Persistence.Configurations;

public class GuestGroupConfiguration : IEntityTypeConfiguration<GuestGroup>
{
    public void Configure(EntityTypeBuilder<GuestGroup> builder)
    {
        builder.ToTable("GuestGroups");
        builder.HasKey(g => g.Id);
        builder.Property(g => g.Id).HasDefaultValueSql("NEWSEQUENTIALID()");
        builder.Property(g => g.Name).HasMaxLength(200).IsRequired();
        builder.Property(g => g.InviteToken).HasMaxLength(64).IsRequired();
        builder.Property(g => g.CreatedAt).HasDefaultValueSql("SYSUTCDATETIME()");

        builder.HasOne(g => g.Event)
            .WithMany(e => e.GuestGroups)
            .HasForeignKey(g => g.EventId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(g => new { g.TenantId, g.EventId });
        builder.HasIndex(g => g.InviteToken).IsUnique();
    }
}
