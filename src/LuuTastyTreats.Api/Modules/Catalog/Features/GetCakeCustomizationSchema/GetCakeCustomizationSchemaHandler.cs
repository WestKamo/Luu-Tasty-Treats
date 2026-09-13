using LuuTastyTreats.Api.Shared.Infrastructure;
using MediatR;
using Microsoft.EntityFrameworkCore;
namespace LuuTastyTreats.Api.Modules.Catalog.Features.GetCakeCustomizationSchema;

public class GetCakeCustomizationSchemaHandler : IRequestHandler<GetCakeCustomizationSchemaQuery, CakeDetailResult?> {
    private readonly AppDbContext _db;
    public GetCakeCustomizationSchemaHandler(AppDbContext db) => _db = db;

    public async Task<CakeDetailResult?> Handle(GetCakeCustomizationSchemaQuery request, CancellationToken ct) {
        var cake = await _db.Cakes
            .Include(c => c.Category).Include(c => c.Images)
            .Include(c => c.CustomizationGroups).ThenInclude(cg => cg.Group).ThenInclude(g => g.Options)
            .Include(c => c.TextFields)
            .AsSplitQuery().SingleOrDefaultAsync(c => c.CakeId == request.CakeId, ct);

        if (cake is null) return null;

        var baseImage = cake.Images.OrderBy(i => i.DisplayOrder).FirstOrDefault()?.ImageUrl ?? "";
        
        var groups = cake.CustomizationGroups.Select(cg => new CustomizationGroupResult(
            cg.GroupId, cg.Group.Name, cg.Group.SelectionType.ToString().ToLowerInvariant(), cg.IsRequired, cg.MinSelections, cg.MaxSelections,
            cg.Group.Options.Where(o => o.IsAvailable).Select(o => new CustomizationOptionResult(o.OptionId, o.Label, o.PriceModifier)).ToList()
        )).ToList();

        var textField = cake.TextFields.FirstOrDefault();
        var freeTextField = textField != null ? new CakeTextFieldResult(textField.Label, textField.MaxLength, textField.IsRequired) : null;

        return new CakeDetailResult(
            cake.CakeId, cake.Name, cake.Description, cake.BasePrice, baseImage, cake.IsFeatured, 
            cake.Category?.Name, cake.IsActive, groups, freeTextField
        );
    }
}
