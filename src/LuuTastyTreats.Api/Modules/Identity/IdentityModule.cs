using System.Security.Claims;
using LuuTastyTreats.Api.Shared.Infrastructure;
using Microsoft.EntityFrameworkCore;

namespace LuuTastyTreats.Api.Modules.Identity;
public static class IdentityModule {
    public static void MapIdentityEndpoints(this WebApplication app) {
        var group = app.MapGroup("/api/v1").WithTags("Identity");
        group.MapGet("/auth/me", async (ClaimsPrincipal principal, AppDbContext db, CancellationToken ct) => {
            var id = principal.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!Guid.TryParse(id, out var userId)) return Results.Unauthorized();
            var user = await db.Users.AsNoTracking().SingleOrDefaultAsync(u => u.UserId == userId, ct);
            if (user is null || !user.IsActive) return Results.Unauthorized();
            return Results.Ok(new {
                userId = user.UserId, email = user.Email, fullName = user.FullName,
                emailVerified = user.EmailVerified,
                roles = principal.FindAll(ClaimTypes.Role).Select(c => c.Value).Distinct().ToArray()
            });
        }).RequireAuthorization("AnyAuthenticated").WithName("GetAuthenticatedProfile");
    }
}
