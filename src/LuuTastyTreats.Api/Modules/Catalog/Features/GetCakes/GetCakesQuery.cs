using MediatR;
namespace LuuTastyTreats.Api.Modules.Catalog.Features.GetCakes;
public record GetCakesQuery(Guid? CategoryId, bool? FeaturedOnly) : IRequest<List<CakeSummaryDto>>;
public record CakeSummaryDto(Guid CakeId, string Name, string? Description, decimal BasePrice, string BaseImageUrl, bool IsFeatured, string? CategoryName);
