using MediatR;
namespace LuuTastyTreats.Api.Modules.Catalog.Features.UpdateCake;
public record UpdateCakeRequest(string Name, string? Description, decimal BasePrice, bool IsActive, Guid? CategoryId);
public record UpdateCakeCommand(Guid CakeId, string Name, string? Description, decimal BasePrice, bool IsActive, Guid? CategoryId) : IRequest<UpdateCakeResult>;
public abstract record UpdateCakeResult {
    public sealed record Success(Guid CakeId, string Name, decimal BasePrice, bool IsActive) : UpdateCakeResult;
    public sealed record CakeNotFound : UpdateCakeResult;
    public sealed record CategoryNotFound : UpdateCakeResult;
}
