using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using LuuTastyTreats.Api.Modules.Catalog.Domain;
namespace LuuTastyTreats.Api.Modules.Catalog.Data.Configurations;
public class CustomizationOptionConfiguration : IEntityTypeConfiguration<CustomizationOption> {
    public void Configure(EntityTypeBuilder<CustomizationOption> builder) {
        builder.ToTable("customization_options", "catalog");
        builder.HasKey(o => o.OptionId);
        builder.Property(o => o.OptionId).HasDefaultValueSql("gen_random_uuid()");
        builder.Property(o => o.Label).HasMaxLength(150).IsRequired();
        builder.Property(o => o.PriceModifier).HasColumnType("numeric(10,2)");
        builder.HasOne(o => o.Group).WithMany(g => g.Options).HasForeignKey(o => o.GroupId).OnDelete(DeleteBehavior.Cascade);
        builder.HasIndex(o => o.GroupId).HasFilter("\"is_available\" = true").HasDatabaseName("idx_options_group");
    }
}
