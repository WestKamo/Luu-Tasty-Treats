using LuuTastyTreats.Api.Modules.Catalog.Features.GetCakes;
namespace LuuTastyTreats.Api.Modules.Catalog;
public static class CatalogModule {
    public static void MapCatalogEndpoints(this WebApplication app) {
        var group = app.MapGroup("/api/v1").WithTags("Catalog");
        group.MapGetCakesEndpoint();
    }
}
