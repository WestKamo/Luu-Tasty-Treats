namespace LuuTastyTreats.Api.Modules.Catalog.Domain;
public class CakeTextField {
    public Guid FieldId { get; set; }
    public Guid CakeId { get; set; }
    public string Label { get; set; } = "Message on Cake";
    public int MaxLength { get; set; } = 40;
    public bool IsRequired { get; set; }
    public Cake Cake { get; set; } = default!;
}
