using InvitationPlatform.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace InvitationPlatform.Infrastructure.Persistence.Configurations;

public class PackageConfiguration : IEntityTypeConfiguration<Package>
{
    public void Configure(EntityTypeBuilder<Package> builder)
    {
        builder.ToTable("Packages");
        builder.HasKey(p => p.Id);
        builder.Property(p => p.Id).HasDefaultValueSql("NEWSEQUENTIALID()");
        builder.Property(p => p.Name).HasMaxLength(100).IsRequired();
        builder.Property(p => p.DisplayName).HasMaxLength(200).IsRequired();
        builder.Property(p => p.Description).HasMaxLength(1000);
        builder.Property(p => p.PriceAmount).HasColumnType("decimal(10,2)");
        builder.Property(p => p.PriceCurrency).HasMaxLength(3).IsRequired().HasDefaultValue("EUR");
        builder.Property(p => p.StripePriceId).HasMaxLength(100);
        builder.Property(p => p.Settings).HasColumnType("nvarchar(max)");
        builder.Property(p => p.CreatedAt).HasDefaultValueSql("SYSUTCDATETIME()");

        builder.HasIndex(p => p.Tier);
        builder.HasIndex(p => p.IsActive);
    }
}
