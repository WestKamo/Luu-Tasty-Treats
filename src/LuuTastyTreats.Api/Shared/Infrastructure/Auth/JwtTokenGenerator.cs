using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
namespace LuuTastyTreats.Api.Shared.Infrastructure.Auth;
public interface IJwtTokenGenerator {
    string GenerateToken(Guid userId, string email, IEnumerable<string> roles);
}
public class JwtTokenGenerator : IJwtTokenGenerator {
    private readonly JwtOptions _options;
    public JwtTokenGenerator(IOptions<JwtOptions> options) => _options = options.Value;
    public string GenerateToken(Guid userId, string email, IEnumerable<string> roles) {
        var claims = new List<Claim> {
            new(JwtRegisteredClaimNames.Sub, userId.ToString()),
            new(JwtRegisteredClaimNames.Email, email),
            new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };
        claims.AddRange(roles.Select(role => new Claim(ClaimTypes.Role, role)));
        var signingKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_options.SigningKey));
        var credentials = new SigningCredentials(signingKey, SecurityAlgorithms.HmacSha256);
        var token = new JwtSecurityToken(
            issuer: _options.Issuer, audience: _options.Audience, claims: claims,
            expires: DateTime.UtcNow.AddMinutes(_options.AccessTokenExpirationMinutes),
            signingCredentials: credentials);
        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
