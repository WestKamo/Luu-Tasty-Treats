namespace LuuTastyTreats.Api.Shared.Infrastructure.Uploads;
public class UploadOptions {
    public const string SectionName = "Uploads";
    public string RootPath { get; set; } = "wwwroot/uploads/cakes";
    public int MaxFileSizeMb { get; set; } = 5;
    public List<string> AllowedExtensions { get; set; } = new() { ".jpg", ".jpeg", ".png", ".webp" };
}
