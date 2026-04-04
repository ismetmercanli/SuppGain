using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SuppGain.Api.Common.Extensions;
using SuppGain.Application.Common.Models;
using SuppGain.Application.Features.Products.Models;
using SuppGain.Application.Features.Products.Services;

namespace SuppGain.Api.Controllers;

[ApiController]
[Route("products")]
public class ProductsController : ControllerBase
{
    private readonly IProductService _productService;

    public ProductsController(IProductService productService)
    {
        _productService = productService;
    }

    [AllowAnonymous]
    [HttpGet]
    public async Task<IActionResult> GetList([FromQuery] ProductListQuery query, CancellationToken cancellationToken)
    {
        var list = await _productService.GetListAsync(query, cancellationToken);
        return Ok(list);
    }

    [AllowAnonymous]
    [HttpGet("{productId:guid}")]
    public async Task<IActionResult> GetById(Guid productId, CancellationToken cancellationToken)
    {
        var result = await _productService.GetByIdAsync(productId, cancellationToken);
        return ToActionResult(result);
    }

    [Authorize]
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateProductRequest request, CancellationToken cancellationToken)
    {
        var forbidden = EnsureAdmin();
        if (forbidden is not null)
        {
            return forbidden;
        }

        var result = await _productService.CreateAsync(request, cancellationToken);
        if (result.IsSuccess)
        {
            return CreatedAtAction(nameof(GetById), new { productId = result.Value!.Id }, result.Value);
        }

        return ToActionResult(result);
    }

    [Authorize]
    [HttpPut("{productId:guid}")]
    public async Task<IActionResult> Update(Guid productId, [FromBody] UpdateProductRequest request, CancellationToken cancellationToken)
    {
        var forbidden = EnsureAdmin();
        if (forbidden is not null)
        {
            return forbidden;
        }

        var result = await _productService.UpdateAsync(productId, request, cancellationToken);
        return ToActionResult(result);
    }

    [Authorize]
    [HttpDelete("{productId:guid}")]
    public async Task<IActionResult> Delete(Guid productId, CancellationToken cancellationToken)
    {
        var forbidden = EnsureAdmin();
        if (forbidden is not null)
        {
            return forbidden;
        }

        var result = await _productService.DeleteAsync(productId, cancellationToken);
        if (result.IsSuccess)
        {
            return NoContent();
        }

        return ToActionResult(result);
    }

    private IActionResult? EnsureAdmin()
    {
        if (!User.IsAdmin())
        {
            return this.ApiError(
                StatusCodes.Status403Forbidden,
                "FORBIDDEN",
                "Bu islem sadece admin rolundeki kullanicilar icin izinlidir.");
        }

        return null;
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
