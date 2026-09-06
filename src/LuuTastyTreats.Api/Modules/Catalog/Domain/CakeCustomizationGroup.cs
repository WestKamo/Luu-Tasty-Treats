namespace LuuTastyTreats.Api.Modules.Catalog.Domain;
public class CakeCustomizationGroup {
    public Guid CakeId { get; set; }
    public Guid GroupId { get; set; }
    public bool IsRequired { get; set; } = true;
    public int MinSelections { get; set; } = 1;
    public int MaxSelections { get; set; } = 1;
    public int DisplayOrder { get; set; }
    public Cake Cake { get; set; } = default!;
    public CustomizationGroup Group { get; set; } = default!;
}
