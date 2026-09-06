using FluentValidation;
using MediatR;
namespace LuuTastyTreats.Api.Modules.Identity.Features.AdminLogin;
public record AdminLoginRequest(string Email, string Password);
public class AdminLoginRequestValidator : AbstractValidator<AdminLoginRequest> {
    public AdminLoginRequestValidator() {
        RuleFor(x => x.Email).NotEmpty().EmailAddress();
        RuleFor(x => x.Password).NotEmpty();
    }
}
public static class AdminLoginEndpoint {
    public static void MapAdminLoginEndpoint(this RouteGroupBuilder group) {
        group.MapPost("/auth/admin/login", async (
            AdminLoginRequest request, IValidator<AdminLoginRequest> validator, IMediator mediator, CancellationToken ct) => {
            var validation = await validator.ValidateAsync(request, ct);
            if (!validation.IsValid) return Results.ValidationProblem(validation.ToDictionary());
            var result = await mediator.Send(new AdminLoginCommand(request.Email, request.Password), ct);
            return result switch {
                AdminLoginResult.Success s => Results.Ok(new { accessToken = s.AccessToken, expiresAtUtc = s.ExpiresAtUtc, email = s.Email, roles = s.Roles }),
                AdminLoginResult.AccountInactive => Results.Json(new { error = "Account is inactive." }, statusCode: StatusCodes.Status403Forbidden),
                _ => Results.Json(new { error = "Invalid email or password." }, statusCode: StatusCodes.Status401Unauthorized)
            };
        }).WithName("AdminLogin").WithSummary("Authenticate an admin/super-admin").AllowAnonymous()
          .Produces(StatusCodes.Status200OK).Produces(StatusCodes.Status401Unauthorized)
          .Produces(StatusCodes.Status403Forbidden).ProducesValidationProblem();
    }
}
