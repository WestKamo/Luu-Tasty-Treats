using MediatR;

namespace LuuTastyTreats.Api.Modules.Catalog.Features.CreateCake;

public record CreateCakeRequest(string Name, string? Description, decimal BasePrice, Guid? CategoryId);
public record CreateCakeCommand(string Name, string? Description, decimal BasePrice, Guid? CategoryId) : IRequest<CreateCakeResult>;

public abstract record CreateCakeResult
{
    public sealed record Success(Guid CakeId, string Name, decimal BasePrice, string BaseImageUrl, bool IsActive) : CreateCakeResult;
    public sealed record CategoryNotFound : CreateCakeResult;
}
