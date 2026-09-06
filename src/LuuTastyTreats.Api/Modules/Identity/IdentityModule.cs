using LuuTastyTreats.Api.Modules.Identity.Features.AdminLogin;
namespace LuuTastyTreats.Api.Modules.Identity;
public static class IdentityModule {
    public static void MapIdentityEndpoints(this WebApplication app) {
        var group = app.MapGroup("/api/v1").WithTags("Identity");
        group.MapAdminLoginEndpoint();
    }
}
