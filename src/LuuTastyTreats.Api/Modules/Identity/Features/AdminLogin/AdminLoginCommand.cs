using MediatR;
namespace LuuTastyTreats.Api.Modules.Identity.Features.AdminLogin;
public record AdminLoginCommand(string Email, string Password) : IRequest<AdminLoginResult>;
public abstract record AdminLoginResult {
    public sealed record Success(string AccessToken, DateTime ExpiresAtUtc, string Email, IReadOnlyList<string> Roles) : AdminLoginResult;
    public sealed record InvalidCredentials : AdminLoginResult;
    public sealed record AccountInactive : AdminLoginResult;
}
