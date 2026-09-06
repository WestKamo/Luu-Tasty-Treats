namespace LuuTastyTreats.Api.Modules.Catalog.Domain;
public class CustomizationOption {
    public Guid OptionId { get; set; }
    public Guid GroupId { get; set; }
    public string Label { get; set; } = default!;
    public decimal PriceModifier { get; set; }
    public string? ImageOverrideUrl { get; set; }
    public bool IsAvailable { get; set; } = true;
    public int DisplayOrder { get; set; }
    public CustomizationGroup Group { get; set; } = default!;
}
