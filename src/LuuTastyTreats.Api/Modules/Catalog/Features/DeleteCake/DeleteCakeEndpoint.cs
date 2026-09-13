using LuuTastyTreats.Api.Shared.Infrastructure;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LuuTastyTreats.Api.Modules.Catalog.Features.DeleteCake;

public static class DeleteCakeEndpoint {
    public static void MapDeleteCakeEndpoint(this RouteGroupBuilder group) {
        group.MapDelete("/admin/cakes/{id:guid}", async (Guid id, AppDbContext db, CancellationToken ct) => {
            var cake = await db.Cakes.FindAsync(new object[] { id }, ct);
            if (cake is null) return Results.NotFound();
            
            db.Cakes.Remove(cake);
            try {
                await db.SaveChangesAsync(ct);
                return Results.Ok();
            } catch (DbUpdateException) {
                return Results.BadRequest("Cannot delete this cake because a customer has ordered it in the past. Please uncheck 'Active Status' instead to hide it from the menu.");
            }
        }).RequireAuthorization("AdminOrAbove");
    }
}
