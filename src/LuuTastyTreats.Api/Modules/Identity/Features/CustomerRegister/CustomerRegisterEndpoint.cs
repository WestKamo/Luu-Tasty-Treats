using FluentValidation;
using MediatR;
namespace LuuTastyTreats.Api.Modules.Identity.Features.CustomerRegister;
public static class CustomerRegisterEndpoint {
    public static void MapCustomerRegisterEndpoint(this RouteGroupBuilder group) {
        group.MapPost("/auth/register", async (CustomerRegisterRequest request, IValidator<CustomerRegisterRequest> validator, IMediator mediator, CancellationToken ct) => {
            var validation = await validator.ValidateAsync(request, ct);
            if (!validation.IsValid) return Results.ValidationProblem(validation.ToDictionary());
            var result = await mediator.Send(new CustomerRegisterCommand(request.FirstName, request.LastName, request.Email, request.Password), ct);
            return result switch {
                CustomerRegisterResult.Success s => Results.Ok(new { accessToken = s.AccessToken, expiresAtUtc = s.ExpiresAtUtc, email = s.Email }),
                CustomerRegisterResult.EmailAlreadyExists => Results.Conflict(new { error = "An account with this email already exists." }),
                _ => Results.Problem("Unexpected result.")
            };
        }).AllowAnonymous().WithName("CustomerRegister");
    }
}
