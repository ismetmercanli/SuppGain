namespace SuppGain.Infrastructure.Email;

public sealed class SmtpOptions
{
    public const string SectionName = "Smtp";

    public string Host { get; set; } = string.Empty;
    public int Port { get; set; } = 587;
    public bool UseStartTls { get; set; } = true;
    public string? User { get; set; }
    public string? Password { get; set; }
    public string FromEmail { get; set; } = "noreply@localhost";
    public string FromName { get; set; } = "SuppGain";
}
