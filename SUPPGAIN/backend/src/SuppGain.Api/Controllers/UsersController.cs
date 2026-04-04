using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SuppGain.Api.Common.Extensions;
using SuppGain.Application.Common.Models;
using SuppGain.Application.Features.Users.Models;
using SuppGain.Application.Features.Users.Services;

namespace SuppGain.Api.Controllers;

[ApiController]
[Authorize]
[Route("users")]
public class UsersController : ControllerBase
{
    private readonly IUserService _userService;

    public UsersController(IUserService userService)
    {
        _userService = userService;
    }

    [HttpGet("me")]
    public async Task<IActionResult> GetMe(CancellationToken cancellationToken)
    {
        var requesterId = User.GetUserId();
        if (requesterId is null)
        {
            return Unauthorized();
        }

        var result = await _userService.GetByIdAsync(requesterId.Value, requesterId.Value, User.IsAdmin(), cancellationToken);
        return ToActionResult(result);
    }

    [HttpPut("me")]
    public async Task<IActionResult> UpdateMe([FromBody] UpdateUserRequest request, CancellationToken cancellationToken)
    {
        var requesterId = User.GetUserId();
        if (requesterId is null)
        {
            return Unauthorized();
        }

        var result = await _userService.UpdateAsync(requesterId.Value, requesterId.Value, false, request, cancellationToken);
        return ToActionResult(result);
    }

    [HttpDelete("me")]
    public async Task<IActionResult> DeleteMe(CancellationToken cancellationToken)
    {
        var requesterId = User.GetUserId();
        if (requesterId is null)
        {
            return Unauthorized();
        }

        var result = await _userService.DeleteAsync(requesterId.Value, requesterId.Value, false, cancellationToken);
        if (result.IsSuccess)
        {
            return NoContent();
        }

        return ToActionResult(result);
    }

    [HttpGet("{userId:guid}")]
    public async Task<IActionResult> GetById(Guid userId, CancellationToken cancellationToken)
    {
        var requesterId = User.GetUserId();
        if (requesterId is null)
        {
            return Unauthorized();
        }

        var result = await _userService.GetByIdAsync(userId, requesterId.Value, User.IsAdmin(), cancellationToken);
        return ToActionResult(result);
    }

    [HttpPut("{userId:guid}")]
    public async Task<IActionResult> Update(Guid userId, [FromBody] UpdateUserRequest request, CancellationToken cancellationToken)
    {
        var requesterId = User.GetUserId();
        if (requesterId is null)
        {
            return Unauthorized();
        }

        var result = await _userService.UpdateAsync(userId, requesterId.Value, User.IsAdmin(), request, cancellationToken);
        return ToActionResult(result);
    }

    [HttpDelete("{userId:guid}")]
    public async Task<IActionResult> Delete(Guid userId, CancellationToken cancellationToken)
    {
        var requesterId = User.GetUserId();
        if (requesterId is null)
        {
            return Unauthorized();
        }

        var result = await _userService.DeleteAsync(userId, requesterId.Value, User.IsAdmin(), cancellationToken);
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
            "FORBIDDEN" => this.ApiError(StatusCodes.Status403Forbidden, "FORBIDDEN", result.ErrorMessage ?? "Bu islem icin yetkiniz yok."),
            "NOT_FOUND" => this.ApiError(StatusCodes.Status404NotFound, "NOT_FOUND", result.ErrorMessage ?? "Kayit bulunamadi."),
            "EMAIL_ALREADY_EXISTS" => this.ApiError(StatusCodes.Status409Conflict, "EMAIL_ALREADY_EXISTS", result.ErrorMessage ?? "Email zaten kullanimda."),
            _ => this.ApiError(StatusCodes.Status400BadRequest, result.ErrorCode ?? "BAD_REQUEST", result.ErrorMessage ?? "Islem basarisiz.")
        };
    }
}
