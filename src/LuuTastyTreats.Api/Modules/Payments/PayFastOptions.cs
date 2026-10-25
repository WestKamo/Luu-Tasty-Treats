namespace LuuTastyTreats.Api.Modules.Payments;
public sealed class PayFastOptions {
    public const string SectionName = "PayFast";
    public string MerchantId { get; set; } = string.Empty;
    public string MerchantKey { get; set; } = string.Empty;
    public string? PassPhrase { get; set; }
    public string ProcessUrl { get; set; } = "https://sandbox.payfast.co.za/eng/process";
    public string ValidateUrl { get; set; } = "https://sandbox.payfast.co.za/eng/query/validate";
    public string ReturnUrl { get; set; } = string.Empty;
    public string CancelUrl { get; set; } = string.Empty;
    public string NotifyUrl { get; set; } = string.Empty;
    public bool IsSandbox { get; set; } = true;
}
