namespace LuuTastyTreats.Api.Modules.Identity.Features.ForgotPassword;
public record ForgotPasswordRequest(string Email);
public static class ForgotPasswordEndpoint {
    public static void MapForgotPasswordEndpoint(this RouteGroupBuilder group) {
        group.MapPost("/auth/forgot-password", (ForgotPasswordRequest request, ILoggerFactory loggerFactory) => {
            var logger = loggerFactory.CreateLogger("ForgotPassword");
            logger.LogInformation("Simulated password reset requested for {Email}", request.Email);
            return Results.Ok(new { message = "If that email exists, a reset link has been sent." });
        }).AllowAnonymous().WithName("ForgotPassword");
    }
}
