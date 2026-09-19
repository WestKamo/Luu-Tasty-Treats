using MediatR;
namespace LuuTastyTreats.Api.Modules.Catalog.Features.DeleteCakeImage;
public static class DeleteCakeImageEndpoint {
    public static void MapDeleteCakeImageEndpoint(this RouteGroupBuilder group) {
        group.MapDelete("/admin/cake-images/{imageId:guid}", async (Guid imageId, IMediator mediator, CancellationToken ct) => {
            var deleted = await mediator.Send(new DeleteCakeImageCommand(imageId), ct);
            return deleted ? Results.NoContent() : Results.NotFound();
        }).RequireAuthorization("SuperAdminOnly");
    }
}
