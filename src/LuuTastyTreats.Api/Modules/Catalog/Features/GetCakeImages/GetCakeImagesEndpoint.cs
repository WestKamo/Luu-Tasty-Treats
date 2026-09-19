using MediatR;
namespace LuuTastyTreats.Api.Modules.Catalog.Features.GetCakeImages;
public static class GetCakeImagesEndpoint {
    public static void MapGetCakeImagesEndpoint(this RouteGroupBuilder group) {
        group.MapGet("/admin/cakes/{id:guid}/images", async (Guid id, IMediator mediator, CancellationToken ct) => Results.Ok(await mediator.Send(new GetCakeImagesQuery(id), ct))).RequireAuthorization("SuperAdminOnly");
    }
}
