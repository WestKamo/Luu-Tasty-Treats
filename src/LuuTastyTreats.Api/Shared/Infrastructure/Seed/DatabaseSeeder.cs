using LuuTastyTreats.Api.Modules.Catalog.Domain;
using LuuTastyTreats.Api.Modules.Identity.Domain;
using Microsoft.EntityFrameworkCore;
namespace LuuTastyTreats.Api.Shared.Infrastructure.Seed;
public static class DatabaseSeeder {
    public static async Task SeedAsync(AppDbContext db, IConfiguration config, ILogger logger) {
        await SeedRolesAsync(db, logger);
        await SeedSuperAdminsAsync(db, config, logger);
        await SeedCatalogAsync(db, logger);
    }
    private static async Task SeedRolesAsync(AppDbContext db, ILogger logger) {
        string[] roleNames = { "Customer", "Admin", "SuperAdmin" };
        foreach (var name in roleNames) {
            var exists = await db.Roles.AnyAsync(r => r.Name == name);
            if (!exists) {
                db.Roles.Add(new Role { RoleId = Guid.NewGuid(), Name = name });
                logger.LogInformation("Seeded role: {RoleName}", name);
            }
        }
        await db.SaveChangesAsync();
    }
    private static async Task SeedSuperAdminsAsync(AppDbContext db, IConfiguration config, ILogger logger) {
        var superAdminRole = await db.Roles.SingleAsync(r => r.Name == "SuperAdmin");
        var seedAdmins = config.GetSection("SeedAdmins").Get<List<SeedAdminEntry>>() ?? new();
        if (seedAdmins.Count == 0) return;
        foreach (var admin in seedAdmins) {
            var exists = await db.Users.AnyAsync(u => u.Email == admin.Email);
            if (exists) continue;
            var user = new User {
                UserId = Guid.NewGuid(), Email = admin.Email, FullName = admin.FullName,
                AuthProvider = "local", PasswordHash = BCrypt.Net.BCrypt.EnhancedHashPassword(admin.Password, workFactor: 12),
                IsSuperAdmin = true, IsActive = true, EmailVerified = true
            };
            db.Users.Add(user);
            db.UserRoles.Add(new UserRole { UserId = user.UserId, RoleId = superAdminRole.RoleId });
            logger.LogInformation("Seeded SuperAdmin: {Email}", admin.Email);
        }
        await db.SaveChangesAsync();
    }
    private static async Task SeedCatalogAsync(AppDbContext db, ILogger logger) {
        if (await db.Cakes.AnyAsync()) return;
        var birthdayCategory = new Category { CategoryId = Guid.NewGuid(), Name = "Birthday", DisplayOrder = 1, IsActive = true };
        var weddingCategory = new Category { CategoryId = Guid.NewGuid(), Name = "Wedding", DisplayOrder = 2, IsActive = true };
        db.Categories.AddRange(birthdayCategory, weddingCategory);
        var sizeGroup = new CustomizationGroup {
            GroupId = Guid.NewGuid(), Name = "Size", SelectionType = SelectionType.Single, IsGlobal = true,
            Options = new List<CustomizationOption> {
                new() { OptionId = Guid.NewGuid(), Label = "6-inch (serves 8)", PriceModifier = 0m, DisplayOrder = 1 },
                new() { OptionId = Guid.NewGuid(), Label = "10-inch (serves 20)", PriceModifier = 250m, DisplayOrder = 2 }
            }
        };
        var flavorGroup = new CustomizationGroup {
            GroupId = Guid.NewGuid(), Name = "Flavor", SelectionType = SelectionType.Single, IsGlobal = true,
            Options = new List<CustomizationOption> {
                new() { OptionId = Guid.NewGuid(), Label = "Vanilla", PriceModifier = 0m, DisplayOrder = 1 },
                new() { OptionId = Guid.NewGuid(), Label = "Chocolate", PriceModifier = 0m, DisplayOrder = 2 },
                new() { OptionId = Guid.NewGuid(), Label = "Red Velvet", PriceModifier = 30m, DisplayOrder = 3 }
            }
        };
        var icingGroup = new CustomizationGroup {
            GroupId = Guid.NewGuid(), Name = "Icing", SelectionType = SelectionType.Single, IsGlobal = true,
            Options = new List<CustomizationOption> {
                new() { OptionId = Guid.NewGuid(), Label = "Buttercream", PriceModifier = 0m, DisplayOrder = 1 },
                new() { OptionId = Guid.NewGuid(), Label = "Fondant", PriceModifier = 120m, DisplayOrder = 2 }
            }
        };
        db.CustomizationGroups.AddRange(sizeGroup, flavorGroup, icingGroup);
        var redVelvetCake = new Cake {
            CakeId = Guid.NewGuid(), CategoryId = birthdayCategory.CategoryId, Name = "Classic Red Velvet",
            Description = "Moist red velvet layers with cream cheese frosting.", BasePrice = 350.00m,
            BaseImageUrl = "https://placehold.co/600x400?text=Red+Velvet", IsActive = true, IsFeatured = true,
            CustomizationGroups = new List<CakeCustomizationGroup> {
                new() { GroupId = sizeGroup.GroupId, IsRequired = true, MinSelections = 1, MaxSelections = 1, DisplayOrder = 1 },
                new() { GroupId = flavorGroup.GroupId, IsRequired = true, MinSelections = 1, MaxSelections = 1, DisplayOrder = 2 },
                new() { GroupId = icingGroup.GroupId, IsRequired = true, MinSelections = 1, MaxSelections = 1, DisplayOrder = 3 }
            },
            TextFields = new List<CakeTextField> { new() { FieldId = Guid.NewGuid(), Label = "Message on Cake", MaxLength = 40, IsRequired = false } }
        };
        db.Cakes.Add(redVelvetCake);
        await db.SaveChangesAsync();
        logger.LogInformation("Seeded sample catalog.");
    }
    private record SeedAdminEntry {
        public string Email { get; init; } = default!;
        public string FullName { get; init; } = default!;
        public string Password { get; init; } = default!;
    }
}
