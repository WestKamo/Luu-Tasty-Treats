namespace LuuTastyTreats.Api.Shared.Infrastructure.Auth;
public class JwtOptions {
    public const string SectionName = "Jwt";
    public string Issuer { get; set; } = default!;
    public string Audience { get; set; } = default!;
    public string SigningKey { get; set; } = default!;
    public int AccessTokenExpirationMinutes { get; set; } = 30;
}
