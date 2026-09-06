using System.Security.Cryptography;
using System.Text;
namespace LuuTastyTreats.Api.Modules.Payments;
public static class PayFastSignature {
    public static string Generate(IReadOnlyDictionary<string, string> data, string? passPhrase) {
        var parameterString = BuildParameterString(data);
        if (!string.IsNullOrWhiteSpace(passPhrase)) {
            parameterString += $"&passphrase={UrlEncode(passPhrase.Trim())}";
        }
        using var md5 = MD5.Create();
        var hash = md5.ComputeHash(Encoding.UTF8.GetBytes(parameterString));
        return Convert.ToHexString(hash).ToLowerInvariant();
    }
    public static bool Verify(IReadOnlyDictionary<string, string> data, string? passPhrase) {
        if (!data.TryGetValue("signature", out var providedSignature)) return false;
        var dataWithoutSignature = data.Where(x => !x.Key.Equals("signature", StringComparison.OrdinalIgnoreCase)).ToDictionary(x => x.Key, x => x.Value);
        var calculatedSignature = Generate(dataWithoutSignature, passPhrase);
        return CryptographicOperations.FixedTimeEquals(Encoding.UTF8.GetBytes(calculatedSignature.ToLowerInvariant()), Encoding.UTF8.GetBytes(providedSignature.Trim().ToLowerInvariant()));
    }
    public static string BuildParameterString(IReadOnlyDictionary<string, string> data) {
        var builder = new StringBuilder();
        foreach (var pair in data.Where(x => !string.IsNullOrWhiteSpace(x.Value)).OrderBy(x => x.Key, StringComparer.Ordinal)) {
            if (builder.Length > 0) builder.Append('&');
            builder.Append(pair.Key);
            builder.Append('=');
            builder.Append(UrlEncode(pair.Value.Trim()));
        }
        return builder.ToString();
    }
    private static string UrlEncode(string value) => Uri.EscapeDataString(value).Replace("%20", "+");
}
