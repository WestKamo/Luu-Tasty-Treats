namespace LuuTastyTreats.Api.Modules.Catalog.Domain;
public class Cake {
    public Guid CakeId { get; set; }
    public Guid? CategoryId { get; set; }
    public string Name { get; set; } = default!;
    public string? Description { get; set; }
    public decimal BasePrice { get; set; }
    public string BaseImageUrl { get; set; } = default!;
    public bool IsActive { get; set; } = true;
    public bool IsFeatured { get; set; }
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset UpdatedAt { get; set; } = DateTimeOffset.UtcNow;
    public Category? Category { get; set; }
    public ICollection<CakeImage> Images { get; set; } = new List<CakeImage>();
    public ICollection<CakeCustomizationGroup> CustomizationGroups { get; set; } = new List<CakeCustomizationGroup>();
    public ICollection<CakeTextField> TextFields { get; set; } = new List<CakeTextField>();
}
