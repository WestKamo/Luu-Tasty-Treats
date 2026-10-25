using FluentValidation;
namespace LuuTastyTreats.Api.Modules.Catalog.Features.UpdateCake;
public class UpdateCakeRequestValidator : AbstractValidator<UpdateCakeRequest> {
    public UpdateCakeRequestValidator() {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(150);
        RuleFor(x => x.Description).MaximumLength(2000);
        RuleFor(x => x.BasePrice).GreaterThanOrEqualTo(0).WithMessage("Base price cannot be negative.");
    }
}
