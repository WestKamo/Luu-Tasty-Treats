using MediatR;
namespace LuuTastyTreats.Api.Modules.Catalog.Features.GetCakes;
public static class GetCakesEndpoint {
    public static void MapGetCakesEndpoint(this RouteGroupBuilder group) {
        group.MapGet("/cakes", async (Guid? categoryId, bool? featuredOnly, IMediator mediator, CancellationToken ct) => {
            var result = await mediator.Send(new GetCakesQuery(categoryId, featuredOnly), ct);
            return Results.Ok(result);
        }).WithName("GetCakes").WithSummary("List active cakes").Produces<List<CakeSummaryDto>>(StatusCodes.Status200OK);
    }
}
