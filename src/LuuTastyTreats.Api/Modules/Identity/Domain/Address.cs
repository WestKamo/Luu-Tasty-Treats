namespace LuuTastyTreats.Api.Modules.Identity.Domain;
public class Address {
    public Guid AddressId { get; set; }
    public Guid UserId { get; set; }
    public string? Label { get; set; }
    public string Line1 { get; set; } = default!;
    public string? Line2 { get; set; }
    public string City { get; set; } = default!;
    public string? ProvinceState { get; set; }
    public string? PostalCode { get; set; }
    public string Country { get; set; } = default!;
    public bool IsDefault { get; set; }
    public User User { get; set; } = default!;
}
