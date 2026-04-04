using SuppGain.Application.Common.Models;
using SuppGain.Application.Features.Notifications.Models;

namespace SuppGain.Application.Features.Notifications.Services;

public interface INotificationService
{
    Task<OperationResult<NotificationReminderResponse>> CreateReminderAsync(
        Guid userId,
        CreateNotificationReminderRequest request,
        CancellationToken cancellationToken);

    Task<IReadOnlyList<NotificationReminderResponse>> GetMyRemindersAsync(Guid userId, CancellationToken cancellationToken);

    Task<OperationResult<NotificationReminderResponse>> UpdateReminderAsync(
        Guid reminderId,
        Guid userId,
        UpdateNotificationReminderRequest request,
        CancellationToken cancellationToken);

    Task<OperationResult<bool>> DeleteReminderAsync(Guid reminderId, Guid userId, CancellationToken cancellationToken);

    Task<OperationResult<NotificationLogResponse>> SendNowAsync(Guid reminderId, Guid userId, CancellationToken cancellationToken);

    Task<IReadOnlyList<NotificationLogResponse>> GetMyLogsAsync(
        Guid userId,
        NotificationLogListQuery query,
        CancellationToken cancellationToken);
}
