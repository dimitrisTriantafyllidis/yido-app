using InvitationPlatform.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace InvitationPlatform.Infrastructure.Persistence.Configurations;

public class TenantFeatureOverrideConfiguration : IEntityTypeConfiguration<TenantFeatureOverride>
{
    public void Configure(EntityTypeBuilder<TenantFeatureOverride> builder)
    {
        builder.ToTable("TenantFeatureOverrides");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Id).HasDefaultValueSql("NEWSEQUENTIALID()");
        builder.Property(x => x.FeatureKey).HasMaxLength(100).IsRequired();
        builder.Property(x => x.StringValue).HasMaxLength(500);
        builder.Property(x => x.Reason).HasMaxLength(500);
        builder.Property(x => x.CreatedAt).HasDefaultValueSql("SYSUTCDATETIME()");
        builder.HasIndex(x => new { x.TenantId, x.EventId, x.FeatureKey });
        builder.HasOne(x => x.Tenant).WithMany().HasForeignKey(x => x.TenantId).OnDelete(DeleteBehavior.Restrict);
        builder.HasOne(x => x.Event).WithMany().HasForeignKey(x => x.EventId).OnDelete(DeleteBehavior.Cascade);
    }
}

public class AddOnProductConfiguration : IEntityTypeConfiguration<AddOnProduct>
{
    public void Configure(EntityTypeBuilder<AddOnProduct> builder)
    {
        builder.ToTable("AddOnProducts");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Id).HasDefaultValueSql("NEWSEQUENTIALID()");
        builder.Property(x => x.Key).HasMaxLength(100).IsRequired();
        builder.Property(x => x.DisplayName).HasMaxLength(200).IsRequired();
        builder.Property(x => x.FeatureKey).HasMaxLength(100).IsRequired();
        builder.Property(x => x.PriceAmount).HasPrecision(18, 2);
        builder.HasIndex(x => x.Key).IsUnique();
    }
}

public class AuditLogConfiguration : IEntityTypeConfiguration<AuditLog>
{
    public void Configure(EntityTypeBuilder<AuditLog> builder)
    {
        builder.ToTable("AuditLogs");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Id).HasDefaultValueSql("NEWSEQUENTIALID()");
        builder.Property(x => x.Action).HasMaxLength(100).IsRequired();
        builder.Property(x => x.EntityType).HasMaxLength(100);
        builder.Property(x => x.EntityId).HasMaxLength(64);
        builder.Property(x => x.Details).HasMaxLength(4000);
        builder.Property(x => x.IpAddress).HasMaxLength(64);
        builder.Property(x => x.CreatedAt).HasDefaultValueSql("SYSUTCDATETIME()");
        builder.HasIndex(x => x.CreatedAt);
        builder.HasIndex(x => new { x.TenantId, x.Action });
    }
}

public class RsvpQuestionConfiguration : IEntityTypeConfiguration<RsvpQuestion>
{
    public void Configure(EntityTypeBuilder<RsvpQuestion> builder)
    {
        builder.ToTable("RsvpQuestions");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Id).HasDefaultValueSql("NEWSEQUENTIALID()");
        builder.Property(x => x.Prompt).HasMaxLength(500).IsRequired();
        builder.Property(x => x.QuestionType).HasMaxLength(32).IsRequired();
        builder.Property(x => x.OptionsJson).HasMaxLength(2000);
        builder.HasOne(x => x.Event).WithMany().HasForeignKey(x => x.EventId).OnDelete(DeleteBehavior.Cascade);
        builder.HasIndex(x => new { x.TenantId, x.EventId });
    }
}

public class RsvpAnswerConfiguration : IEntityTypeConfiguration<RsvpAnswer>
{
    public void Configure(EntityTypeBuilder<RsvpAnswer> builder)
    {
        builder.ToTable("RsvpAnswers");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Id).HasDefaultValueSql("NEWSEQUENTIALID()");
        builder.Property(x => x.Value).HasMaxLength(2000).IsRequired();
        builder.HasOne(x => x.Rsvp).WithMany(r => r.Answers).HasForeignKey(x => x.RsvpId).OnDelete(DeleteBehavior.Cascade);
        builder.HasOne(x => x.Question).WithMany(q => q.Answers).HasForeignKey(x => x.RsvpQuestionId).OnDelete(DeleteBehavior.Restrict);
        builder.HasIndex(x => new { x.RsvpId, x.RsvpQuestionId }).IsUnique();
    }
}
