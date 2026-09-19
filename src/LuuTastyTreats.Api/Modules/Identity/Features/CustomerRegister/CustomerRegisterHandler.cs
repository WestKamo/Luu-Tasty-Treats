using LuuTastyTreats.Api.Modules.Identity.Domain;
using LuuTastyTreats.Api.Shared.Infrastructure;
using LuuTastyTreats.Api.Shared.Infrastructure.Auth;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
namespace LuuTastyTreats.Api.Modules.Identity.Features.CustomerRegister;
public class CustomerRegisterHandler : IRequestHandler<CustomerRegisterCommand, CustomerRegisterResult> {
    private readonly AppDbContext _db;
    private readonly IJwtTokenGenerator _tokenGenerator;
    private readonly JwtOptions _jwtOptions;
    public CustomerRegisterHandler(AppDbContext db, IJwtTokenGenerator tokenGenerator, IOptions<JwtOptions> jwtOptions) {
        _db = db; _tokenGenerator = tokenGenerator; _jwtOptions = jwtOptions.Value;
    }
    public async Task<CustomerRegisterResult> Handle(CustomerRegisterCommand request, CancellationToken ct) {
        var exists = await _db.Users.AnyAsync(u => u.Email == request.Email, ct);
        if (exists) return new CustomerRegisterResult.EmailAlreadyExists();
        var customerRole = await _db.Roles.SingleAsync(r => r.Name == "Customer", ct);
        var user = new User {
            UserId = Guid.NewGuid(), Email = request.Email, FullName = $"{request.FirstName} {request.LastName}",
            AuthProvider = "local", PasswordHash = BCrypt.Net.BCrypt.EnhancedHashPassword(request.Password, workFactor: 12),
            IsActive = true, EmailVerified = false
        };
        _db.Users.Add(user);
        _db.UserRoles.Add(new UserRole { UserId = user.UserId, RoleId = customerRole.RoleId });
        await _db.SaveChangesAsync(ct);
        var token = _tokenGenerator.GenerateToken(user.UserId, user.Email, new[] { "Customer" });
        var expiresAt = DateTime.UtcNow.AddMinutes(_jwtOptions.AccessTokenExpirationMinutes);
        return new CustomerRegisterResult.Success(token, expiresAt, user.Email);
    }
}
