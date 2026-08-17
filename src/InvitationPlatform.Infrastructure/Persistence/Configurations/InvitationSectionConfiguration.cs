using InvitationPlatform.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace InvitationPlatform.Infrastructure.Persistence.Configurations;

public class InvitationSectionConfiguration : IEntityTypeConfiguration<InvitationSection>
{
    public void Configure(EntityTypeBuilder<InvitationSection> builder)
    {
        builder.ToTable("InvitationSections");

        builder.HasKey(s => s.Id);
        builder.Property(s => s.Id).HasDefaultValueSql("NEWSEQUENTIALID()");

        builder.Property(s => s.TenantId).IsRequired();
        builder.Property(s => s.SectionType).HasMaxLength(50).IsRequired();
        builder.Property(s => s.ConfigurationJson).HasColumnType("nvarchar(max)");
        builder.Property(s => s.RowVersion).IsRowVersion();
        builder.Property(s => s.CreatedAt).HasDefaultValueSql("SYSUTCDATETIME()");

        builder.HasOne(s => s.InvitationVersion)
            .WithMany(v => v.Sections)
            .HasForeignKey(s => s.InvitationVersionId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(s => new { s.InvitationVersionId, s.SortOrder });
        builder.HasIndex(s => s.TenantId);
    }
}
