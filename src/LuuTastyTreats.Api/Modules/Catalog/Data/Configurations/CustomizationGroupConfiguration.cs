using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using LuuTastyTreats.Api.Modules.Catalog.Domain;
namespace LuuTastyTreats.Api.Modules.Catalog.Data.Configurations;
public class CustomizationGroupConfiguration : IEntityTypeConfiguration<CustomizationGroup> {
    public void Configure(EntityTypeBuilder<CustomizationGroup> builder) {
        builder.ToTable("customization_groups", "catalog");
        builder.HasKey(g => g.GroupId);
        builder.Property(g => g.GroupId).HasDefaultValueSql("gen_random_uuid()");
        builder.Property(g => g.Name).HasMaxLength(100).IsRequired();
        builder.Property(g => g.SelectionType).HasConversion<string>().HasMaxLength(10).IsRequired();
    }
}
