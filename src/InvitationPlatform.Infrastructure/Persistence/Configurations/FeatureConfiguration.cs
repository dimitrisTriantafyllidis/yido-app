using InvitationPlatform.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace InvitationPlatform.Infrastructure.Persistence.Configurations;

public class FeatureConfiguration : IEntityTypeConfiguration<Feature>
{
    public void Configure(EntityTypeBuilder<Feature> builder)
    {
        builder.ToTable("Features");
        builder.HasKey(f => f.Id);
        builder.Property(f => f.Id).HasDefaultValueSql("NEWSEQUENTIALID()");
        builder.Property(f => f.Key).HasMaxLength(100).IsRequired();
        builder.Property(f => f.Name).HasMaxLength(200).IsRequired();
        builder.Property(f => f.Description).HasMaxLength(500);
        builder.Property(f => f.Category).HasMaxLength(50).IsRequired();
        builder.Property(f => f.CreatedAt).HasDefaultValueSql("SYSUTCDATETIME()");

        builder.HasIndex(f => f.Key).IsUnique();
    }
}
