using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SuppGain.Api.Common.Extensions;
using SuppGain.Application.Common.Models;
using SuppGain.Application.Features.Orders.Services;

namespace SuppGain.Api.Controllers;

[ApiController]
[Authorize]
[Route("orders")]
public class OrdersController : ControllerBase
{
    private readonly IOrderService _orderService;

    public OrdersController(IOrderService orderService)
    {
        _orderService = orderService;
    }

    [HttpPost]
    public async Task<IActionResult> Create(CancellationToken cancellationToken)
    {
        var userId = User.GetUserId();
        if (userId is null)
        {
            return Unauthorized();
        }

        var result = await _orderService.CreateAsync(userId.Value, cancellationToken);
        if (result.IsSuccess)
        {
            return CreatedAtAction(nameof(GetById), new { orderId = result.Value!.OrderId }, result.Value);
        }

        return ToActionResult(result);
    }

    [HttpGet("{orderId:guid}")]
    public async Task<IActionResult> GetById(Guid orderId, CancellationToken cancellationToken)
    {
        var userId = User.GetUserId();
        if (userId is null)
        {
            return Unauthorized();
        }

        var result = await _orderService.GetByIdAsync(orderId, userId.Value, User.IsAdmin(), cancellationToken);
        return ToActionResult(result);
    }

    [HttpGet("me")]
    public async Task<IActionResult> GetMyOrders(CancellationToken cancellationToken)
    {
        var userId = User.GetUserId();
        if (userId is null)
        {
            return Unauthorized();
        }

        var list = await _orderService.GetMyOrdersAsync(userId.Value, cancellationToken);
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
            "FORBIDDEN" => this.ApiError(StatusCodes.Status403Forbidden, "FORBIDDEN", result.ErrorMessage ?? "Bu islem icin yetkiniz yok."),
            "CART_EMPTY" => this.ApiError(StatusCodes.Status400BadRequest, "CART_EMPTY", result.ErrorMessage ?? "Sepet bos."),
            "PRODUCT_NOT_AVAILABLE" => this.ApiError(StatusCodes.Status400BadRequest, "PRODUCT_NOT_AVAILABLE", result.ErrorMessage ?? "Urun kullanilabilir degil."),
            "OUT_OF_STOCK" => this.ApiError(StatusCodes.Status400BadRequest, "OUT_OF_STOCK", result.ErrorMessage ?? "Yetersiz stok."),
            _ => this.ApiError(StatusCodes.Status400BadRequest, result.ErrorCode ?? "BAD_REQUEST", result.ErrorMessage ?? "Islem basarisiz.")
        };
    }
}
