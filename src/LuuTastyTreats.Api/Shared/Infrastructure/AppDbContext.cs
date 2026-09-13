using Microsoft.EntityFrameworkCore;
using LuuTastyTreats.Api.Modules.Catalog.Domain;
using LuuTastyTreats.Api.Modules.Identity.Domain;
using LuuTastyTreats.Api.Modules.Orders.Domain;
using LuuTastyTreats.Api.Modules.Payments.Domain;
namespace LuuTastyTreats.Api.Shared.Infrastructure;

public class AppDbContext : DbContext {
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Category> Categories => Set<Category>();
    public DbSet<Cake> Cakes => Set<Cake>();
    public DbSet<CakeImage> CakeImages => Set<CakeImage>();
    public DbSet<CustomizationGroup> CustomizationGroups => Set<CustomizationGroup>();
    public DbSet<CustomizationOption> CustomizationOptions => Set<CustomizationOption>();
    public DbSet<CakeCustomizationGroup> CakeCustomizationGroups => Set<CakeCustomizationGroup>();
    public DbSet<CakeTextField> CakeTextFields => Set<CakeTextField>();
    
    public DbSet<Role> Roles => Set<Role>();
    public DbSet<User> Users => Set<User>();
    public DbSet<UserRole> UserRoles => Set<UserRole>();
    public DbSet<Address> Addresses => Set<Address>();

    public DbSet<Order> Orders => Set<Order>();
    public DbSet<OrderItem> OrderItems => Set<OrderItem>();
    public DbSet<OrderItemCustomizationSelection> OrderItemCustomizationSelections => Set<OrderItemCustomizationSelection>();
    public DbSet<OrderStatusHistory> OrderStatusHistories => Set<OrderStatusHistory>();
    
    // Explicit DbSet for Payment Transactions
    public DbSet<PaymentTransaction> PaymentTransactions => Set<PaymentTransaction>();

    protected override void OnModelCreating(ModelBuilder modelBuilder) {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);
        base.OnModelCreating(modelBuilder);
    }
}
