using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using LuuTastyTreats.Api.Modules.Identity.Domain;
namespace LuuTastyTreats.Api.Modules.Identity.Data.Configurations;
public class RoleConfiguration : IEntityTypeConfiguration<Role> {
    public void Configure(EntityTypeBuilder<Role> builder) {
        builder.ToTable("roles", "identity");
        builder.HasKey(r => r.RoleId);
        builder.Property(r => r.RoleId).HasDefaultValueSql("gen_random_uuid()");
        builder.Property(r => r.Name).HasMaxLength(50).IsRequired();
        builder.HasIndex(r => r.Name).IsUnique();
    }
}
