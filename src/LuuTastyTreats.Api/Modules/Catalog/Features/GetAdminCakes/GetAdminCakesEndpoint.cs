using LuuTastyTreats.Api.Shared.Infrastructure;
using Microsoft.EntityFrameworkCore;
namespace LuuTastyTreats.Api.Modules.Catalog.Features.GetAdminCakes;

public static class GetAdminCakesEndpoint {
    public static void MapGetAdminCakesEndpoint(this RouteGroupBuilder group) {
        group.MapGet("/admin/cakes", async (AppDbContext db, CancellationToken ct) => {
            var cakes = await db.Cakes.Include(c => c.Category).Include(c => c.Images)
                .OrderBy(c => c.Name).Select(c => new {
                    cakeId = c.CakeId, name = c.Name, description = c.Description, basePrice = c.BasePrice,
                    baseImageUrl = c.Images.OrderBy(i => i.DisplayOrder).FirstOrDefault() != null ? c.Images.OrderBy(i => i.DisplayOrder).First().ImageUrl : "",
                    isFeatured = c.IsFeatured, categoryName = c.Category != null ? c.Category.Name : null, isActive = c.IsActive
                }).ToListAsync(ct);
            return Results.Ok(cakes);
        }).RequireAuthorization("AdminOrAbove");
    }
}
