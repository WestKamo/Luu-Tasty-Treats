using LuuTastyTreats.Api.Shared.Infrastructure;
using LuuTastyTreats.Api.Shared.Infrastructure.Auth;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
namespace LuuTastyTreats.Api.Modules.Identity.Features.AdminLogin;
public class AdminLoginHandler : IRequestHandler<AdminLoginCommand, AdminLoginResult> {
    private readonly AppDbContext _db;
    private readonly IJwtTokenGenerator _tokenGenerator;
    private readonly IOptions<JwtOptions> _jwtOptions;
    public AdminLoginHandler(AppDbContext db, IJwtTokenGenerator tokenGenerator, IOptions<JwtOptions> jwtOptions) {
        _db = db; _tokenGenerator = tokenGenerator; _jwtOptions = jwtOptions;
    }
    public async Task<AdminLoginResult> Handle(AdminLoginCommand request, CancellationToken ct) {
        var user = await _db.Users
            .Include(u => u.UserRoles).ThenInclude(ur => ur.Role)
            .SingleOrDefaultAsync(u => u.Email == request.Email && u.AuthProvider == "local", ct);
        if (user is null || user.PasswordHash is null) return new AdminLoginResult.InvalidCredentials();
        var passwordValid = BCrypt.Net.BCrypt.EnhancedVerify(request.Password, user.PasswordHash);
        if (!passwordValid) return new AdminLoginResult.InvalidCredentials();
        if (!user.IsActive) return new AdminLoginResult.AccountInactive();
        var roles = user.UserRoles.Select(ur => ur.Role.Name).ToList();
        var token = _tokenGenerator.GenerateToken(user.UserId, user.Email, roles);
        var expiresAt = DateTime.UtcNow.AddMinutes(_jwtOptions.Value.AccessTokenExpirationMinutes);
        return new AdminLoginResult.Success(token, expiresAt, user.Email, roles);
    }
}
