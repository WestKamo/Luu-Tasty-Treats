using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using LuuTastyTreats.Api.Modules.Orders.Domain;
namespace LuuTastyTreats.Api.Modules.Orders.Data.Configurations;
public class OrderItemCustomizationSelectionConfiguration : IEntityTypeConfiguration<OrderItemCustomizationSelection> {
    public void Configure(EntityTypeBuilder<OrderItemCustomizationSelection> builder) {
        builder.ToTable("order_item_customization_selections", "orders");
        builder.HasKey(s => s.Id);
        builder.Property(s => s.Id).HasDefaultValueSql("gen_random_uuid()");
        builder.Property(s => s.OptionLabelSnapshot).HasMaxLength(150).IsRequired();
        builder.Property(s => s.GroupNameSnapshot).HasMaxLength(100).IsRequired();
        builder.Property(s => s.PriceModifier).HasColumnType("numeric(10,2)");
    }
}
