using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using LuuTastyTreats.Api.Modules.Identity.Domain;
namespace LuuTastyTreats.Api.Modules.Identity.Data.Configurations;
public class AddressConfiguration : IEntityTypeConfiguration<Address> {
    public void Configure(EntityTypeBuilder<Address> builder) {
        builder.ToTable("addresses", "identity");
        builder.HasKey(a => a.AddressId);
        builder.Property(a => a.AddressId).HasDefaultValueSql("gen_random_uuid()");
        builder.Property(a => a.Line1).HasMaxLength(200).IsRequired();
        builder.Property(a => a.City).HasMaxLength(100).IsRequired();
        builder.Property(a => a.Country).HasMaxLength(100).IsRequired();
        builder.HasOne(a => a.User).WithMany().HasForeignKey(a => a.UserId).OnDelete(DeleteBehavior.Cascade);
    }
}
