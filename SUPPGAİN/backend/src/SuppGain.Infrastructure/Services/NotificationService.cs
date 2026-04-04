using System.Globalization;
using Microsoft.EntityFrameworkCore;
using SuppGain.Application.Common.Interfaces;
using SuppGain.Application.Common.Models;
using SuppGain.Application.Features.Notifications.Models;
using SuppGain.Application.Features.Notifications.Services;
using SuppGain.Domain.Entities;
using SuppGain.Domain.Enums;

namespace SuppGain.Infrastructure.Services;

public class NotificationService : INotificationService
{
    private readonly IApplicationDbContext _dbContext;

    public NotificationService(IApplicationDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<OperationResult<NotificationReminderResponse>> CreateReminderAsync(
        Guid userId,
        CreateNotificationReminderRequest request,
        CancellationToken cancellationToken)
    {
        var trackerValidation = await ValidateTrackerAsync(request.SupplementTrackerId, userId, cancellationToken);
        if (!trackerValidation.IsSuccess)
        {
            return OperationResult<NotificationReminderResponse>.Failure(trackerValidation.ErrorCode!, trackerValidation.ErrorMessage!);
        }

        var parseTime = TryParseNotifyTime(request.NotifyAtTimeUtc);
        if (!parseTime.IsSuccess)
        {
            return OperationResult<NotificationReminderResponse>.Failure(parseTime.ErrorCode!, parseTime.ErrorMessage!);
        }

        var parseChannel = TryParseChannel(request.Channel);
        if (!parseChannel.IsSuccess)
        {
            return OperationResult<NotificationReminderResponse>.Failure(parseChannel.ErrorCode!, parseChannel.ErrorMessage!);
        }

        var reminder = new NotificationReminder
        {
            UserId = userId,
            SupplementTrackerId = request.SupplementTrackerId,
            Title = request.Title.Trim(),
            Message = request.Message.Trim(),
            NotifyAtTimeUtc = parseTime.Value,
            DaysOfWeekJson = string.IsNullOrWhiteSpace(request.DaysOfWeekJson) ? "[]" : request.DaysOfWeekJson.Trim(),
            Channel = parseChannel.Value,
            IsEnabled = true
        };

        _dbContext.NotificationReminders.Add(reminder);
        await _dbContext.SaveChangesAsync(cancellationToken);

        return OperationResult<NotificationReminderResponse>.Success(MapReminder(reminder));
    }

    public async Task<IReadOnlyList<NotificationReminderResponse>> GetMyRemindersAsync(Guid userId, CancellationToken cancellationToken)
    {
        return await _dbContext.NotificationReminders
            .Where(x => x.UserId == userId)
            .OrderByDescending(x => x.CreatedAtUtc)
            .Select(x => MapReminder(x))
            .ToListAsync(cancellationToken);
    }

    public async Task<OperationResult<NotificationReminderResponse>> UpdateReminderAsync(
        Guid reminderId,
        Guid userId,
        UpdateNotificationReminderRequest request,
        CancellationToken cancellationToken)
    {
        var reminder = await _dbContext.NotificationReminders
            .FirstOrDefaultAsync(x => x.Id == reminderId, cancellationToken);

        if (reminder is null)
        {
            return OperationResult<NotificationReminderResponse>.Failure("NOT_FOUND", "Bildirim kaydi bulunamadi.");
        }

        if (reminder.UserId != userId)
        {
            return OperationResult<NotificationReminderResponse>.Failure("FORBIDDEN", "Bu kaydi guncelleme yetkiniz yok.");
        }

        var parseTime = TryParseNotifyTime(request.NotifyAtTimeUtc);
        if (!parseTime.IsSuccess)
        {
            return OperationResult<NotificationReminderResponse>.Failure(parseTime.ErrorCode!, parseTime.ErrorMessage!);
        }

        var parseChannel = TryParseChannel(request.Channel);
        if (!parseChannel.IsSuccess)
        {
            return OperationResult<NotificationReminderResponse>.Failure(parseChannel.ErrorCode!, parseChannel.ErrorMessage!);
        }

        reminder.Title = request.Title.Trim();
        reminder.Message = request.Message.Trim();
        reminder.NotifyAtTimeUtc = parseTime.Value;
        reminder.DaysOfWeekJson = string.IsNullOrWhiteSpace(request.DaysOfWeekJson) ? "[]" : request.DaysOfWeekJson.Trim();
        reminder.Channel = parseChannel.Value;
        reminder.IsEnabled = request.IsEnabled;
        reminder.UpdatedAtUtc = DateTime.UtcNow;

        await _dbContext.SaveChangesAsync(cancellationToken);

        return OperationResult<NotificationReminderResponse>.Success(MapReminder(reminder));
    }

    public async Task<OperationResult<bool>> DeleteReminderAsync(Guid reminderId, Guid userId, CancellationToken cancellationToken)
    {
        var reminder = await _dbContext.NotificationReminders.FirstOrDefaultAsync(x => x.Id == reminderId, cancellationToken);
        if (reminder is null)
        {
            return OperationResult<bool>.Failure("NOT_FOUND", "Bildirim kaydi bulunamadi.");
        }

        if (reminder.UserId != userId)
        {
            return OperationResult<bool>.Failure("FORBIDDEN", "Bu kaydi silme yetkiniz yok.");
        }

        _dbContext.NotificationReminders.Remove(reminder);
        await _dbContext.SaveChangesAsync(cancellationToken);

        return OperationResult<bool>.Success(true);
    }

    public async Task<OperationResult<NotificationLogResponse>> SendNowAsync(Guid reminderId, Guid userId, CancellationToken cancellationToken)
    {
        var reminder = await _dbContext.NotificationReminders
            .FirstOrDefaultAsync(x => x.Id == reminderId, cancellationToken);

        if (reminder is null)
        {
            return OperationResult<NotificationLogResponse>.Failure("NOT_FOUND", "Bildirim kaydi bulunamadi.");
        }

        if (reminder.UserId != userId)
        {
            return OperationResult<NotificationLogResponse>.Failure("FORBIDDEN", "Bu kayda erisim yetkiniz yok.");
        }

        if (!reminder.IsEnabled)
        {
            return OperationResult<NotificationLogResponse>.Failure("REMINDER_DISABLED", "Bildirim kaydi pasif.");
        }

        var now = DateTime.UtcNow;
        reminder.LastSentAtUtc = now;
        reminder.UpdatedAtUtc = now;

        var log = new NotificationLog
        {
            ReminderId = reminder.Id,
            UserId = reminder.UserId,
            ScheduledAtUtc = now,
            SentAtUtc = now,
            Status = NotificationDeliveryStatus.Sent
        };

        _dbContext.NotificationLogs.Add(log);
        await _dbContext.SaveChangesAsync(cancellationToken);

        return OperationResult<NotificationLogResponse>.Success(MapLog(log));
    }

    public async Task<IReadOnlyList<NotificationLogResponse>> GetMyLogsAsync(
        Guid userId,
        NotificationLogListQuery query,
        CancellationToken cancellationToken)
    {
        var logsQuery = _dbContext.NotificationLogs
            .Where(x => x.UserId == userId)
            .AsQueryable();

        if (query.ReminderId.HasValue)
        {
            logsQuery = logsQuery.Where(x => x.ReminderId == query.ReminderId.Value);
        }

        return await logsQuery
            .OrderByDescending(x => x.SentAtUtc)
            .Take(200)
            .Select(x => MapLog(x))
            .ToListAsync(cancellationToken);
    }

    private async Task<OperationResult<bool>> ValidateTrackerAsync(Guid? trackerId, Guid userId, CancellationToken cancellationToken)
    {
        if (!trackerId.HasValue)
        {
            return OperationResult<bool>.Success(true);
        }

        var tracker = await _dbContext.SupplementTrackers
            .FirstOrDefaultAsync(x => x.Id == trackerId.Value, cancellationToken);

        if (tracker is null)
        {
            return OperationResult<bool>.Failure("TRACKER_NOT_FOUND", "Ilgili supplement takip kaydi bulunamadi.");
        }

        if (tracker.UserId != userId)
        {
            return OperationResult<bool>.Failure("FORBIDDEN", "Bu takip kaydina bagli bildirim olusturamazsiniz.");
        }

        return OperationResult<bool>.Success(true);
    }

    private static OperationResult<TimeSpan> TryParseNotifyTime(string value)
    {
        if (TimeSpan.TryParseExact(value, "hh\\:mm", CultureInfo.InvariantCulture, out var parsed))
        {
            return OperationResult<TimeSpan>.Success(parsed);
        }

        if (TimeSpan.TryParseExact(value, "hh\\:mm\\:ss", CultureInfo.InvariantCulture, out parsed))
        {
            return OperationResult<TimeSpan>.Success(parsed);
        }

        return OperationResult<TimeSpan>.Failure("INVALID_NOTIFY_TIME", "NotifyAtTimeUtc formati HH:mm veya HH:mm:ss olmali.");
    }

    private static OperationResult<NotificationChannel> TryParseChannel(string value)
    {
        if (Enum.TryParse<NotificationChannel>(value, true, out var channel))
        {
            return OperationResult<NotificationChannel>.Success(channel);
        }

        return OperationResult<NotificationChannel>.Failure("INVALID_CHANNEL", "Gecerli channel degerleri: InApp, Email, Push.");
    }

    private static NotificationReminderResponse MapReminder(NotificationReminder reminder)
    {
        return new NotificationReminderResponse
        {
            Id = reminder.Id,
            UserId = reminder.UserId,
            SupplementTrackerId = reminder.SupplementTrackerId,
            Title = reminder.Title,
            Message = reminder.Message,
            NotifyAtTimeUtc = reminder.NotifyAtTimeUtc.ToString(@"hh\:mm"),
            DaysOfWeekJson = reminder.DaysOfWeekJson,
            Channel = reminder.Channel.ToString(),
            IsEnabled = reminder.IsEnabled,
            LastSentAtUtc = reminder.LastSentAtUtc,
            CreatedAtUtc = reminder.CreatedAtUtc,
            UpdatedAtUtc = reminder.UpdatedAtUtc
        };
    }

    private static NotificationLogResponse MapLog(NotificationLog log)
    {
        return new NotificationLogResponse
        {
            Id = log.Id,
            ReminderId = log.ReminderId,
            UserId = log.UserId,
            ScheduledAtUtc = log.ScheduledAtUtc,
            SentAtUtc = log.SentAtUtc,
            Status = log.Status.ToString(),
            ErrorMessage = log.ErrorMessage
        };
    }
}
