using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using SuppGain.Application.Common.Interfaces;
using SuppGain.Domain.Entities;
using SuppGain.Domain.Enums;

namespace SuppGain.Infrastructure.Bootstrap;

public static class AdminSeedRunner
{
    public static async Task SeedAsync(IServiceProvider serviceProvider, IConfiguration configuration, CancellationToken cancellationToken = default)
    {
        var section = configuration.GetSection("AdminSeed");
        var options = new AdminSeedOptions
        {
            Enabled = bool.TryParse(section["Enabled"], out var enabled) && enabled,
            Email = section["Email"] ?? string.Empty,
            Password = section["Password"] ?? string.Empty,
            FirstName = section["FirstName"] ?? "System",
            LastName = section["LastName"] ?? "Admin",
            Phone = section["Phone"]
        };

        if (!options.Enabled)
        {
            return;
        }

        if (string.IsNullOrWhiteSpace(options.Email) || string.IsNullOrWhiteSpace(options.Password))
        {
            return;
        }

        using var scope = serviceProvider.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<IApplicationDbContext>();
        var passwordHasher = scope.ServiceProvider.GetRequiredService<IPasswordHasher>();

        var normalizedEmail = options.Email.Trim().ToLowerInvariant();
        var existing = await dbContext.Users.FirstOrDefaultAsync(x => x.Email == normalizedEmail, cancellationToken);

        if (existing is not null)
        {
            existing.Role = UserRole.Admin;
            existing.PasswordHash = passwordHasher.Hash(options.Password);
            existing.IsActive = true;
            existing.UpdatedAtUtc = DateTime.UtcNow;
            await dbContext.SaveChangesAsync(cancellationToken);

            return;
        }

        dbContext.Users.Add(new User
        {
            FirstName = string.IsNullOrWhiteSpace(options.FirstName) ? "System" : options.FirstName.Trim(),
            LastName = string.IsNullOrWhiteSpace(options.LastName) ? "Admin" : options.LastName.Trim(),
            Email = normalizedEmail,
            PasswordHash = passwordHasher.Hash(options.Password),
            Phone = string.IsNullOrWhiteSpace(options.Phone) ? null : options.Phone.Trim(),
            Role = UserRole.Admin,
            IsActive = true
        });

        await dbContext.SaveChangesAsync(cancellationToken);
    }
}
