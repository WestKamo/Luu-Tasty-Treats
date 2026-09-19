using LuuTastyTreats.Api.Modules.Catalog.Domain;
using LuuTastyTreats.Api.Shared.Infrastructure;
using Microsoft.AspNetCore.Mvc;
namespace LuuTastyTreats.Api.Modules.Catalog.Features.SubmitCustomInquiry;
public record CustomInquiryRequest(string CustomerName, string CustomerEmail, string Details);
public static class SubmitCustomInquiryEndpoint {
    public static void MapSubmitCustomInquiryEndpoint(this RouteGroupBuilder group) {
        group.MapPost("/custom-inquiries", async ([FromBody] CustomInquiryRequest req, AppDbContext db, CancellationToken ct) => {
            db.Set<CustomInquiry>().Add(new CustomInquiry { InquiryId = Guid.NewGuid(), CustomerName = req.CustomerName, CustomerEmail = req.CustomerEmail, Details = req.Details });
            await db.SaveChangesAsync(ct);
            return Results.Ok(new { message = "Inquiry received." });
        }).AllowAnonymous();
    }
}
