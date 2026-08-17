using InvitationPlatform.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace InvitationPlatform.Infrastructure.Persistence.Configurations;

public class RsvpConfiguration : IEntityTypeConfiguration<Rsvp>
{
    public void Configure(EntityTypeBuilder<Rsvp> builder)
    {
        builder.ToTable("Rsvps");
        builder.HasKey(r => r.Id);
        builder.Property(r => r.Id).HasDefaultValueSql("NEWSEQUENTIALID()");
        builder.Property(r => r.PlusOneName).HasMaxLength(200);
        builder.Property(r => r.MealPreference).HasMaxLength(50);
        builder.Property(r => r.DietaryNotes).HasMaxLength(500);
        builder.Property(r => r.PublicGuestName).HasMaxLength(200);
        builder.Property(r => r.PublicGuestEmail).HasMaxLength(320);
        builder.Property(r => r.Notes).HasMaxLength(1000);
        builder.Property(r => r.UpdateToken).HasMaxLength(64);
        builder.Property(r => r.IpAddress).HasMaxLength(45);
        builder.Property(r => r.UserAgent).HasMaxLength(500);
        builder.Property(r => r.RowVersion).IsRowVersion();
        builder.Property(r => r.CreatedAt).HasDefaultValueSql("SYSUTCDATETIME()");

        builder.HasOne(r => r.Event)
            .WithMany(e => e.Rsvps)
            .HasForeignKey(r => r.EventId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(r => r.Guest)
            .WithMany(g => g.Rsvps)
            .HasForeignKey(r => r.GuestId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasIndex(r => new { r.TenantId, r.EventId });
        builder.HasIndex(r => r.UpdateToken)
            .IsUnique()
            .HasFilter("[UpdateToken] IS NOT NULL");
    }
}
