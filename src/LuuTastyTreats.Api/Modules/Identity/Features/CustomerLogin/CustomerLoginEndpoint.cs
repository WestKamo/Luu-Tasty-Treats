using MediatR;
namespace LuuTastyTreats.Api.Modules.Identity.Features.CustomerLogin;
public static class CustomerLoginEndpoint {
    public static void MapCustomerLoginEndpoint(this RouteGroupBuilder group) {
        group.MapPost("/auth/login", async (CustomerLoginRequest request, IMediator mediator, CancellationToken ct) => {
            var result = await mediator.Send(new CustomerLoginCommand(request.Email, request.Password), ct);
            return result switch {
                CustomerLoginResult.Success s => Results.Ok(new { accessToken = s.AccessToken, expiresAtUtc = s.ExpiresAtUtc, email = s.Email, fullName = s.FullName }),
                _ => Results.Json(new { error = "Invalid email or password." }, statusCode: StatusCodes.Status401Unauthorized)
            };
        }).AllowAnonymous().WithName("CustomerLogin");
    }
}
