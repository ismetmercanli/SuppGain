using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SuppGain.Api.Common.Extensions;
using SuppGain.Application.Common.Models;
using SuppGain.Application.Features.AthletePackages.Models;
using SuppGain.Application.Features.AthletePackages.Services;

namespace SuppGain.Api.Controllers;

[ApiController]
[Route("packages")]
public class AthletePackagesController : ControllerBase
{
    private readonly IAthletePackageService _athletePackageService;

    public AthletePackagesController(IAthletePackageService athletePackageService)
    {
        _athletePackageService = athletePackageService;
    }

    [AllowAnonymous]
    [HttpGet]
    public async Task<IActionResult> GetList([FromQuery] AthletePackageListQuery query, CancellationToken cancellationToken)
    {
        var list = await _athletePackageService.GetListAsync(query, cancellationToken);
        return Ok(list);
    }

    [AllowAnonymous]
    [HttpGet("{packageId:guid}")]
    public async Task<IActionResult> GetById(Guid packageId, CancellationToken cancellationToken)
    {
        var result = await _athletePackageService.GetByIdAsync(packageId, cancellationToken);
        return ToActionResult(result);
    }

    [Authorize(Roles = "Admin")]
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateAthletePackageRequest request, CancellationToken cancellationToken)
    {
        var result = await _athletePackageService.CreateAsync(request, cancellationToken);
        if (result.IsSuccess)
        {
            return CreatedAtAction(nameof(GetById), new { packageId = result.Value!.Id }, result.Value);
        }

        return ToActionResult(result);
    }

    [Authorize(Roles = "Admin")]
    [HttpPut("{packageId:guid}")]
    public async Task<IActionResult> Update(
        Guid packageId,
        [FromBody] UpdateAthletePackageRequest request,
        CancellationToken cancellationToken)
    {
        var result = await _athletePackageService.UpdateAsync(packageId, request, cancellationToken);
        return ToActionResult(result);
    }

    [Authorize(Roles = "Admin")]
    [HttpDelete("{packageId:guid}")]
    public async Task<IActionResult> Delete(Guid packageId, CancellationToken cancellationToken)
    {
        var result = await _athletePackageService.DeleteAsync(packageId, cancellationToken);
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
            "PRODUCT_NOT_FOUND" => this.ApiError(StatusCodes.Status404NotFound, "PRODUCT_NOT_FOUND", result.ErrorMessage ?? "Urun bulunamadi."),
            "ALREADY_EXISTS" => this.ApiError(StatusCodes.Status409Conflict, "ALREADY_EXISTS", result.ErrorMessage ?? "Kayit zaten mevcut."),
            "INVALID_ATHLETE_TYPE" => this.ApiError(StatusCodes.Status400BadRequest, "INVALID_ATHLETE_TYPE", result.ErrorMessage ?? "Gecersiz athlete type."),
            "PACKAGE_ITEMS_REQUIRED" => this.ApiError(StatusCodes.Status400BadRequest, "PACKAGE_ITEMS_REQUIRED", result.ErrorMessage ?? "Paket urun listesi bos olamaz."),
            "DUPLICATE_PRODUCTS" => this.ApiError(StatusCodes.Status400BadRequest, "DUPLICATE_PRODUCTS", result.ErrorMessage ?? "Pakette tekrar eden urun var."),
            _ => this.ApiError(StatusCodes.Status400BadRequest, result.ErrorCode ?? "BAD_REQUEST", result.ErrorMessage ?? "Islem basarisiz.")
        };
    }
}
