namespace SuppGain.Application.Features.Products.Models;

public sealed class ProductListQuery
{
    public string? Name { get; init; }
    public string? Category { get; init; }
    public decimal? MinPrice { get; init; }
    public decimal? MaxPrice { get; init; }
    public bool? IsActive { get; init; }
}
