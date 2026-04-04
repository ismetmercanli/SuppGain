using System.Globalization;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SuppGain.Api.Common.Extensions;
using SuppGain.Application.Common.Models;
using SuppGain.Application.Features.SupplementTracking.Models;
using SuppGain.Application.Features.SupplementTracking.Services;

namespace SuppGain.Api.Controllers;

[ApiController]
[Authorize]
[Route("supplement-tracker")]
public class SupplementTrackerController : ControllerBase
{
    private readonly ISupplementTrackingService _supplementTrackingService;

    public SupplementTrackerController(ISupplementTrackingService supplementTrackingService)
    {
        _supplementTrackingService = supplementTrackingService;
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateSupplementTrackerRequest request, CancellationToken cancellationToken)
    {
        var userId = User.GetUserId();
        if (userId is null)
        {
            return Unauthorized();
        }

        var result = await _supplementTrackingService.CreateAsync(userId.Value, request, cancellationToken);
        if (result.IsSuccess)
        {
            return CreatedAtAction(nameof(GetStockStatus), new { id = result.Value!.TrackerId }, result.Value);
        }

        return ToActionResult(result);
    }

    [HttpGet("me")]
    public async Task<IActionResult> GetMyTrackers(CancellationToken cancellationToken)
    {
        var userId = User.GetUserId();
        if (userId is null)
        {
            return Unauthorized();
        }

        var list = await _supplementTrackingService.GetMyTrackersAsync(userId.Value, cancellationToken);
        return Ok(list);
    }

    [HttpGet("dashboard")]
    public async Task<IActionResult> GetDashboard([FromQuery] string? date, CancellationToken cancellationToken)
    {
        var userId = User.GetUserId();
        if (userId is null)
        {
            return Unauthorized();
        }

        DateOnly? localDate = null;
        if (!string.IsNullOrWhiteSpace(date))
        {
            if (!DateOnly.TryParse(date, CultureInfo.InvariantCulture, DateTimeStyles.None, out var parsed))
            {
                return this.ApiError(StatusCodes.Status400BadRequest, "INVALID_DATE", "Tarih yyyy-MM-dd formatinda olmalidir.");
            }

            localDate = parsed;
        }

        var dashboard = await _supplementTrackingService.GetDashboardAsync(userId.Value, localDate, cancellationToken);
        return Ok(dashboard);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateSupplementTrackerRequest request, CancellationToken cancellationToken)
    {
        var userId = User.GetUserId();
        if (userId is null)
        {
            return Unauthorized();
        }

        var result = await _supplementTrackingService.UpdateAsync(id, userId.Value, request, cancellationToken);
        return ToActionResult(result);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        var userId = User.GetUserId();
        if (userId is null)
        {
            return Unauthorized();
        }

        var result = await _supplementTrackingService.DeleteAsync(id, userId.Value, cancellationToken);
        if (result.IsSuccess)
        {
            return NoContent();
        }

        return ToActionResult(result);
    }

    [HttpPost("{id:guid}/consume")]
    public async Task<IActionResult> Consume(Guid id, [FromBody] ConsumeSupplementRequest request, CancellationToken cancellationToken)
    {
        var userId = User.GetUserId();
        if (userId is null)
        {
            return Unauthorized();
        }

        var result = await _supplementTrackingService.ConsumeAsync(id, userId.Value, request, cancellationToken);
        return ToActionResult(result);
    }

    [HttpGet("{id:guid}/stock-status")]
    public async Task<IActionResult> GetStockStatus(Guid id, CancellationToken cancellationToken)
    {
        var userId = User.GetUserId();
        if (userId is null)
        {
            return Unauthorized();
        }

        var result = await _supplementTrackingService.GetStockStatusAsync(id, userId.Value, cancellationToken);
        return ToActionResult(result);
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
            "PRODUCT_NOT_FOUND" => this.ApiError(StatusCodes.Status404NotFound, "PRODUCT_NOT_FOUND", result.ErrorMessage ?? "Urun bulunamadi."),
            "FORBIDDEN" => this.ApiError(StatusCodes.Status403Forbidden, "FORBIDDEN", result.ErrorMessage ?? "Bu islem icin yetkiniz yok."),
            "OUT_OF_STOCK" => this.ApiError(StatusCodes.Status400BadRequest, "OUT_OF_STOCK", result.ErrorMessage ?? "Yetersiz stok."),
            "INACTIVE_TRACKER" => this.ApiError(StatusCodes.Status400BadRequest, "INACTIVE_TRACKER", result.ErrorMessage ?? "Takip kaydi pasif."),
            _ => this.ApiError(StatusCodes.Status400BadRequest, result.ErrorCode ?? "BAD_REQUEST", result.ErrorMessage ?? "Islem basarisiz.")
        };
    }
}
