using LuuTastyTreats.Api.Modules.Payments.Domain;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
namespace LuuTastyTreats.Api.Modules.Payments.Data.Configurations;
public sealed class PaymentTransactionConfiguration : IEntityTypeConfiguration<PaymentTransaction> {
    public void Configure(EntityTypeBuilder<PaymentTransaction> builder) {
        builder.ToTable("payment_transactions", "orders");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Id).HasDefaultValueSql("gen_random_uuid()");
        builder.Property(x => x.OrderId).IsRequired();
        builder.Property(x => x.Gateway).HasMaxLength(30).IsRequired();
        builder.Property(x => x.GatewayReference).HasMaxLength(100).IsRequired();
        builder.Property(x => x.Status).HasMaxLength(30).IsRequired();
        builder.Property(x => x.Currency).HasMaxLength(3).IsRequired();
        builder.Property(x => x.Amount).HasColumnType("numeric(12,2)").IsRequired();
        builder.Property(x => x.RawPayload).HasColumnType("text").IsRequired();
        builder.Property(x => x.FailureReason).HasMaxLength(500);
        builder.Property(x => x.CreatedAt).IsRequired();
        
        // Composite unique index for idempotency against duplicate ITN callbacks
        builder.HasIndex(x => new { x.Gateway, x.GatewayReference }).IsUnique();
        builder.HasIndex(x => x.OrderId);
    }
}
