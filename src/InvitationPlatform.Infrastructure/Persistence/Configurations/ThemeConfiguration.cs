using InvitationPlatform.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace InvitationPlatform.Infrastructure.Persistence.Configurations;

public class ThemeConfiguration : IEntityTypeConfiguration<Theme>
{
    public void Configure(EntityTypeBuilder<Theme> builder)
    {
        builder.ToTable("Themes");

        builder.HasKey(t => t.Id);
        builder.Property(t => t.Id).HasDefaultValueSql("NEWSEQUENTIALID()");

        builder.Property(t => t.Name).HasMaxLength(100).IsRequired();
        builder.Property(t => t.DisplayFontFamily).HasMaxLength(100).IsRequired();
        builder.Property(t => t.BodyFontFamily).HasMaxLength(100).IsRequired();
        builder.Property(t => t.PrimaryColor).HasMaxLength(7).IsRequired();
        builder.Property(t => t.SecondaryColor).HasMaxLength(7).IsRequired();
        builder.Property(t => t.AccentColor).HasMaxLength(7).IsRequired();
        builder.Property(t => t.BackgroundColor).HasMaxLength(7).IsRequired();
        builder.Property(t => t.TextColor).HasMaxLength(7).IsRequired();
        builder.Property(t => t.SurfaceColor).HasMaxLength(7).IsRequired();
        builder.Property(t => t.BorderRadius).HasMaxLength(10).IsRequired().HasDefaultValue("8px");
        builder.Property(t => t.PreviewImageUrl).HasMaxLength(500);
        builder.Property(t => t.CreatedAt).HasDefaultValueSql("SYSUTCDATETIME()");
    }
}
