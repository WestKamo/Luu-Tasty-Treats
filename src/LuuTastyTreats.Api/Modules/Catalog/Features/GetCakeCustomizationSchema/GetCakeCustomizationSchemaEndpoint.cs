using MediatR;
namespace LuuTastyTreats.Api.Modules.Catalog.Features.GetCakeCustomizationSchema;

public static class GetCakeCustomizationSchemaEndpoint {
    public static void MapGetCakeCustomizationSchemaEndpoint(this RouteGroupBuilder group) {
        group.MapGet("/cakes/{id:guid}/customization-schema", async (Guid id, IMediator mediator, CancellationToken ct) => {
            var result = await mediator.Send(new GetCakeCustomizationSchemaQuery(id), ct);
            return result is not null ? Results.Ok(result) : Results.NotFound();
        }).AllowAnonymous();
    }
}
