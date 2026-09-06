using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using LuuTastyTreats.Api.Modules.Catalog.Domain;
namespace LuuTastyTreats.Api.Modules.Catalog.Data.Configurations;
public class CategoryConfiguration : IEntityTypeConfiguration<Category> {
    public void Configure(EntityTypeBuilder<Category> builder) {
        builder.ToTable("categories", "catalog");
        builder.HasKey(c => c.CategoryId);
        builder.Property(c => c.CategoryId).HasDefaultValueSql("gen_random_uuid()");
        builder.Property(c => c.Name).HasMaxLength(100).IsRequired();
    }
}
