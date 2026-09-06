using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using LuuTastyTreats.Api.Modules.Catalog.Domain;
namespace LuuTastyTreats.Api.Modules.Catalog.Data.Configurations;
public class CakeImageConfiguration : IEntityTypeConfiguration<CakeImage> {
    public void Configure(EntityTypeBuilder<CakeImage> builder) {
        builder.ToTable("cake_images", "catalog");
        builder.HasKey(i => i.ImageId);
        builder.Property(i => i.ImageId).HasDefaultValueSql("gen_random_uuid()");
        builder.HasOne(i => i.Cake).WithMany(c => c.Images).HasForeignKey(i => i.CakeId).OnDelete(DeleteBehavior.Cascade);
    }
}
