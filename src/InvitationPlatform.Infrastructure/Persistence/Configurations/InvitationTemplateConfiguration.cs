using InvitationPlatform.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace InvitationPlatform.Infrastructure.Persistence.Configurations;

public class InvitationTemplateConfiguration : IEntityTypeConfiguration<InvitationTemplate>
{
    public void Configure(EntityTypeBuilder<InvitationTemplate> builder)
    {
        builder.ToTable("InvitationTemplates");

        builder.HasKey(t => t.Id);
        builder.Property(t => t.Id).HasDefaultValueSql("NEWSEQUENTIALID()");

        builder.Property(t => t.Name).HasMaxLength(200).IsRequired();
        builder.Property(t => t.Description).HasMaxLength(1000);
        builder.Property(t => t.EventType).IsRequired();
        builder.Property(t => t.Category).HasMaxLength(50);
        builder.Property(t => t.PreviewImageUrl).HasMaxLength(500);
        builder.Property(t => t.CreatedAt).HasDefaultValueSql("SYSUTCDATETIME()");

        builder.HasOne(t => t.DefaultTheme)
            .WithMany()
            .HasForeignKey(t => t.DefaultThemeId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasIndex(t => t.EventType);
        builder.HasIndex(t => t.IsActive);
    }
}
