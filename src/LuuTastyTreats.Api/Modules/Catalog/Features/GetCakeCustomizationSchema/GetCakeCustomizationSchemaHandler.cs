using LuuTastyTreats.Api.Shared.Infrastructure;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace LuuTastyTreats.Api.Modules.Catalog.Features.GetCakeCustomizationSchema;

public class GetCakeCustomizationSchemaHandler : IRequestHandler<GetCakeCustomizationSchemaQuery, CakeDetailDto?>
{
    private readonly AppDbContext _db;
    public GetCakeCustomizationSchemaHandler(AppDbContext db) => _db = db;

    public async Task<CakeDetailDto?> Handle(GetCakeCustomizationSchemaQuery request, CancellationToken ct)
    {
        var cake = await _db.Cakes
            .AsNoTracking()
            .Include(c => c.Category)
            .Include(c => c.CustomizationGroups)
                .ThenInclude(cg => cg.Group)
                    .ThenInclude(g => g.Options)
            .Include(c => c.TextFields)
            .SingleOrDefaultAsync(c => c.CakeId == request.CakeId, ct);

        if (cake is null) return null;

        var groups = cake.CustomizationGroups
            .OrderBy(cg => cg.DisplayOrder)
            .Select(cg => new CustomizationGroupDto(
                cg.GroupId,
                cg.Group.Name,
                cg.Group.SelectionType.ToString().ToLowerInvariant(),
                cg.IsRequired,
                cg.MinSelections,
                cg.MaxSelections,
                cg.Group.Options
                    .Where(o => o.IsAvailable)
                    .OrderBy(o => o.DisplayOrder)
                    .Select(o => new CustomizationOptionDto(o.OptionId, o.Label, o.PriceModifier))
                    .ToList()
            ))
            .ToList();

        var textField = cake.TextFields.FirstOrDefault();
        var textFieldDto = textField is null
            ? null
            : new CakeTextFieldDto(textField.Label, textField.MaxLength, textField.IsRequired);

        return new CakeDetailDto(
            cake.CakeId, cake.Name, cake.Description, cake.BasePrice, cake.BaseImageUrl,
            cake.IsFeatured, cake.IsActive, cake.Category?.Name,
            groups, textFieldDto
        );
    }
}
