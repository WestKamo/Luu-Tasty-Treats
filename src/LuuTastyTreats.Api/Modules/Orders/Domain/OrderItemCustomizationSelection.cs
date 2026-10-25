namespace LuuTastyTreats.Api.Modules.Orders.Domain;
public class OrderItemCustomizationSelection {
    public Guid Id { get; set; }
    public Guid OrderItemId { get; set; }
    public Guid? OptionId { get; set; }
    public string OptionLabelSnapshot { get; set; } = default!;
    public string GroupNameSnapshot { get; set; } = default!;
    public decimal PriceModifier { get; set; }
    public OrderItem OrderItem { get; set; } = default!;
}
