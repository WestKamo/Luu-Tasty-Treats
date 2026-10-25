namespace LuuTastyTreats.Api.Modules.Catalog.Domain;
public class CakeImage {
    public Guid ImageId { get; set; }
    public Guid CakeId { get; set; }
    public string ImageUrl { get; set; } = default!;
    public int DisplayOrder { get; set; }
    public Cake Cake { get; set; } = default!;
}
