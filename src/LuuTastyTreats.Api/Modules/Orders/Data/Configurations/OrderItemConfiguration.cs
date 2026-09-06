using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using LuuTastyTreats.Api.Modules.Orders.Domain;
namespace LuuTastyTreats.Api.Modules.Orders.Data.Configurations;
public class OrderItemConfiguration : IEntityTypeConfiguration<OrderItem> {
    public void Configure(EntityTypeBuilder<OrderItem> builder) {
        builder.ToTable("order_items", "orders");
        builder.HasKey(i => i.OrderItemId);
        builder.Property(i => i.OrderItemId).HasDefaultValueSql("gen_random_uuid()");
        builder.Property(i => i.CakeNameSnapshot).HasMaxLength(150).IsRequired();
        builder.Property(i => i.UnitPrice).HasColumnType("numeric(10,2)");
        builder.Property(i => i.LineTotal).HasColumnType("numeric(10,2)");
        builder.Property(i => i.SelectedCustomizationsJson).HasColumnType("jsonb");
        builder.HasIndex(i => i.OrderId).HasDatabaseName("idx_order_items_order");
        builder.HasMany(i => i.Selections).WithOne(s => s.OrderItem).HasForeignKey(s => s.OrderItemId).OnDelete(DeleteBehavior.Cascade);
    }
}
