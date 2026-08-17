using InvitationPlatform.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace InvitationPlatform.Infrastructure.Persistence.Configurations;

public class InvitationVersionConfiguration : IEntityTypeConfiguration<InvitationVersion>
{
    public void Configure(EntityTypeBuilder<InvitationVersion> builder)
    {
        builder.ToTable("InvitationVersions");

        builder.HasKey(v => v.Id);
        builder.Property(v => v.Id).HasDefaultValueSql("NEWSEQUENTIALID()");

        builder.Property(v => v.TenantId).IsRequired();
        builder.Property(v => v.RowVersion).IsRowVersion();
        builder.Property(v => v.CreatedAt).HasDefaultValueSql("SYSUTCDATETIME()");

        builder.HasOne(v => v.Event)
            .WithMany(e => e.InvitationVersions)
            .HasForeignKey(v => v.EventId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(v => v.Template)
            .WithMany()
            .HasForeignKey(v => v.TemplateId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(v => v.Theme)
            .WithMany()
            .HasForeignKey(v => v.ThemeId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasOne(v => v.Tenant)
            .WithMany()
            .HasForeignKey(v => v.TenantId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(v => new { v.EventId, v.VersionNumber }).IsUnique();
        builder.HasIndex(v => v.TenantId);
    }
}
