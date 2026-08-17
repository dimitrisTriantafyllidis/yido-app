using InvitationPlatform.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace InvitationPlatform.Infrastructure.Persistence.Configurations;

public class EventPersonConfiguration : IEntityTypeConfiguration<EventPerson>
{
    public void Configure(EntityTypeBuilder<EventPerson> builder)
    {
        builder.ToTable("EventPersons");

        builder.HasKey(ep => ep.Id);
        builder.Property(ep => ep.Id).HasDefaultValueSql("NEWSEQUENTIALID()");

        builder.Property(ep => ep.TenantId).IsRequired();
        builder.Property(ep => ep.EventId).IsRequired();
        builder.Property(ep => ep.Role).IsRequired();
        builder.Property(ep => ep.DisplayName).HasMaxLength(200).IsRequired();
        builder.Property(ep => ep.PhotoUrl).HasMaxLength(500);
        builder.Property(ep => ep.CreatedAt).HasDefaultValueSql("SYSUTCDATETIME()");

        builder.HasOne(ep => ep.Event)
            .WithMany(e => e.Persons)
            .HasForeignKey(ep => ep.EventId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
