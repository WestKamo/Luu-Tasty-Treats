using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using LuuTastyTreats.Api.Modules.Catalog.Domain;
namespace LuuTastyTreats.Api.Modules.Catalog.Data.Configurations;
public class CakeTextFieldConfiguration : IEntityTypeConfiguration<CakeTextField> {
    public void Configure(EntityTypeBuilder<CakeTextField> builder) {
        builder.ToTable("cake_text_fields", "catalog");
        builder.HasKey(f => f.FieldId);
        builder.Property(f => f.FieldId).HasDefaultValueSql("gen_random_uuid()");
        builder.HasOne(f => f.Cake).WithMany(c => c.TextFields).HasForeignKey(f => f.CakeId).OnDelete(DeleteBehavior.Cascade);
    }
}
