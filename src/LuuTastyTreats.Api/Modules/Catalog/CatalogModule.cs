using LuuTastyTreats.Api.Modules.Catalog.Features.GetCakes;
using LuuTastyTreats.Api.Modules.Catalog.Features.UpdateCake;
using LuuTastyTreats.Api.Modules.Catalog.Features.UploadCakeImage;
using LuuTastyTreats.Api.Modules.Catalog.Features.GetCakeCustomizationSchema;
using LuuTastyTreats.Api.Modules.Catalog.Features.GetAdminCakes;
using LuuTastyTreats.Api.Modules.Catalog.Features.CreateCake;
using LuuTastyTreats.Api.Modules.Catalog.Features.DeleteCake;

namespace LuuTastyTreats.Api.Modules.Catalog;
public static class CatalogModule {
    public static void MapCatalogEndpoints(this WebApplication app) {
        var group = app.MapGroup("/api/v1").WithTags("Catalog");
        group.MapGetCakesEndpoint();
        group.MapUpdateCakeEndpoint();
        group.MapUploadCakeImageEndpoint();
        group.MapGetCakeCustomizationSchemaEndpoint();
        group.MapGetAdminCakesEndpoint();
        group.MapCreateCakeEndpoint();
        group.MapDeleteCakeEndpoint();
    }
}
