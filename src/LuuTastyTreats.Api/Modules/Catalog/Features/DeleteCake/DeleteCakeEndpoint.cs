using LuuTastyTreats.Api.Shared.Infrastructure;
using LuuTastyTreats.Api.Shared.Infrastructure.Uploads;
using Microsoft.EntityFrameworkCore;

namespace LuuTastyTreats.Api.Modules.Catalog.Features.DeleteCake;

public static class DeleteCakeEndpoint
{
    public static void MapDeleteCakeEndpoint(this RouteGroupBuilder group)
    {
        group.MapDelete("/admin/cakes/{id:guid}", async (
            Guid id, AppDbContext db, SupabaseCakeStorage storage,
            ILoggerFactory loggerFactory, CancellationToken ct) =>
        {
            var cake = await db.Cakes.Include(c => c.Images)
                .SingleOrDefaultAsync(c => c.CakeId == id, ct);
            if (cake is null) return Results.NotFound();

            // Keep URLs until AFTER the database transaction succeeds. Cakes
            // referenced by past orders must remain untouched, including photos.
            var hostedImages = cake.Images.Select(i => i.ImageUrl)
                .Where(url => !string.IsNullOrWhiteSpace(url))
                .Distinct().ToArray();

            db.CakeImages.RemoveRange(cake.Images);
            db.Cakes.Remove(cake);
            try
            {
                await db.SaveChangesAsync(ct);
            }
            catch (DbUpdateException)
            {
                // SaveChanges is transactional: the images and cake are not removed
                // if a protected order history relationship prevents deletion.
                return Results.BadRequest(new
                {
                    error = "This cake is used in past orders. Turn off its Active Status instead to hide it from the catalog."
                });
            }

            var logger = loggerFactory.CreateLogger("Catalog.DeleteCake");
            foreach (var imageUrl in hostedImages)
            {
                try
                {
                    if (!await storage.DeleteIfManagedAsync(imageUrl, CancellationToken.None))
                        logger.LogWarning("Deleted cake {CakeId} but an uploaded image needs Storage cleanup.", id);
                }
                catch (Exception ex)
                {
                    logger.LogWarning(ex, "Image cleanup failed after deleting cake {CakeId}.", id);
                }
            }

            return Results.Ok();
        }).RequireAuthorization("AdminOrAbove");
    }
}
