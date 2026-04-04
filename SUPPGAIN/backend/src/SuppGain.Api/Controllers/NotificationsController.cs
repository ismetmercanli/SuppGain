using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SuppGain.Api.Common.Extensions;
using SuppGain.Application.Common.Models;
using SuppGain.Application.Features.Notifications.Models;
using SuppGain.Application.Features.Notifications.Services;

namespace SuppGain.Api.Controllers;

[ApiController]
[Authorize]
[Route("notifications")]
public class NotificationsController : ControllerBase
{
    private readonly INotificationService _notificationService;

    public NotificationsController(INotificationService notificationService)
    {
        _notificationService = notificationService;
    }

    [HttpPost("reminders")]
    public async Task<IActionResult> CreateReminder([FromBody] CreateNotificationReminderRequest request, CancellationToken cancellationToken)
    {
        var userId = User.GetUserId();
        if (userId is null)
        {
            return Unauthorized();
        }

        var result = await _notificationService.CreateReminderAsync(userId.Value, request, cancellationToken);
        if (result.IsSuccess)
        {
            return CreatedAtAction(nameof(GetMyReminders), null, result.Value);
        }

        return ToActionResult(result);
    }

    [HttpGet("reminders/me")]
    public async Task<IActionResult> GetMyReminders(CancellationToken cancellationToken)
    {
        var userId = User.GetUserId();
        if (userId is null)
        {
            return Unauthorized();
        }

        var list = await _notificationService.GetMyRemindersAsync(userId.Value, cancellationToken);
        return Ok(list);
    }

    [HttpPut("reminders/{id:guid}")]
    public async Task<IActionResult> UpdateReminder(
        Guid id,
        [FromBody] UpdateNotificationReminderRequest request,
        CancellationToken cancellationToken)
    {
        var userId = User.GetUserId();
        if (userId is null)
        {
            return Unauthorized();
        }

        var result = await _notificationService.UpdateReminderAsync(id, userId.Value, request, cancellationToken);
        return ToActionResult(result);
    }

    [HttpDelete("reminders/{id:guid}")]
    public async Task<IActionResult> DeleteReminder(Guid id, CancellationToken cancellationToken)
    {
        var userId = User.GetUserId();
        if (userId is null)
        {
            return Unauthorized();
        }

        var result = await _notificationService.DeleteReminderAsync(id, userId.Value, cancellationToken);
        if (result.IsSuccess)
        {
            return NoContent();
        }

        return ToActionResult(result);
    }

    [HttpPost("reminders/{id:guid}/send-now")]
    public async Task<IActionResult> SendNow(Guid id, CancellationToken cancellationToken)
    {
        var userId = User.GetUserId();
        if (userId is null)
        {
            return Unauthorized();
        }

        var result = await _notificationService.SendNowAsync(id, userId.Value, cancellationToken);
        return ToActionResult(result);
    }

    [HttpGet("logs/me")]
    public async Task<IActionResult> GetMyLogs([FromQuery] NotificationLogListQuery query, CancellationToken cancellationToken)
    {
        var userId = User.GetUserId();
        if (userId is null)
        {
            return Unauthorized();
        }

        var list = await _notificationService.GetMyLogsAsync(userId.Value, query, cancellationToken);
        return Ok(list);
    }

    private IActionResult ToActionResult<T>(OperationResult<T> result)
    {
        if (result.IsSuccess)
        {
            return Ok(result.Value);
        }

        return result.ErrorCode switch
        {
            "NOT_FOUND" => this.ApiError(StatusCodes.Status404NotFound, "NOT_FOUND", result.ErrorMessage ?? "Kayit bulunamadi."),
            "TRACKER_NOT_FOUND" => this.ApiError(StatusCodes.Status404NotFound, "TRACKER_NOT_FOUND", result.ErrorMessage ?? "Takip kaydi bulunamadi."),
            "FORBIDDEN" => this.ApiError(StatusCodes.Status403Forbidden, "FORBIDDEN", result.ErrorMessage ?? "Bu islem icin yetkiniz yok."),
            "REMINDER_DISABLED" => this.ApiError(StatusCodes.Status400BadRequest, "REMINDER_DISABLED", result.ErrorMessage ?? "Bildirim pasif."),
            "INVALID_NOTIFY_TIME" => this.ApiError(StatusCodes.Status400BadRequest, "INVALID_NOTIFY_TIME", result.ErrorMessage ?? "Gecersiz saat formati."),
            "INVALID_CHANNEL" => this.ApiError(StatusCodes.Status400BadRequest, "INVALID_CHANNEL", result.ErrorMessage ?? "Gecersiz bildirim kanali."),
            _ => this.ApiError(StatusCodes.Status400BadRequest, result.ErrorCode ?? "BAD_REQUEST", result.ErrorMessage ?? "Islem basarisiz.")
        };
    }
}
