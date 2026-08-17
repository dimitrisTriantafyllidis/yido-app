using InvitationPlatform.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace InvitationPlatform.Infrastructure.Persistence.Configurations;

public class SubscriptionConfiguration : IEntityTypeConfiguration<Subscription>
{
    public void Configure(EntityTypeBuilder<Subscription> builder)
    {
        builder.ToTable("Subscriptions");
        builder.HasKey(s => s.Id);
        builder.Property(s => s.Id).HasDefaultValueSql("NEWSEQUENTIALID()");
        builder.Property(s => s.StripeSessionId).HasMaxLength(200);
        builder.Property(s => s.StripePaymentIntentId).HasMaxLength(200);
        builder.Property(s => s.PaidAmount).HasColumnType("decimal(10,2)");
        builder.Property(s => s.PaidCurrency).HasMaxLength(3);
        builder.Property(s => s.CreatedAt).HasDefaultValueSql("SYSUTCDATETIME()");

        builder.HasOne(s => s.Tenant)
            .WithMany()
            .HasForeignKey(s => s.TenantId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(s => s.Event)
            .WithMany()
            .HasForeignKey(s => s.EventId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(s => s.Package)
            .WithMany()
            .HasForeignKey(s => s.PackageId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(s => new { s.TenantId, s.EventId });
        builder.HasIndex(s => s.StripeSessionId);
    }
}
