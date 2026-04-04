using System.ComponentModel.DataAnnotations;

namespace SuppGain.Application.Features.Cart.Models;

public sealed class AddToCartRequest
{
    [Required]
    public Guid ProductId { get; init; }

    [Range(1, 999)]
    public int Quantity { get; init; }
}
