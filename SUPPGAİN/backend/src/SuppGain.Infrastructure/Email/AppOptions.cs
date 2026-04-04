namespace SuppGain.Infrastructure.Email;

public sealed class AppOptions
{
    public const string SectionName = "App";

    /// <summary>Şifre sıfırlama linkinde kullanılacak frontend kök adresi (örn. http://localhost:5173).</summary>
    public string PublicFrontendUrl { get; set; } = "http://localhost:5173";
}
