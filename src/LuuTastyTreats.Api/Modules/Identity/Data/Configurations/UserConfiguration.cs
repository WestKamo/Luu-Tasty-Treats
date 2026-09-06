using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using LuuTastyTreats.Api.Modules.Identity.Domain;
namespace LuuTastyTreats.Api.Modules.Identity.Data.Configurations;
public class UserConfiguration : IEntityTypeConfiguration<User> {
    public void Configure(EntityTypeBuilder<User> builder) {
        builder.ToTable("users", "identity");
        builder.HasKey(u => u.UserId);
        builder.Property(u => u.UserId).HasDefaultValueSql("gen_random_uuid()");
        builder.Property(u => u.Email).HasColumnType("citext").IsRequired();
        builder.HasIndex(u => u.Email).IsUnique();
        builder.Property(u => u.FullName).HasMaxLength(150).IsRequired();
        builder.Property(u => u.AuthProvider).HasMaxLength(30).IsRequired();
    }
}
