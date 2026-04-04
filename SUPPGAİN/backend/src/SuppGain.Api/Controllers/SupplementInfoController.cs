using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SuppGain.Api.Common.Extensions;
using SuppGain.Application.Common.Models;
using SuppGain.Application.Features.SupplementInfos.Models;
using SuppGain.Application.Features.SupplementInfos.Services;

namespace SuppGain.Api.Controllers;

[ApiController]
[Route("supplement-info")]
public class SupplementInfoController : ControllerBase
{
    private readonly ISupplementInfoService _supplementInfoService;

    public SupplementInfoController(ISupplementInfoService supplementInfoService)
    {
        _supplementInfoService = supplementInfoService;
    }

    [AllowAnonymous]
    [HttpGet]
    public async Task<IActionResult> GetList([FromQuery] SupplementInfoListQuery query, CancellationToken cancellationToken)
    {
        var isAdmin = User.IsAdmin();
        var list = await _supplementInfoService.GetListAsync(query, isAdmin, cancellationToken);
        return Ok(list);
    }

    [AllowAnonymous]
    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken cancellationToken)
    {
        var isAdmin = User.IsAdmin();
        var result = await _supplementInfoService.GetByIdAsync(id, isAdmin, cancellationToken);
        return ToActionResult(result);
    }

    [Authorize(Roles = "Admin")]
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateSupplementInfoRequest request, CancellationToken cancellationToken)
    {
        var result = await _supplementInfoService.CreateAsync(request, cancellationToken);
        if (result.IsSuccess)
        {
            return CreatedAtAction(nameof(GetById), new { id = result.Value!.Id }, result.Value);
        }

        return ToActionResult(result);
    }

    [Authorize(Roles = "Admin")]
    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateSupplementInfoRequest request, CancellationToken cancellationToken)
    {
        var result = await _supplementInfoService.UpdateAsync(id, request, cancellationToken);
        return ToActionResult(result);
    }

    [Authorize(Roles = "Admin")]
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        var result = await _supplementInfoService.DeleteAsync(id, cancellationToken);
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
            "NOT_FOUND" => this.ApiError(StatusCodes.Status404NotFound, "NOT_FOUND", result.ErrorMessage ?? "Kayit bulunamadi."),
            "ALREADY_EXISTS" => this.ApiError(StatusCodes.Status409Conflict, "ALREADY_EXISTS", result.ErrorMessage ?? "Kayit zaten mevcut."),
            _ => this.ApiError(StatusCodes.Status400BadRequest, result.ErrorCode ?? "BAD_REQUEST", result.ErrorMessage ?? "Islem basarisiz.")
        };
    }
}
