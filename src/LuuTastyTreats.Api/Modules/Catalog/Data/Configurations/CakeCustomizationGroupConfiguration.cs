using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using LuuTastyTreats.Api.Modules.Catalog.Domain;
namespace LuuTastyTreats.Api.Modules.Catalog.Data.Configurations;
public class CakeCustomizationGroupConfiguration : IEntityTypeConfiguration<CakeCustomizationGroup> {
    public void Configure(EntityTypeBuilder<CakeCustomizationGroup> builder) {
        builder.ToTable("cake_customization_groups", "catalog");
        builder.HasKey(m => new { m.CakeId, m.GroupId });
        builder.HasOne(m => m.Cake).WithMany(c => c.CustomizationGroups).HasForeignKey(m => m.CakeId).OnDelete(DeleteBehavior.Cascade);
        builder.HasOne(m => m.Group).WithMany(g => g.CakeMappings).HasForeignKey(m => m.GroupId).OnDelete(DeleteBehavior.Cascade);
    }
}
