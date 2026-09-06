using System.Text;
using FluentValidation;
using LuuTastyTreats.Api.Modules.Catalog;
using LuuTastyTreats.Api.Modules.Catalog.Features.UpdateCake;
using LuuTastyTreats.Api.Modules.Identity;
using LuuTastyTreats.Api.Modules.Identity.Features.AdminLogin;
using LuuTastyTreats.Api.Modules.Orders;
using LuuTastyTreats.Api.Modules.Orders.Features.PlaceOrder;
using LuuTastyTreats.Api.Modules.Orders.Hubs;
using LuuTastyTreats.Api.Shared.Infrastructure;
using LuuTastyTreats.Api.Shared.Infrastructure.Auth;
using LuuTastyTreats.Api.Shared.Infrastructure.Seed;
using LuuTastyTreats.Api.Shared.Infrastructure.Uploads;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Npgsql;

var builder = WebApplication.CreateBuilder(args);

var connectionString = builder.Configuration.GetConnectionString("CakeOrderingDb");
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(connectionString, npgsql => {
        npgsql.EnableRetryOnFailure(3);
        npgsql.MigrationsHistoryTable("__ef_migrations_history", "catalog");
    }).UseSnakeCaseNamingConvention());

builder.Services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(typeof(Program).Assembly));

// SignalR Service Registration
builder.Services.AddSignalR();

// CORS for local frontend/admin dashboard connection support
builder.Services.AddCors(options => {
    options.AddPolicy("AllowFrontend", policy => {
        policy.SetIsOriginAllowed(_ => true)
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials();
    });
});

builder.Services.Configure<JwtOptions>(builder.Configuration.GetSection(JwtOptions.SectionName));
builder.Services.AddSingleton<IJwtTokenGenerator, JwtTokenGenerator>();
builder.Services.Configure<UploadOptions>(builder.Configuration.GetSection(UploadOptions.SectionName));
builder.Services.Configure<Microsoft.AspNetCore.Http.Features.FormOptions>(options => {
    options.MultipartBodyLengthLimit = 10 * 1024 * 1024;
});

builder.Services.AddScoped<IValidator<AdminLoginRequest>, AdminLoginRequestValidator>();
builder.Services.AddScoped<IValidator<UpdateCakeRequest>, UpdateCakeRequestValidator>();
builder.Services.AddScoped<IValidator<PlaceOrderRequest>, PlaceOrderRequestValidator>();

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
    
    // Allow SignalR to read access token from query string parameter for WebSocket connections
    options.Events = new JwtBearerEvents {
        OnMessageReceived = context => {
            var accessToken = context.Request.Query["access_token"];
            var path = context.HttpContext.Request.Path;
            if (!string.IsNullOrEmpty(accessToken) && path.StartsWithSegments("/hubs/admin-orders")) {
                context.Token = accessToken;
            }
            return Task.CompletedTask;
        }
    };
});

builder.Services.AddAuthorization(options => {
    options.AddPolicy("SuperAdminOnly", policy => policy.RequireRole("SuperAdmin"));
    options.AddPolicy("AdminOrAbove", policy => policy.RequireRole("Admin", "SuperAdmin"));
});

var app = builder.Build();

if (args.Contains("--seed")) {
    using var scope = app.Services.CreateScope();
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
    await DatabaseSeeder.SeedAsync(db, app.Configuration, logger);
    return;
}

app.UseCors("AllowFrontend");
app.UseStaticFiles();
app.UseAuthentication();
app.UseAuthorization();

app.MapGet("/", () => "Cake Ordering API is alive.");
app.MapGet("/health/db", async (IConfiguration config) => {
    var connString = config.GetConnectionString("CakeOrderingDb");
    await using var conn = new NpgsqlConnection(connString);
    await conn.OpenAsync();
    return Results.Ok(new { database = "connected", server = conn.Host });
});

app.MapCatalogEndpoints();
app.MapIdentityEndpoints();
app.MapOrdersEndpoints();

// Map SignalR Admin Hub Endpoint (Protected by SuperAdminOnly policy)
app.MapHub<AdminOrderHub>("/hubs/admin-orders");

app.Run();
