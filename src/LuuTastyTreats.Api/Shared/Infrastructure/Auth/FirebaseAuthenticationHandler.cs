using System.Security.Claims;
using System.Text.Encodings.Web;
using FirebaseAdmin.Auth;
using LuuTastyTreats.Api.Modules.Identity.Domain;
using LuuTastyTreats.Api.Shared.Infrastructure;
using Microsoft.AspNetCore.Authentication;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace LuuTastyTreats.Api.Shared.Infrastructure.Auth;

/// <summary>Only Firebase-issued ID tokens are accepted; Postgres roles populate the ClaimsPrincipal.</summary>
public sealed class FirebaseAuthenticationHandler : AuthenticationHandler<AuthenticationSchemeOptions>
{
    public const string Scheme = "Firebase";
    private readonly FirebaseAuth _firebaseAuth;
    private readonly AppDbContext _db;

    public FirebaseAuthenticationHandler(IOptionsMonitor<AuthenticationSchemeOptions> options,
        ILoggerFactory logger, UrlEncoder encoder, FirebaseAuth firebaseAuth, AppDbContext db)
        : base(options, logger, encoder)
    {
        _firebaseAuth = firebaseAuth;
        _db = db;
    }

    protected override async Task<AuthenticateResult> HandleAuthenticateAsync()
    {
        var header = Request.Headers.Authorization.ToString();
        string? token = header.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase)
            ? header[7..].Trim() : null;

        // SignalR browser WebSocket / SSE transports cannot send Authorization headers.
        // Never accept token query parameters on unrelated routes.
        if (string.IsNullOrEmpty(token) && Request.Path.StartsWithSegments("/hubs/admin-orders"))
            token = Request.Query["access_token"].ToString();
        if (string.IsNullOrWhiteSpace(token)) return AuthenticateResult.NoResult();

        FirebaseToken verified;
        try
        {
            verified = await _firebaseAuth.VerifyIdTokenAsync(token, Context.RequestAborted);
        }
        catch (FirebaseAuthException)
        {
            return AuthenticateResult.Fail("Invalid Firebase ID token.");
        }
        catch (ArgumentException)
        {
            return AuthenticateResult.Fail("Invalid Firebase ID token.");
        }

        var email = ClaimString(verified, "email");
        if (string.IsNullOrWhiteSpace(email)) return AuthenticateResult.Fail("Firebase email claim required.");
        email = email.Trim();
        var emailVerified = ClaimBool(verified, "email_verified");
        User? user;
        try
        {
            user = await _db.Users.Include(u => u.UserRoles).ThenInclude(ur => ur.Role)
                .SingleOrDefaultAsync(u => u.FirebaseUid == verified.Uid, Context.RequestAborted);
            if (user is null)
            {
                // Linking a historical email record (especially a privileged record) REQUIRES
                // a verified email. Firebase UID alone is the durable identity thereafter.
                var candidate = await _db.Users.Include(u => u.UserRoles).ThenInclude(ur => ur.Role)
                    .SingleOrDefaultAsync(u => u.Email == email, Context.RequestAborted);
                if (candidate is not null)
                {
                    if (!emailVerified || candidate.FirebaseUid is not null)
                        return AuthenticateResult.Fail("Verify email or contact support to link this account.");
                    candidate.FirebaseUid = verified.Uid;
                    candidate.AuthProvider = "firebase";
                    candidate.EmailVerified = true;
                    candidate.UpdatedAt = DateTimeOffset.UtcNow;
                    user = candidate;
                }
                else
                {
                    var customerRole = await _db.Roles.SingleAsync(r => r.Name == "Customer", Context.RequestAborted);
                    var displayName = ClaimString(verified, "name");
                    var fullName = string.IsNullOrWhiteSpace(displayName) ? email : displayName;
                    user = new User {
                        UserId = Guid.NewGuid(), FirebaseUid = verified.Uid, Email = email,
                        FullName = fullName[..Math.Min(fullName.Length, 150)],
                        AuthProvider = "firebase", EmailVerified = emailVerified, IsActive = true
                    };
                    user.UserRoles.Add(new UserRole { UserId = user.UserId, RoleId = customerRole.RoleId, Role = customerRole });
                    _db.Users.Add(user);
                }
                await _db.SaveChangesAsync(Context.RequestAborted);
            }
            if (!user.IsActive) return AuthenticateResult.Fail("Account inactive.");
            return SuccessForUser(user, verified.Uid);
        }
        catch (DbUpdateException ex)
        {
            // On simultaneous browser requests a unique Firebase UID may have been inserted
            // by the other request. Reload rather than leaving login permanently broken.
            Logger.LogWarning(ex, "Firebase user sync conflict; reloading existing identity.");
            _db.ChangeTracker.Clear();
            var concurrentUser = await _db.Users.Include(u => u.UserRoles).ThenInclude(ur => ur.Role)
                .SingleOrDefaultAsync(u => u.FirebaseUid == verified.Uid, Context.RequestAborted);
            if (concurrentUser is null || !concurrentUser.IsActive)
                return AuthenticateResult.Fail("Account sync conflict; retry the request.");
            return SuccessForUser(concurrentUser, verified.Uid);
        }
    }

    private AuthenticateResult SuccessForUser(User user, string uid)
    {
        // Roles always come from PostgreSQL, NEVER Firebase custom claims or user input.
        var claims = new List<Claim> {
            new(ClaimTypes.NameIdentifier, user.UserId.ToString()),
            new(ClaimTypes.Name, user.FullName),
            new(ClaimTypes.Email, user.Email),
            new("firebase_uid", uid)
        };
        claims.AddRange(user.UserRoles.Select(ur => ur.Role.Name).Distinct()
            .Select(role => new Claim(ClaimTypes.Role, role)));
        return AuthenticateResult.Success(new AuthenticationTicket(
            new ClaimsPrincipal(new ClaimsIdentity(claims, Scheme)), Scheme));
    }

    private static string? ClaimString(FirebaseToken token, string key) =>
        token.Claims.TryGetValue(key, out var value) ? value?.ToString() : null;
    private static bool ClaimBool(FirebaseToken token, string key) =>
        token.Claims.TryGetValue(key, out var value) &&
        bool.TryParse(value?.ToString(), out var result) && result;
}
