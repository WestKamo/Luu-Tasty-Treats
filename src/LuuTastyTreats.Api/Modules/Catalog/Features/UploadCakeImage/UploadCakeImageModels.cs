using MediatR;
namespace LuuTastyTreats.Api.Modules.Catalog.Features.UploadCakeImage;
public record UploadCakeImageCommand(Guid CakeId, IFormFile File, int DisplayOrder) : IRequest<UploadCakeImageResult>;
public abstract record UploadCakeImageResult {
    public sealed record Success(Guid ImageId, string ImageUrl) : UploadCakeImageResult;
    public sealed record CakeNotFound : UploadCakeImageResult;
    public sealed record InvalidFile(string Reason) : UploadCakeImageResult;
}
