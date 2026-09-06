namespace LuuTastyTreats.Api.Modules.Orders.Domain;
public class OrderItem {
    public Guid OrderItemId { get; set; }
    public Guid OrderId { get; set; }
    public Guid CakeId { get; set; }
    public string CakeNameSnapshot { get; set; } = default!;
    public int Quantity { get; set; }
    public string? CustomText { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal LineTotal { get; set; }
    public string SelectedCustomizationsJson { get; set; } = "[]";
    public Order Order { get; set; } = default!;
    public ICollection<OrderItemCustomizationSelection> Selections { get; set; } = new List<OrderItemCustomizationSelection>();
}
