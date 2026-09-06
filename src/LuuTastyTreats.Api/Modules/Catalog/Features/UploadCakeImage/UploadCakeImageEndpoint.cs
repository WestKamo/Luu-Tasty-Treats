using MediatR;
namespace LuuTastyTreats.Api.Modules.Catalog.Features.UploadCakeImage;
public static class UploadCakeImageEndpoint {
    public static void MapUploadCakeImageEndpoint(this RouteGroupBuilder group) {
        group.MapPost("/admin/cakes/{id:guid}/images", async (Guid id, IFormFile file, int displayOrder, IMediator mediator, CancellationToken ct) => {
            var result = await mediator.Send(new UploadCakeImageCommand(id, file, displayOrder), ct);
            return result switch {
                UploadCakeImageResult.Success s => Results.Ok(new { imageId = s.ImageId, imageUrl = s.ImageUrl }),
                UploadCakeImageResult.CakeNotFound => Results.NotFound(new { error = "Cake not found." }),
                UploadCakeImageResult.InvalidFile f => Results.BadRequest(new { error = f.Reason }),
                _ => Results.Problem("Unexpected result.")
            };
        }).RequireAuthorization("SuperAdminOnly").DisableAntiforgery().Accepts<IFormFile>("multipart/form-data")
          .WithName("UploadCakeImage").Produces(StatusCodes.Status200OK).Produces(StatusCodes.Status404NotFound).Produces(StatusCodes.Status400BadRequest);
    }
}
