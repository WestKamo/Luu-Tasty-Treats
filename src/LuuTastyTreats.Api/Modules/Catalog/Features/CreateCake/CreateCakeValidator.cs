using FluentValidation;

namespace LuuTastyTreats.Api.Modules.Catalog.Features.CreateCake;

public class CreateCakeRequestValidator : AbstractValidator<CreateCakeRequest>
{
    public CreateCakeRequestValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(150);
        RuleFor(x => x.Description).MaximumLength(2000);
        RuleFor(x => x.BasePrice).GreaterThanOrEqualTo(0);
    }
}
