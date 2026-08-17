using InvitationPlatform.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace InvitationPlatform.Infrastructure.Persistence.Configurations;

public class OrderConfiguration : IEntityTypeConfiguration<Order>
{
    public void Configure(EntityTypeBuilder<Order> builder)
    {
        builder.ToTable("Orders");
        builder.HasKey(o => o.Id);
        builder.Property(o => o.Id).HasDefaultValueSql("NEWSEQUENTIALID()");
        builder.Property(o => o.Amount).HasColumnType("decimal(10,2)");
        builder.Property(o => o.Currency).HasMaxLength(3).IsRequired().HasDefaultValue("EUR");
        builder.Property(o => o.StripeSessionId).HasMaxLength(200);
        builder.Property(o => o.StripePaymentIntentId).HasMaxLength(200);
        builder.Property(o => o.CreatedAt).HasDefaultValueSql("SYSUTCDATETIME()");
        builder.HasIndex(o => o.RelatedEntityId);

        builder.HasOne(o => o.Tenant)
            .WithMany()
            .HasForeignKey(o => o.TenantId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(o => o.Subscription)
            .WithMany(s => s.Orders)
            .HasForeignKey(o => o.SubscriptionId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasIndex(o => o.TenantId);
        builder.HasIndex(o => o.StripeSessionId);
    }
}
