using MediatR;
namespace LuuTastyTreats.Api.Modules.Identity.Features.CustomerRegister;
public record CustomerRegisterRequest(string FirstName, string LastName, string Email, string Password);
public record CustomerRegisterCommand(string FirstName, string LastName, string Email, string Password) : IRequest<CustomerRegisterResult>;
public abstract record CustomerRegisterResult {
    public sealed record Success(string AccessToken, DateTime ExpiresAtUtc, string Email) : CustomerRegisterResult;
    public sealed record EmailAlreadyExists : CustomerRegisterResult;
}
