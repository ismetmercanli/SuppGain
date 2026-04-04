using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using MimeKit;
using SuppGain.Application.Common.Interfaces;

namespace SuppGain.Infrastructure.Email;

public sealed class SmtpEmailSender : IEmailSender
{
    private readonly IOptions<SmtpOptions> _options;
    private readonly ILogger<SmtpEmailSender> _logger;

    public SmtpEmailSender(IOptions<SmtpOptions> options, ILogger<SmtpEmailSender> logger)
    {
        _options = options;
        _logger = logger;
    }

    public async Task SendAsync(string to, string subject, string body, CancellationToken cancellationToken = default)
    {
        var opt = _options.Value;
        if (string.IsNullOrWhiteSpace(opt.Host))
        {
            _logger.LogWarning("SMTP Host bos; e-posta gonderilmedi. Alici: {To}", to);
            return;
        }

        using var message = new MimeMessage();
        message.From.Add(new MailboxAddress(opt.FromName, opt.FromEmail));
        message.To.Add(MailboxAddress.Parse(to));
        message.Subject = subject;
        message.Body = new TextPart("plain") { Text = body };

        using var client = new SmtpClient();
        var secure = opt.UseStartTls ? SecureSocketOptions.StartTls : SecureSocketOptions.Auto;
        await client.ConnectAsync(opt.Host, opt.Port, secure, cancellationToken);

        if (!string.IsNullOrEmpty(opt.User))
        {
            await client.AuthenticateAsync(opt.User, opt.Password ?? string.Empty, cancellationToken);
        }

        await client.SendAsync(message, cancellationToken);
        await client.DisconnectAsync(true, cancellationToken);
    }
}
