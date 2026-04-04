using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SuppGain.Api.Common.Extensions;
using SuppGain.Application.Common.Models;
using SuppGain.Application.Features.Cart.Models;
using SuppGain.Application.Features.Cart.Services;

namespace SuppGain.Api.Controllers;

[ApiController]
[Authorize]
[Route("cart")]
public class CartController : ControllerBase
{
    private readonly ICartService _cartService;

    public CartController(ICartService cartService)
    {
        _cartService = cartService;
    }

    [HttpPost]
    public async Task<IActionResult> AddItem([FromBody] AddToCartRequest request, CancellationToken cancellationToken)
    {
        var userId = User.GetUserId();
        if (userId is null)
        {
            return Unauthorized();
        }

        var result = await _cartService.AddItemAsync(userId.Value, request, cancellationToken);
        return ToActionResult(result);
    }

    [HttpGet]
    public async Task<IActionResult> GetMyCart(CancellationToken cancellationToken)
    {
        var userId = User.GetUserId();
        if (userId is null)
        {
            return Unauthorized();
        }

        var result = await _cartService.GetMyCartAsync(userId.Value, cancellationToken);
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
            "PRODUCT_NOT_FOUND" => this.ApiError(StatusCodes.Status404NotFound, "PRODUCT_NOT_FOUND", result.ErrorMessage ?? "Urun bulunamadi."),
            "OUT_OF_STOCK" => this.ApiError(StatusCodes.Status400BadRequest, "OUT_OF_STOCK", result.ErrorMessage ?? "Yetersiz stok."),
            _ => this.ApiError(StatusCodes.Status400BadRequest, result.ErrorCode ?? "BAD_REQUEST", result.ErrorMessage ?? "Islem basarisiz.")
        };
    }
}
