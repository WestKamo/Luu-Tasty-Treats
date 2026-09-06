using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using LuuTastyTreats.Api.Modules.Orders.Domain;
namespace LuuTastyTreats.Api.Modules.Orders.Data.Configurations;
public class OrderConfiguration : IEntityTypeConfiguration<Order> {
    public void Configure(EntityTypeBuilder<Order> builder) {
        builder.ToTable("orders", "orders");
        builder.HasKey(o => o.OrderId);
        builder.Property(o => o.OrderId).HasDefaultValueSql("gen_random_uuid()");
        builder.Property(o => o.OrderNumber).HasMaxLength(20).IsRequired();
        builder.HasIndex(o => o.OrderNumber).IsUnique();
        builder.Property(o => o.Status).HasMaxLength(30).IsRequired();
        builder.Property(o => o.DeliveryMethod).HasMaxLength(20).IsRequired();
        builder.Property(o => o.Subtotal).HasColumnType("numeric(10,2)");
        builder.Property(o => o.DeliveryFee).HasColumnType("numeric(10,2)");
        builder.Property(o => o.TaxAmount).HasColumnType("numeric(10,2)");
        builder.Property(o => o.TotalAmount).HasColumnType("numeric(10,2)");
        builder.Property(o => o.IdempotencyKey).HasMaxLength(200);
        builder.HasIndex(o => o.IdempotencyKey).IsUnique();
        builder.HasIndex(o => o.UserId).HasDatabaseName("idx_orders_user");
        builder.HasIndex(o => o.Status).HasDatabaseName("idx_orders_status");
        builder.HasIndex(o => o.RequestedDate).HasDatabaseName("idx_orders_requested_date");
        builder.HasMany(o => o.Items).WithOne(i => i.Order).HasForeignKey(i => i.OrderId).OnDelete(DeleteBehavior.Cascade);
        builder.HasMany(o => o.StatusHistory).WithOne(h => h.Order).HasForeignKey(h => h.OrderId).OnDelete(DeleteBehavior.Cascade);
    }
}
