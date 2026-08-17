using InvitationPlatform.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace InvitationPlatform.Infrastructure.Persistence.Configurations;

public class PackageFeatureConfiguration : IEntityTypeConfiguration<PackageFeature>
{
    public void Configure(EntityTypeBuilder<PackageFeature> builder)
    {
        builder.ToTable("PackageFeatures");
        builder.HasKey(pf => new { pf.PackageId, pf.FeatureId });
        builder.Property(pf => pf.StringValue).HasMaxLength(500);

        builder.HasOne(pf => pf.Package)
            .WithMany(p => p.PackageFeatures)
            .HasForeignKey(pf => pf.PackageId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(pf => pf.Feature)
            .WithMany()
            .HasForeignKey(pf => pf.FeatureId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
