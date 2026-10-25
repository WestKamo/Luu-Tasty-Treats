using MediatR;
namespace LuuTastyTreats.Api.Modules.Catalog.Features.GetCakeImages;
public record GetCakeImagesQuery(Guid CakeId) : IRequest<List<CakeImageDto>>;
public record CakeImageDto(Guid ImageId, string ImageUrl, int DisplayOrder);
