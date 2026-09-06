namespace LuuTastyTreats.Api.Modules.Identity.Domain;
public class Role {
    public Guid RoleId { get; set; }
    public string Name { get; set; } = default!;
    public ICollection<UserRole> UserRoles { get; set; } = new List<UserRole>();
}
