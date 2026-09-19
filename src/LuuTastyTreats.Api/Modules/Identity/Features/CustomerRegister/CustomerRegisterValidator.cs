using FluentValidation;
namespace LuuTastyTreats.Api.Modules.Identity.Features.CustomerRegister;
public class CustomerRegisterRequestValidator : AbstractValidator<CustomerRegisterRequest> {
    public CustomerRegisterRequestValidator() {
        RuleFor(x => x.FirstName).NotEmpty().MaximumLength(75);
        RuleFor(x => x.LastName).NotEmpty().MaximumLength(75);
        RuleFor(x => x.Email).NotEmpty().EmailAddress();
        RuleFor(x => x.Password).NotEmpty().MinimumLength(8).WithMessage("Password must be at least 8 characters.");
    }
}
