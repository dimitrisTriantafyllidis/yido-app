using InvitationPlatform.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace InvitationPlatform.Infrastructure.Persistence.Configurations;

public class TemplateSectionDefinitionConfiguration : IEntityTypeConfiguration<TemplateSectionDefinition>
{
    public void Configure(EntityTypeBuilder<TemplateSectionDefinition> builder)
    {
        builder.ToTable("TemplateSectionDefinitions");

        builder.HasKey(s => s.Id);
        builder.Property(s => s.Id).HasDefaultValueSql("NEWSEQUENTIALID()");

        builder.Property(s => s.SectionType).HasMaxLength(50).IsRequired();
        builder.Property(s => s.DefaultConfigJson).HasColumnType("nvarchar(max)");
        builder.Property(s => s.CreatedAt).HasDefaultValueSql("SYSUTCDATETIME()");

        builder.HasOne(s => s.Template)
            .WithMany(t => t.SectionDefinitions)
            .HasForeignKey(s => s.TemplateId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(s => new { s.TemplateId, s.DefaultSortOrder });
    }
}
