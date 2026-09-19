using MediatR;
namespace LuuTastyTreats.Api.Modules.Identity.Features.CustomerLogin;
public record CustomerLoginRequest(string Email, string Password);
public record CustomerLoginCommand(string Email, string Password) : IRequest<CustomerLoginResult>;
public abstract record CustomerLoginResult {
    public sealed record Success(string AccessToken, DateTime ExpiresAtUtc, string Email, string FullName) : CustomerLoginResult;
    public sealed record InvalidCredentials : CustomerLoginResult;
}
