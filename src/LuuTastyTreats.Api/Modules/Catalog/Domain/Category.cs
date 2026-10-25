namespace LuuTastyTreats.Api.Modules.Catalog.Domain;
public class Category {
    public Guid CategoryId { get; set; }
    public string Name { get; set; } = default!;
    public int DisplayOrder { get; set; }
    public bool IsActive { get; set; } = true;
    public ICollection<Cake> Cakes { get; set; } = new List<Cake>();
}
