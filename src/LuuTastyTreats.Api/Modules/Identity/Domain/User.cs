namespace LuuTastyTreats.Api.Modules.Identity.Domain;
public class User {
    public Guid UserId { get; set; }
    public string Email { get; set; } = default!;
    public string FullName { get; set; } = default!;
    public string? PhoneNumber { get; set; }
    public string? PasswordHash { get; set; }
    public string AuthProvider { get; set; } = "local";
    public string? ExternalProviderId { get; set; }
    public bool IsSuperAdmin { get; set; }
    public bool IsActive { get; set; } = true;
    public bool EmailVerified { get; set; }
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset UpdatedAt { get; set; } = DateTimeOffset.UtcNow;
    public ICollection<UserRole> UserRoles { get; set; } = new List<UserRole>();
}
