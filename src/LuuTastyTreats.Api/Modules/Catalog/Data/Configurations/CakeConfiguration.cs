using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using LuuTastyTreats.Api.Modules.Catalog.Domain;
namespace LuuTastyTreats.Api.Modules.Catalog.Data.Configurations;
public class CakeConfiguration : IEntityTypeConfiguration<Cake> {
    public void Configure(EntityTypeBuilder<Cake> builder) {
        builder.ToTable("cakes", "catalog", t => t.HasCheckConstraint("ck_cakes_base_price_nonnegative", "\"base_price\" >= 0"));
        builder.HasKey(c => c.CakeId);
        builder.Property(c => c.CakeId).HasDefaultValueSql("gen_random_uuid()");
        builder.Property(c => c.Name).HasMaxLength(150).IsRequired();
        builder.Property(c => c.BasePrice).HasColumnType("numeric(10,2)");
        builder.Property(c => c.BaseImageUrl).IsRequired();
        builder.HasOne(c => c.Category).WithMany(cat => cat.Cakes).HasForeignKey(c => c.CategoryId).OnDelete(DeleteBehavior.SetNull);
        builder.HasIndex(c => c.CategoryId).HasFilter("\"is_active\" = true").HasDatabaseName("idx_cakes_category");
    }
}
