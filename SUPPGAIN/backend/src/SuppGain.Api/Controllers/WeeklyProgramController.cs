using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SuppGain.Api.Common.Extensions;
using SuppGain.Application.Common.Models;
using SuppGain.Application.Features.WeeklyPrograms.Models;
using SuppGain.Application.Features.WeeklyPrograms.Services;

namespace SuppGain.Api.Controllers;

[ApiController]
[Authorize]
[Route("weekly-program")]
public class WeeklyProgramController : ControllerBase
{
    private readonly IWeeklyProgramService _weeklyProgramService;

    public WeeklyProgramController(IWeeklyProgramService weeklyProgramService)
    {
        _weeklyProgramService = weeklyProgramService;
    }

    [HttpGet("me")]
    public async Task<IActionResult> GetMyPrograms(CancellationToken cancellationToken)
    {
        var userId = User.GetUserId();
        if (userId is null)
        {
            return Unauthorized();
        }

        var list = await _weeklyProgramService.GetMyProgramsAsync(userId.Value, cancellationToken);
        return Ok(list);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateWeeklyProgramRequest request, CancellationToken cancellationToken)
    {
        var userId = User.GetUserId();
        if (userId is null)
        {
            return Unauthorized();
        }

        var result = await _weeklyProgramService.CreateAsync(userId.Value, request, cancellationToken);
        if (result.IsSuccess)
        {
            return CreatedAtAction(nameof(Update), new { programId = result.Value!.ProgramId }, result.Value);
        }

        return ToActionResult(result);
    }

    [HttpPost("auto-from-purchases")]
    public async Task<IActionResult> AutoCreateFromPurchases(
        [FromBody] AutoCreateWeeklyProgramRequest request,
        CancellationToken cancellationToken)
    {
        var userId = User.GetUserId();
        if (userId is null)
        {
            return Unauthorized();
        }

        var result = await _weeklyProgramService.AutoCreateFromPurchasesAsync(userId.Value, request, cancellationToken);
        if (result.IsSuccess)
        {
            return CreatedAtAction(nameof(GetMyPrograms), new { }, result.Value);
        }

        return ToActionResult(result);
    }

    [HttpPut("{programId:guid}")]
    public async Task<IActionResult> Update(
        Guid programId,
        [FromBody] UpdateWeeklyProgramRequest request,
        CancellationToken cancellationToken)
    {
        var userId = User.GetUserId();
        if (userId is null)
        {
            return Unauthorized();
        }

        var result = await _weeklyProgramService.UpdateAsync(programId, userId.Value, request, cancellationToken);
        return ToActionResult(result);
    }

    [HttpDelete("{programId:guid}")]
    public async Task<IActionResult> Delete(Guid programId, CancellationToken cancellationToken)
    {
        var userId = User.GetUserId();
        if (userId is null)
        {
            return Unauthorized();
        }

        var result = await _weeklyProgramService.DeleteAsync(programId, userId.Value, cancellationToken);
        if (result.IsSuccess)
        {
            return NoContent();
        }

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
            "USER_NOT_FOUND" => this.ApiError(StatusCodes.Status404NotFound, "USER_NOT_FOUND", result.ErrorMessage ?? "Kullanici bulunamadi."),
            "NOT_FOUND" => this.ApiError(StatusCodes.Status404NotFound, "NOT_FOUND", result.ErrorMessage ?? "Kayit bulunamadi."),
            "FORBIDDEN" => this.ApiError(StatusCodes.Status403Forbidden, "FORBIDDEN", result.ErrorMessage ?? "Bu islem icin yetkiniz yok."),
            "NO_PURCHASED_PRODUCTS" => this.ApiError(StatusCodes.Status400BadRequest, "NO_PURCHASED_PRODUCTS", result.ErrorMessage ?? "Satin alinmis urun bulunamadi."),
            "NO_VALID_SELECTED_PRODUCTS" => this.ApiError(StatusCodes.Status400BadRequest, "NO_VALID_SELECTED_PRODUCTS", result.ErrorMessage ?? "Secilen urunler gecersiz."),
            _ => this.ApiError(StatusCodes.Status400BadRequest, result.ErrorCode ?? "BAD_REQUEST", result.ErrorMessage ?? "Islem basarisiz.")
        };
    }
}
