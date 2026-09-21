using System.Text;
using FluentValidation;
using LuuTastyTreats.Api.Modules.Catalog;
using LuuTastyTreats.Api.Modules.Catalog.Features.UpdateCake;
using LuuTastyTreats.Api.Modules.Catalog.Features.CreateCake;
using LuuTastyTreats.Api.Modules.Identity;
using LuuTastyTreats.Api.Modules.Identity.Features.AdminLogin;
using LuuTastyTreats.Api.Modules.Orders;
using LuuTastyTreats.Api.Modules.Orders.Features.PlaceOrder;
using LuuTastyTreats.Api.Modules.Orders.Hubs;
using LuuTastyTreats.Api.Modules.Payments;
using LuuTastyTreats.Api.Shared.Infrastructure;
using LuuTastyTreats.Api.Shared.Infrastructure.Auth;
using LuuTastyTreats.Api.Shared.Infrastructure.Seed;
using LuuTastyTreats.Api.Shared.Infrastructure.Uploads;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Npgsql;

var builder = WebApplication.CreateBuilder(args);

// 1. Database Configuration
// Render commonly exposes its PostgreSQL connection as DATABASE_URL. Prefer the
// normal ASP.NET configuration key, but support DATABASE_URL as a deployment-safe
// fallback so the application does not silently start with an empty connection string.
var connectionString = ResolveConnectionString(builder.Configuration);
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(connectionString, npgsql => {
        npgsql.EnableRetryOnFailure(3);
        npgsql.MigrationsHistoryTable("__ef_migrations_history", "catalog");
    }).UseSnakeCaseNamingConvention());

// 2. MediatR (CQRS Pattern)
builder.Services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(typeof(Program).Assembly));

// 3. Real-time & Cross-Origin Security
builder.Services.AddSignalR();
builder.Services.AddCors(options => {
    options.AddPolicy("AllowFrontend", policy => {
        policy.SetIsOriginAllowed(_ => true)
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials();
    });
});

// 4. Bind Configuration Settings
builder.Services.Configure<JwtOptions>(builder.Configuration.GetSection(JwtOptions.SectionName));
builder.Services.AddSingleton<IJwtTokenGenerator, JwtTokenGenerator>();
builder.Services.Configure<UploadOptions>(builder.Configuration.GetSection(UploadOptions.SectionName));

// 5. PayFast Payment Integration
builder.Services.Configure<PayFastOptions>(builder.Configuration.GetSection(PayFastOptions.SectionName));
builder.Services.AddHttpClient<PayFastClient>(client => {
    client.Timeout = TimeSpan.FromSeconds(30);
});

// 6. Image Upload Limits
builder.Services.Configure<Microsoft.AspNetCore.Http.Features.FormOptions>(options => {
    options.MultipartBodyLengthLimit = 10 * 1024 * 1024; // 10 MB limit for cake images
});

// 7. Request Validation
builder.Services.AddScoped<IValidator<AdminLoginRequest>, AdminLoginRequestValidator>();
builder.Services.AddScoped<IValidator<UpdateCakeRequest>, UpdateCakeRequestValidator>();
builder.Services.AddScoped<IValidator<CreateCakeRequest>, CreateCakeRequestValidator>();
builder.Services.AddScoped<IValidator<PlaceOrderRequest>, PlaceOrderRequestValidator>();

// 8. Authentication (JWT + SignalR support)
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
    options.Events = new JwtBearerEvents {
        OnMessageReceived = context => {
            var accessToken = context.Request.Query["access_token"];
            var path = context.HttpContext.Request.Path;
            // WebSockets can't send HTTP headers easily, so we allow tokens in the query string for SignalR
            if (!string.IsNullOrEmpty(accessToken) && path.StartsWithSegments("/hubs/admin-orders")) {
                context.Token = accessToken;
            }
            return Task.CompletedTask;
        }
    };
});

// 9. Authorization Roles
builder.Services.AddAuthorization(options => {
    options.AddPolicy("SuperAdminOnly", policy => policy.RequireRole("SuperAdmin"));
    options.AddPolicy("AdminOrAbove", policy => policy.RequireRole("Admin", "SuperAdmin"));
});

var app = builder.Build();

// 10. Apply migrations before querying or seeding. This is required on a fresh
// Render database and makes startup seeding safe after deployment.
using (var scope = app.Services.CreateScope()) {
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
    await db.Database.MigrateAsync();
    await DatabaseSeeder.SeedAsync(db, app.Configuration, logger);
}

// 11. Middleware Pipeline
app.UseCors("AllowFrontend");

var uploadsPath = Path.Combine(builder.Environment.ContentRootPath, "uploads");
if (!Directory.Exists(uploadsPath)) Directory.CreateDirectory(uploadsPath);

app.UseStaticFiles();
app.UseStaticFiles(new StaticFileOptions {
    FileProvider = new Microsoft.Extensions.FileProviders.PhysicalFileProvider(uploadsPath),
    RequestPath = "/uploads"
}); // Allows the frontend to load uploaded images from the server

app.UseAuthentication();
app.UseAuthorization();

// 12. Health Checks
app.MapGet("/", () => "Cake Ordering API is alive.");
app.MapGet("/health/db", async () => {
    await using var conn = new NpgsqlConnection(connectionString);
    await conn.OpenAsync();
    return Results.Ok(new { database = "connected", server = conn.Host });
});

// 13. Map Feature Endpoints
app.MapCatalogEndpoints();
app.MapIdentityEndpoints();
app.MapOrdersEndpoints();
app.MapPaymentsEndpoints();

// 14. Map SignalR WebSocket Hub
app.MapHub<AdminOrderHub>("/hubs/admin-orders");

app.Run();

static string ResolveConnectionString(IConfiguration configuration)
{
    var configured = configuration.GetConnectionString("CakeOrderingDb");
    if (!string.IsNullOrWhiteSpace(configured))
        return configured;

    var renderDatabaseUrl = Environment.GetEnvironmentVariable("DATABASE_URL");
    if (!string.IsNullOrWhiteSpace(renderDatabaseUrl))
    {
        if (!Uri.TryCreate(renderDatabaseUrl, UriKind.Absolute, out var uri) ||
            string.IsNullOrWhiteSpace(uri.Host))
            throw new InvalidOperationException("DATABASE_URL is not a valid PostgreSQL URL.");

        var builder = new NpgsqlConnectionStringBuilder {
            Host = uri.Host,
            Port = uri.IsDefaultPort ? 5432 : uri.Port,
            Database = uri.AbsolutePath.Trim('/'),
            Username = Uri.UnescapeDataString(uri.UserInfo.Split(':')[0]),
            SslMode = SslMode.Require,
            TrustServerCertificate = true
        };

        var separator = uri.UserInfo.IndexOf(':');
        if (separator >= 0)
            builder.Password = Uri.UnescapeDataString(uri.UserInfo[(separator + 1)..]);

        return builder.ConnectionString;
    }

    throw new InvalidOperationException(
        "Database connection string is missing. Set ConnectionStrings__CakeOrderingDb or DATABASE_URL in Render environment variables.");
}
