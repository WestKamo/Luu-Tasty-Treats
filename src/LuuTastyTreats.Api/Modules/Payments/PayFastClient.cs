using System.Net.Http.Headers;
using System.Text;
using Microsoft.Extensions.Options;
namespace LuuTastyTreats.Api.Modules.Payments;
public sealed class PayFastClient {
    private readonly HttpClient _httpClient;
    private readonly PayFastOptions _options;
    private readonly ILogger<PayFastClient> _logger;
    public PayFastClient(HttpClient httpClient, IOptions<PayFastOptions> options, ILogger<PayFastClient> logger) {
        _httpClient = httpClient;
        _options = options.Value;
        _logger = logger;
    }
    public async Task<bool> ValidateNotificationAsync(IReadOnlyDictionary<string, string> formData, CancellationToken cancellationToken) {
        var parameterString = PayFastSignature.BuildParameterString(formData);
        using var content = new StringContent(parameterString, Encoding.UTF8, "application/x-www-form-urlencoded");
        using var request = new HttpRequestMessage(HttpMethod.Post, _options.ValidateUrl) { Content = content };
        request.Headers.UserAgent.Add(new ProductInfoHeaderValue("LuuTastyTreats", "1.0"));
        using var response = await _httpClient.SendAsync(request, cancellationToken);
        if (!response.IsSuccessStatusCode) {
            _logger.LogWarning("PayFast ITN validation returned HTTP {StatusCode}", response.StatusCode);
            return false;
        }
        var body = (await response.Content.ReadAsStringAsync(cancellationToken)).Trim();
        var valid = body.Equals("VALID", StringComparison.OrdinalIgnoreCase);
        if (!valid) {
            _logger.LogWarning("PayFast ITN validation returned {Response}", body);
        }
        return valid;
    }
}
