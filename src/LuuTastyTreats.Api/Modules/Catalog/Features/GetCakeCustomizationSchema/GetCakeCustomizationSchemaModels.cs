using MediatR;
namespace LuuTastyTreats.Api.Modules.Catalog.Features.GetCakeCustomizationSchema;

public record GetCakeCustomizationSchemaQuery(Guid CakeId) : IRequest<CakeDetailResult?>;

public record CakeDetailResult(
    Guid CakeId, string Name, string? Description, decimal BasePrice, 
    string BaseImageUrl, bool IsFeatured, string? CategoryName, 
    bool IsActive, List<CustomizationGroupResult> Groups, 
    CakeTextFieldResult? FreeTextField
);

public record CustomizationGroupResult(
    Guid GroupId, string Name, string SelectionType, bool IsRequired, 
    int MinSelections, int MaxSelections, List<CustomizationOptionResult> Options
);

public record CustomizationOptionResult(Guid OptionId, string Label, decimal PriceModifier);
public record CakeTextFieldResult(string Label, int MaxLength, bool IsRequired);
