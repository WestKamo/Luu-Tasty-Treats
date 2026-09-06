using System.Text;
using FluentValidation;
using LuuTastyTreats.Api.Modules.Catalog;
using LuuTastyTreats.Api.Modules.Identity;
using LuuTastyTreats.Api.Modules.Identity.Features.AdminLogin;
using LuuTastyTreats.Api.Shared.Infrastructure;
using LuuTastyTreats.Api.Shared.Infrastructure.Auth;
using LuuTastyTreats.Api.Shared.Infrastructure.Seed;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Npgsql;

var builder = WebApplication.CreateBuilder(args);

// Database
var connectionString = builder.Configuration.GetConnectionString("CakeOrderingDb");
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(connectionString, npgsql => {
        npgsql.EnableRetryOnFailure(3);
        npgsql.MigrationsHistoryTable("__ef_migrations_history", "catalog");
    }).UseSnakeCaseNamingConvention());

// Core Services & MediatR
builder.Services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(typeof(Program).Assembly));

// JWT & Auth Services (Must be registered before app.Build() so DI can resolve them)
builder.Services.Configure<JwtOptions>(builder.Configuration.GetSection(JwtOptions.SectionName));
builder.Services.AddSingleton<IJwtTokenGenerator, JwtTokenGenerator>();

var jwtOptions = builder.Configuration.GetSection(JwtOptions.SectionName).Get<JwtOptions>()!;
builder.Services.AddAuthentication(options => {
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
}).AddJwtBearer(options => {
    options.TokenValidationParameters = new TokenValidationParameters {
        ValidateIssuer = true,
        ValidIssuer = jwtOptions.Issuer,
        ValidateAudience = true,
        ValidAudience = jwtOptions.Audience,
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtOptions.SigningKey)),
        ValidateLifetime = true,
        ClockSkew = TimeSpan.FromSeconds(30)
    };
});

builder.Services.AddAuthorization(options => {
    options.AddPolicy("SuperAdminOnly", policy => policy.RequireRole("SuperAdmin"));
    options.AddPolicy("AdminOrAbove", policy => policy.RequireRole("Admin", "SuperAdmin"));
});

builder.Services.AddScoped<IValidator<AdminLoginRequest>, AdminLoginRequestValidator>();

var app = builder.Build();

// Seeder CLI flag
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

// Middleware pipeline
app.UseAuthentication();
app.UseAuthorization();

// Feature Endpoints
app.MapCatalogEndpoints();
app.MapIdentityEndpoints();

// Temporary validation route
app.MapGet("/api/v1/admin/ping", () => Results.Ok(new { message = "You are a verified SuperAdmin." }))
   .RequireAuthorization("SuperAdminOnly");

app.Run();
