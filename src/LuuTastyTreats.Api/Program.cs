using LuuTastyTreats.Api.Modules.Catalog;
using LuuTastyTreats.Api.Shared.Infrastructure;
using LuuTastyTreats.Api.Shared.Infrastructure.Seed;
using Microsoft.EntityFrameworkCore;
using Npgsql;
var builder = WebApplication.CreateBuilder(args);
var connectionString = builder.Configuration.GetConnectionString("CakeOrderingDb");
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(connectionString, npgsql => {
        npgsql.EnableRetryOnFailure(3);
        npgsql.MigrationsHistoryTable("__ef_migrations_history", "catalog");
    }).UseSnakeCaseNamingConvention());
builder.Services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(typeof(Program).Assembly));
var app = builder.Build();
if (args.Contains("--seed")) {
    using var scope = app.Services.CreateScope();
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
    await DatabaseSeeder.SeedAsync(db, app.Configuration, logger);
    return;
}
app.MapGet("/", () => "Cake Ordering API is alive.");
app.MapGet("/health/db", async (IConfiguration config) => {
    var connString = config.GetConnectionString("CakeOrderingDb");
    await using var conn = new NpgsqlConnection(connString);
    await conn.OpenAsync();
    return Results.Ok(new { database = "connected", server = conn.Host });
});
app.MapCatalogEndpoints();
app.Run();
