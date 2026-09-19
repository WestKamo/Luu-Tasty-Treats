using LuuTastyTreats.Api.Shared.Infrastructure;
using LuuTastyTreats.Api.Shared.Infrastructure.Auth;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
namespace LuuTastyTreats.Api.Modules.Identity.Features.CustomerLogin;
public class CustomerLoginHandler : IRequestHandler<CustomerLoginCommand, CustomerLoginResult> {
    private readonly AppDbContext _db;
    private readonly IJwtTokenGenerator _tokenGenerator;
    private readonly JwtOptions _jwtOptions;
    public CustomerLoginHandler(AppDbContext db, IJwtTokenGenerator tokenGenerator, IOptions<JwtOptions> jwtOptions) {
        _db = db; _tokenGenerator = tokenGenerator; _jwtOptions = jwtOptions.Value;
    }
    public async Task<CustomerLoginResult> Handle(CustomerLoginCommand request, CancellationToken ct) {
        var user = await _db.Users.Include(u => u.UserRoles).ThenInclude(ur => ur.Role).SingleOrDefaultAsync(u => u.Email == request.Email && u.AuthProvider == "local", ct);
        if (user is null || user.PasswordHash is null || !user.IsActive) return new CustomerLoginResult.InvalidCredentials();
        if (!BCrypt.Net.BCrypt.EnhancedVerify(request.Password, user.PasswordHash)) return new CustomerLoginResult.InvalidCredentials();
        var roles = user.UserRoles.Select(ur => ur.Role.Name).ToList();
        var token = _tokenGenerator.GenerateToken(user.UserId, user.Email, roles);
        var expiresAt = DateTime.UtcNow.AddMinutes(_jwtOptions.AccessTokenExpirationMinutes);
        return new CustomerLoginResult.Success(token, expiresAt, user.Email, user.FullName);
    }
}
