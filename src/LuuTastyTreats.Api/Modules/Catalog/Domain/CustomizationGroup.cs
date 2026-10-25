namespace LuuTastyTreats.Api.Modules.Catalog.Domain;
public enum SelectionType { Single, Multi }
public class CustomizationGroup {
    public Guid GroupId { get; set; }
    public string Name { get; set; } = default!;
    public SelectionType SelectionType { get; set; }
    public bool IsGlobal { get; set; }
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    public ICollection<CustomizationOption> Options { get; set; } = new List<CustomizationOption>();
    public ICollection<CakeCustomizationGroup> CakeMappings { get; set; } = new List<CakeCustomizationGroup>();
}
