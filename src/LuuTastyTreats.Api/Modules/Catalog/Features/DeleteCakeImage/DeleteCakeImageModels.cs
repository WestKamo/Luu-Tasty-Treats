using MediatR;
namespace LuuTastyTreats.Api.Modules.Catalog.Features.DeleteCakeImage;
public record DeleteCakeImageCommand(Guid ImageId) : IRequest<bool>;
