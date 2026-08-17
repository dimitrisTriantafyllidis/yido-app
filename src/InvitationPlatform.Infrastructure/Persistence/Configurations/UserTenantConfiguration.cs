using InvitationPlatform.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace InvitationPlatform.Infrastructure.Persistence.Configurations;

public class UserTenantConfiguration : IEntityTypeConfiguration<UserTenant>
{
    public void Configure(EntityTypeBuilder<UserTenant> builder)
    {
        builder.ToTable("UserTenants");

        builder.HasKey(ut => ut.Id);
        builder.Property(ut => ut.Id).HasDefaultValueSql("NEWSEQUENTIALID()");

        builder.Property(ut => ut.UserId).IsRequired();
        builder.Property(ut => ut.TenantId).IsRequired();
        builder.Property(ut => ut.RoleId).IsRequired();
        builder.Property(ut => ut.JoinedAt).HasDefaultValueSql("SYSUTCDATETIME()");

        builder.HasIndex(ut => new { ut.UserId, ut.TenantId }).IsUnique();
        builder.HasIndex(ut => ut.TenantId);

        builder.HasOne(ut => ut.Tenant)
            .WithMany()
            .HasForeignKey(ut => ut.TenantId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
