using MediatR;

namespace LuuTastyTreats.Api.Modules.Catalog.Features.GetCakeCustomizationSchema;

public record GetCakeCustomizationSchemaQuery(Guid CakeId) : IRequest<CakeDetailDto?>;

public record CustomizationOptionDto(Guid OptionId, string Label, decimal PriceModifier);

public record CustomizationGroupDto(
    Guid GroupId, string Name, string SelectionType,
    bool IsRequired, int MinSelections, int MaxSelections,
    List<CustomizationOptionDto> Options
);

public record CakeTextFieldDto(string Label, int MaxLength, bool IsRequired);

public record CakeDetailDto(
    Guid CakeId, string Name, string? Description, decimal BasePrice, string BaseImageUrl,
    bool IsFeatured, bool IsActive, string? CategoryName,
    List<CustomizationGroupDto> Groups, CakeTextFieldDto? FreeTextField
);
