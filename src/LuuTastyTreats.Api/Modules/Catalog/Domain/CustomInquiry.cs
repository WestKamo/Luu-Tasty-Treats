namespace LuuTastyTreats.Api.Modules.Catalog.Domain;
public class CustomInquiry {
    public Guid InquiryId { get; set; }
    public string CustomerName { get; set; } = default!;
    public string CustomerEmail { get; set; } = default!;
    public string Details { get; set; } = default!;
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
}
