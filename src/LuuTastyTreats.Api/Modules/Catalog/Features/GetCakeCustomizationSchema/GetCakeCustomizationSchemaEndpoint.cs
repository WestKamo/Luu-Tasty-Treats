using LuuTastyTreats.Api.Shared.Infrastructure;
using Microsoft.EntityFrameworkCore;

namespace LuuTastyTreats.Api.Modules.Catalog.Features.GetCakeCustomizationSchema;

public static class GetCakeCustomizationSchemaEndpoint
{
    public static void MapGetCakeCustomizationSchemaEndpoint(this RouteGroupBuilder group)
    {
        group.MapGet("/cakes/{id:guid}/customization-schema", async (Guid id, AppDbContext db, CancellationToken ct) =>
        {
            var cake = await db.Cakes
                .AsNoTracking()
                .Include(c => c.Images)
                .Include(c => c.CustomizationGroups).ThenInclude(cg => cg.Group).ThenInclude(g => g.Options)
                .Include(c => c.TextFields)
                .SingleOrDefaultAsync(c => c.CakeId == id, ct);

            if (cake is null) return Results.NotFound();

            var uploadedImages = cake.Images
                .Where(i => !string.IsNullOrWhiteSpace(i.ImageUrl))
                .OrderBy(i => i.DisplayOrder)
                .ThenBy(i => i.ImageId)
                .Select(i => i.ImageUrl)
                .ToList();

            var primaryImageUrl = uploadedImages.FirstOrDefault() ?? cake.BaseImageUrl;

            return Results.Ok(new
            {
                cake.CakeId,
                cake.Name,
                cake.Description,
                cake.BasePrice,
                BaseImageUrl = primaryImageUrl,
                cake.IsFeatured,
                cake.IsActive,
                Images = uploadedImages.Count > 0 ? uploadedImages : new List<string> { primaryImageUrl },
                Groups = cake.CustomizationGroups.Select(cg => new
                {
                    cg.GroupId,
                    cg.Group.Name,
                    cg.Group.SelectionType,
                    cg.IsRequired,
                    cg.MinSelections,
                    cg.MaxSelections,
                    Options = cg.Group.Options.Where(o => o.IsAvailable).Select(o => new
                    {
                        o.OptionId,
                        o.Label,
                        o.PriceModifier
                    })
                }),
                FreeTextField = cake.TextFields.Select(tf => new { tf.Label, tf.MaxLength, tf.IsRequired }).FirstOrDefault()
            });
        });
    }
}
