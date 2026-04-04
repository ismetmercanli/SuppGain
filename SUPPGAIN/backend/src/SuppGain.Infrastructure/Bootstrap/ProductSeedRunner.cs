using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using SuppGain.Application.Common.Interfaces;
using SuppGain.Domain.Entities;

namespace SuppGain.Infrastructure.Bootstrap;

public static class ProductSeedRunner
{
    public static async Task SeedAsync(IServiceProvider serviceProvider, CancellationToken cancellationToken = default)
    {
        using var scope = serviceProvider.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<IApplicationDbContext>();

        var seedItems = CreateSeedProducts();
        var existingProducts = await dbContext.Products.ToListAsync(cancellationToken);
        var existingByKey = existingProducts.ToDictionary(
            x => BuildKey(x.Name, x.Category),
            x => x);

        var insertedAny = false;
        var updatedAny = false;
        foreach (var item in seedItems)
        {
            var key = BuildKey(item.Name, item.Category);
            if (existingByKey.TryGetValue(key, out var existing))
            {
                existing.Description = item.Description;
                existing.ImageUrl = BuildImageUrl(item.Name, item.Category);
                existing.Price = item.Price;
                existing.Stock = item.Stock;
                existing.IsActive = true;
                existing.UpdatedAtUtc = DateTime.UtcNow;
                updatedAny = true;
            }
            else
            {
                dbContext.Products.Add(new Product
                {
                    Name = item.Name,
                    Category = item.Category,
                    Price = item.Price,
                    Stock = item.Stock,
                    Description = item.Description,
                    ImageUrl = BuildImageUrl(item.Name, item.Category),
                    IsActive = true
                });
                insertedAny = true;
            }
        }

        foreach (var product in existingProducts)
        {
            if (!NeedsImageNormalization(product))
            {
                continue;
            }

            product.ImageUrl = BuildImageUrl(product.Name, product.Category);
            product.UpdatedAtUtc = DateTime.UtcNow;
            updatedAny = true;
        }

        if (!insertedAny && !updatedAny)
        {
            return;
        }

        await dbContext.SaveChangesAsync(cancellationToken);
    }

    private static IReadOnlyList<SeedProduct> CreateSeedProducts()
    {
        return new List<SeedProduct>
        {
            NewProduct("Whey Protein Concentrate 900g", "Protein", 949.90m, 120, "Antrenman sonrasi toparlanmayi destekleyen whey protein konsantresi."),
            NewProduct("Whey Protein Isolate 1000g", "Protein", 1249.90m, 80, "Dusuk karbonhidrat ve yuksek protein oranina sahip isolate form."),
            NewProduct("Micellar Casein 900g", "Protein", 999.90m, 65, "Gece kullanimina uygun yavas sindirilen protein kaynagi."),
            NewProduct("Mass Gainer 3000g", "Protein", 1399.90m, 50, "Yuksek kalorili karbonhidrat ve protein karisimi."),
            NewProduct("Protein Bar Cocoa 12x60g", "Spor Gidalari", 549.90m, 140, "Gun ici pratik atistirmalik protein bar paketi."),
            NewProduct("Cream of Rice 2000g", "Spor Gidalari", 399.90m, 110, "Antrenman oncesi ve sonrasi hizli karbonhidrat kaynagi."),
            NewProduct("Creatine Monohydrate 300g", "Performans", 599.90m, 170, "Kas gucu ve performans artisi icin klasik kreatin."),
            NewProduct("Creatine Micronized 500g", "Performans", 899.90m, 90, "Mikronize formu sayesinde kolay karisim ozelligi."),
            NewProduct("Pre Workout Focus 420g", "Performans", 749.90m, 100, "Enerji ve odak artisi icin antrenman oncesi formul."),
            NewProduct("Pre Workout Stim Free 300g", "Performans", 689.90m, 70, "Kafeinsiz antrenman oncesi performans destegi."),
            NewProduct("BCAA 2:1:1 500g", "Amino Asit", 529.90m, 105, "L-Leucine, L-Isoleucine ve L-Valine icerir."),
            NewProduct("EAA Complex 450g", "Amino Asit", 629.90m, 92, "Esansiyel amino asit icerigi ile toparlanmaya destek."),
            NewProduct("L-Glutamine Powder 500g", "Amino Asit", 479.90m, 115, "Yogun antrenman doneminde kas toparlanmasina destek."),
            NewProduct("L-Carnitine 3000 1000ml", "Yag Yakimi", 459.90m, 95, "Aktif donemde enerji metabolizmasina destek icin."),
            NewProduct("Thermo Burn Complex 120 kapsul", "Yag Yakimi", 649.90m, 75, "Diyet doneminde termojenik destek formulasyonu."),
            NewProduct("Daily Vitamin Pack 30 sachet", "Vitamin", 699.90m, 60, "Gunluk temel vitamin ve mineral destegi."),
            NewProduct("Vitamin D3 K2 60 softgel", "Vitamin", 299.90m, 210, "Kemik ve bagisiklik sistemine yonelik destek urunu."),
            NewProduct("Vitamin C 1000mg 120 tablet", "Vitamin", 249.90m, 190, "Gunluk antioksidan destek icin C vitamini takviyesi."),
            NewProduct("Magnesium Bisglycinate 90 tablet", "Mineral", 329.90m, 125, "Kas fonksiyonlari ve rahatlama icin magnezyum destegi."),
            NewProduct("ZMA Night Formula 90 kapsul", "Mineral", 379.90m, 88, "Gece kullanimina uygun cinko, magnezyum ve B6 kombinasyonu."),
            NewProduct("Omega 3 1000mg 200 softgel", "Saglik", 419.90m, 150, "EPA ve DHA iceren balik yagi destegi."),
            NewProduct("Collagen Peptides 300g", "Saglik", 589.90m, 90, "Cilt, eklem ve bag dokusu destegi icin kolajen."),
            NewProduct("Hydration Electrolyte 30 serving", "Spor Gidalari", 459.90m, 112, "Terleme ile kaybedilen elektrolitleri destekler."),
            NewProduct("Greens Superfood 30 serving", "Saglik", 639.90m, 73, "Bitkisel iceriklerden olusan gunluk yesil karisim."),
            NewProduct("Joint Support Glucosamine 120 tablet", "Saglik", 549.90m, 54, "Eklem konforunu destekleyen glukozamin kompleks urunu.")
        };
    }

    private static SeedProduct NewProduct(
        string name,
        string category,
        decimal price,
        int stock,
        string description)
    {
        return new SeedProduct(name, category, price, stock, description);
    }

    private static string BuildKey(string name, string category)
    {
        return (name + "|" + category).ToLowerInvariant();
    }

    private static string BuildImageUrl(string name, string category)
    {
        var label = Uri.EscapeDataString($"{category} - {name}");
        return $"https://placehold.co/900x600/png?text={label}";
    }

    private static bool NeedsImageNormalization(Product product)
    {
        if (string.IsNullOrWhiteSpace(product.ImageUrl))
        {
            return true;
        }

        if (!Uri.TryCreate(product.ImageUrl, UriKind.Absolute, out var uri))
        {
            return true;
        }

        if (uri.Scheme != Uri.UriSchemeHttp && uri.Scheme != Uri.UriSchemeHttps)
        {
            return true;
        }

        var host = uri.Host.ToLowerInvariant();
        if (host == "placehold.co")
        {
            return false;
        }

        // Replace unknown/broken/stock-image URLs with deterministic product labels.
        return true;
    }

    private sealed record SeedProduct(
        string Name,
        string Category,
        decimal Price,
        int Stock,
        string Description);
}
