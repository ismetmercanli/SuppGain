using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using SuppGain.Application.Common.Interfaces;
using SuppGain.Infrastructure.Email;
using SuppGain.Application.Features.Auth.Services;
using SuppGain.Application.Features.AthletePackages.Services;
using SuppGain.Application.Features.Cart.Services;
using SuppGain.Application.Features.Notifications.Services;
using SuppGain.Application.Features.Orders.Services;
using SuppGain.Application.Features.Products.Services;
using SuppGain.Application.Features.SupplementInfos.Services;
using SuppGain.Application.Features.SupplementTracking.Services;
using SuppGain.Application.Features.Users.Services;
using SuppGain.Application.Features.WeeklyPrograms.Services;
using SuppGain.Infrastructure.Caching;
using SuppGain.Infrastructure.Messaging;
using SuppGain.Infrastructure.Persistence;
using SuppGain.Infrastructure.Security;
using SuppGain.Infrastructure.Services;

namespace SuppGain.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("DefaultConnection");

        services.Configure<SmtpOptions>(configuration.GetSection(SmtpOptions.SectionName));
        services.Configure<AppOptions>(configuration.GetSection(AppOptions.SectionName));
        services.Configure<RabbitMqOptions>(configuration.GetSection(RabbitMqOptions.SectionName));
        services.Configure<RedisOptions>(configuration.GetSection(RedisOptions.SectionName));
        services.AddScoped<IEmailSender, SmtpEmailSender>();
        services.AddScoped<IOrderEventPublisher, RabbitMqOrderEventPublisher>();
        services.AddScoped<IProductCache, RedisProductCache>();

        services.AddDbContext<AppDbContext>(options =>
            options.UseNpgsql(connectionString));

        services.AddScoped<IApplicationDbContext>(provider =>
            provider.GetRequiredService<AppDbContext>());
        services.AddScoped<IPasswordHasher, BcryptPasswordHasher>();
        services.AddScoped<IJwtTokenGenerator, JwtTokenGenerator>();
        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<IAthletePackageService, AthletePackageService>();
        services.AddScoped<IUserService, UserService>();
        services.AddScoped<IProductService, ProductService>();
        services.AddScoped<ICartService, CartService>();
        services.AddScoped<IOrderService, OrderService>();
        services.AddScoped<IWeeklyProgramService, WeeklyProgramService>();
        services.AddScoped<ISupplementInfoService, SupplementInfoService>();
        services.AddScoped<ISupplementTrackingService, SupplementTrackingService>();
        services.AddScoped<INotificationService, NotificationService>();

        return services;
    }
}
