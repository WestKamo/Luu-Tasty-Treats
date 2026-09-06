using FluentValidation;
namespace LuuTastyTreats.Api.Modules.Orders.Features.PlaceOrder;
public class PlaceOrderRequestValidator : AbstractValidator<PlaceOrderRequest> {
    public PlaceOrderRequestValidator() {
        RuleFor(x => x.CustomerEmail).NotEmpty().EmailAddress();
        RuleFor(x => x.CustomerFullName).NotEmpty().MaximumLength(150);
        RuleFor(x => x.DeliveryMethod).Must(m => m is "pickup" or "delivery").WithMessage("DeliveryMethod must be 'pickup' or 'delivery'.");
        RuleFor(x => x.RequestedDate).GreaterThanOrEqualTo(_ => DateOnly.FromDateTime(DateTime.UtcNow.Date)).WithMessage("Requested date cannot be in the past.");
        RuleFor(x => x.DeliveryAddress).NotNull().When(x => x.DeliveryMethod == "delivery").WithMessage("DeliveryAddress is required when DeliveryMethod is 'delivery'.");
        RuleFor(x => x.Items).NotEmpty().WithMessage("Order must contain at least one item.");
        RuleForEach(x => x.Items).ChildRules(item => {
            item.RuleFor(i => i.Quantity).GreaterThan(0);
            item.RuleFor(i => i.CustomText).MaximumLength(200);
        });
        When(x => x.DeliveryAddress is not null, () => {
            RuleFor(x => x.DeliveryAddress!.Line1).NotEmpty();
            RuleFor(x => x.DeliveryAddress!.City).NotEmpty();
            RuleFor(x => x.DeliveryAddress!.Country).NotEmpty();
        });
    }
}
