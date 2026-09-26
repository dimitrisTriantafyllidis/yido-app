using InvitationPlatform.Domain.Entities;
using InvitationPlatform.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace InvitationPlatform.Infrastructure.Persistence.Configurations;

public class GuestConfiguration : IEntityTypeConfiguration<Guest>
{
    public void Configure(EntityTypeBuilder<Guest> builder)
    {
        builder.ToTable("Guests");
        builder.HasKey(g => g.Id);
        builder.Property(g => g.Id).HasDefaultValueSql("NEWSEQUENTIALID()");
        builder.Property(g => g.FirstName).HasMaxLength(100).IsRequired();
        builder.Property(g => g.LastName).HasMaxLength(100).IsRequired();
        builder.Property(g => g.Email).HasMaxLength(320);
        builder.Property(g => g.Phone).HasMaxLength(20);
        builder.Property(g => g.Tags).HasMaxLength(500);
        builder.Property(g => g.Notes).HasMaxLength(1000);
        builder.Property(g => g.InviteToken).HasMaxLength(64).IsRequired();
        builder.Property(g => g.InvitationSentVia).HasConversion<byte>();
        builder.Property(g => g.CreatedAt).HasDefaultValueSql("SYSUTCDATETIME()");

        builder.HasOne(g => g.Event)
            .WithMany(e => e.Guests)
            .HasForeignKey(g => g.EventId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(g => g.GuestGroup)
            .WithMany(gg => gg.Guests)
            .HasForeignKey(g => g.GuestGroupId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasOne(g => g.EventTable)
            .WithMany(t => t.Guests)
            .HasForeignKey(g => g.EventTableId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasIndex(g => new { g.TenantId, g.EventId });
        builder.HasIndex(g => g.InviteToken).IsUnique();
        builder.HasIndex(g => g.EventTableId);

        // Note: Query filter (soft-delete + tenant) is applied centrally in ApplicationDbContext
    }
}
