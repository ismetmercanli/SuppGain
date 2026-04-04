using System.ComponentModel.DataAnnotations;

namespace SuppGain.Application.Features.Products.Models;

public sealed class CreateProductRequest
{
    [Required]
    [MaxLength(150)]
    public string Name { get; init; } = string.Empty;

    [Required]
    [MaxLength(2000)]
    public string Description { get; init; } = string.Empty;

    [MaxLength(500)]
    [Url]
    public string? ImageUrl { get; init; }

    [Range(0.01, 999999)]
    public decimal Price { get; init; }

    [Range(0, int.MaxValue)]
    public int Stock { get; init; }

    [Required]
    [MaxLength(100)]
    public string Category { get; init; } = string.Empty;

    public bool IsActive { get; init; } = true;
}
