using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using LuuTastyTreats.Api.Modules.Orders.Domain;
namespace LuuTastyTreats.Api.Modules.Orders.Data.Configurations;
public class OrderStatusHistoryConfiguration : IEntityTypeConfiguration<OrderStatusHistory> {
    public void Configure(EntityTypeBuilder<OrderStatusHistory> builder) {
        builder.ToTable("order_status_history", "orders");
        builder.HasKey(h => h.Id);
        builder.Property(h => h.Id).HasDefaultValueSql("gen_random_uuid()");
        builder.Property(h => h.Status).HasMaxLength(30).IsRequired();
    }
}
