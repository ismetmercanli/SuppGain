using System.Globalization;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using SuppGain.Application.Common.Interfaces;
using SuppGain.Application.Common.Models;
using SuppGain.Application.Features.SupplementTracking.Models;
using SuppGain.Application.Features.SupplementTracking.Services;
using SuppGain.Domain.Entities;

namespace SuppGain.Infrastructure.Services;

public class SupplementTrackingService : ISupplementTrackingService
{
    private readonly IApplicationDbContext _dbContext;

    public SupplementTrackingService(IApplicationDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<OperationResult<SupplementTrackerResponse>> CreateAsync(
        Guid userId,
        CreateSupplementTrackerRequest request,
        CancellationToken cancellationToken)
    {
        var product = await _dbContext.Products.FirstOrDefaultAsync(
            x => x.Id == request.ProductId,
            cancellationToken);

        if (product is null || !product.IsActive)
        {
            return OperationResult<SupplementTrackerResponse>.Failure("PRODUCT_NOT_FOUND", "Urun bulunamadi.");
        }

        var tracker = new SupplementTracker
        {
            UserId = userId,
            ProductId = request.ProductId,
            DailyDosage = request.DailyDosage,
            TimesPerDay = request.TimesPerDay,
            TimesOfDayJson = string.IsNullOrWhiteSpace(request.TimesOfDayJson) ? "[]" : request.TimesOfDayJson.Trim(),
            CurrentStock = request.CurrentStock,
            LowStockThreshold = request.LowStockThreshold,
            StartDateUtc = request.StartDateUtc == default ? DateTime.UtcNow : request.StartDateUtc,
            EndDateUtc = request.EndDateUtc,
            IsActive = true
        };

        _dbContext.SupplementTrackers.Add(tracker);
        await _dbContext.SaveChangesAsync(cancellationToken);

        return OperationResult<SupplementTrackerResponse>.Success(Map(tracker, product.Name));
    }

    public async Task<IReadOnlyList<SupplementTrackerResponse>> GetMyTrackersAsync(Guid userId, CancellationToken cancellationToken)
    {
        return await _dbContext.SupplementTrackers
            .Where(x => x.UserId == userId)
            .Include(x => x.Product)
            .OrderByDescending(x => x.CreatedAtUtc)
            .Select(x => Map(x, x.Product.Name))
            .ToListAsync(cancellationToken);
    }

    public async Task<OperationResult<SupplementTrackerResponse>> UpdateAsync(
        Guid trackerId,
        Guid userId,
        UpdateSupplementTrackerRequest request,
        CancellationToken cancellationToken)
    {
        var tracker = await _dbContext.SupplementTrackers
            .Include(x => x.Product)
            .FirstOrDefaultAsync(x => x.Id == trackerId, cancellationToken);

        if (tracker is null)
        {
            return OperationResult<SupplementTrackerResponse>.Failure("NOT_FOUND", "Takip kaydi bulunamadi.");
        }

        if (tracker.UserId != userId)
        {
            return OperationResult<SupplementTrackerResponse>.Failure("FORBIDDEN", "Bu kaydi guncelleme yetkiniz yok.");
        }

        tracker.DailyDosage = request.DailyDosage;
        tracker.TimesPerDay = request.TimesPerDay;
        tracker.TimesOfDayJson = string.IsNullOrWhiteSpace(request.TimesOfDayJson) ? "[]" : request.TimesOfDayJson.Trim();
        tracker.CurrentStock = request.CurrentStock;
        tracker.LowStockThreshold = request.LowStockThreshold;
        tracker.StartDateUtc = request.StartDateUtc;
        tracker.EndDateUtc = request.EndDateUtc;
        tracker.IsActive = request.IsActive;
        tracker.UpdatedAtUtc = DateTime.UtcNow;

        await _dbContext.SaveChangesAsync(cancellationToken);

        return OperationResult<SupplementTrackerResponse>.Success(Map(tracker, tracker.Product.Name));
    }

    public async Task<OperationResult<bool>> DeleteAsync(Guid trackerId, Guid userId, CancellationToken cancellationToken)
    {
        var tracker = await _dbContext.SupplementTrackers.FirstOrDefaultAsync(x => x.Id == trackerId, cancellationToken);
        if (tracker is null)
        {
            return OperationResult<bool>.Failure("NOT_FOUND", "Takip kaydi bulunamadi.");
        }

        if (tracker.UserId != userId)
        {
            return OperationResult<bool>.Failure("FORBIDDEN", "Bu kaydi silme yetkiniz yok.");
        }

        _dbContext.SupplementTrackers.Remove(tracker);
        await _dbContext.SaveChangesAsync(cancellationToken);

        return OperationResult<bool>.Success(true);
    }

    public async Task<OperationResult<SupplementTrackerResponse>> ConsumeAsync(
        Guid trackerId,
        Guid userId,
        ConsumeSupplementRequest request,
        CancellationToken cancellationToken)
    {
        var tracker = await _dbContext.SupplementTrackers
            .Include(x => x.Product)
            .FirstOrDefaultAsync(x => x.Id == trackerId, cancellationToken);

        if (tracker is null)
        {
            return OperationResult<SupplementTrackerResponse>.Failure("NOT_FOUND", "Takip kaydi bulunamadi.");
        }

        if (tracker.UserId != userId)
        {
            return OperationResult<SupplementTrackerResponse>.Failure("FORBIDDEN", "Bu kayda erisim yetkiniz yok.");
        }

        if (!tracker.IsActive)
        {
            return OperationResult<SupplementTrackerResponse>.Failure("INACTIVE_TRACKER", "Takip kaydi pasif.");
        }

        if (tracker.CurrentStock < request.ConsumedAmount)
        {
            return OperationResult<SupplementTrackerResponse>.Failure("OUT_OF_STOCK", "Yeterli stok bulunamadi.");
        }

        tracker.CurrentStock -= request.ConsumedAmount;
        tracker.LastConsumedAtUtc = DateTime.UtcNow;
        tracker.UpdatedAtUtc = DateTime.UtcNow;

        _dbContext.SupplementConsumptionLogs.Add(new SupplementConsumptionLog
        {
            TrackerId = tracker.Id,
            ConsumedAmount = request.ConsumedAmount,
            ConsumedAtUtc = tracker.LastConsumedAtUtc.Value,
            Note = request.Note?.Trim() ?? string.Empty
        });

        await _dbContext.SaveChangesAsync(cancellationToken);

        return OperationResult<SupplementTrackerResponse>.Success(Map(tracker, tracker.Product.Name));
    }

    public async Task<OperationResult<StockStatusResponse>> GetStockStatusAsync(
        Guid trackerId,
        Guid userId,
        CancellationToken cancellationToken)
    {
        var tracker = await _dbContext.SupplementTrackers
            .Include(x => x.Product)
            .FirstOrDefaultAsync(x => x.Id == trackerId, cancellationToken);

        if (tracker is null)
        {
            return OperationResult<StockStatusResponse>.Failure("NOT_FOUND", "Takip kaydi bulunamadi.");
        }

        if (tracker.UserId != userId)
        {
            return OperationResult<StockStatusResponse>.Failure("FORBIDDEN", "Bu kayda erisim yetkiniz yok.");
        }

        var dailyConsumption = tracker.DailyDosage * tracker.TimesPerDay;
        decimal? daysRemaining = null;
        DateTime? estimatedOutOfStockUtc = null;

        if (dailyConsumption > 0)
        {
            daysRemaining = Math.Round(tracker.CurrentStock / dailyConsumption, 2, MidpointRounding.AwayFromZero);
            estimatedOutOfStockUtc = DateTime.UtcNow.AddDays((double)daysRemaining.Value);
        }

        return OperationResult<StockStatusResponse>.Success(new StockStatusResponse
        {
            TrackerId = tracker.Id,
            ProductId = tracker.ProductId,
            ProductName = tracker.Product.Name,
            CurrentStock = tracker.CurrentStock,
            LowStockThreshold = tracker.LowStockThreshold,
            IsLowStock = tracker.CurrentStock <= tracker.LowStockThreshold,
            DailyConsumption = dailyConsumption,
            DaysRemaining = daysRemaining,
            EstimatedOutOfStockUtc = estimatedOutOfStockUtc,
            LastConsumedAtUtc = tracker.LastConsumedAtUtc
        });
    }

    public async Task<SupplementDashboardResponse> GetDashboardAsync(
        Guid userId,
        DateOnly? localDate,
        CancellationToken cancellationToken)
    {
        var tz = ResolveTurkeyTimeZone();
        var day = localDate ?? DateOnly.FromDateTime(TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, tz));
        var (dayStartUtc, dayEndUtc) = GetTurkeyDayRangeUtc(day, tz);
        var nowLocal = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, tz);

        var trackers = await _dbContext.SupplementTrackers
            .AsNoTracking()
            .Include(x => x.Product)
            .Where(x => x.UserId == userId && x.IsActive)
            .Where(x => x.StartDateUtc < dayEndUtc && (!x.EndDateUtc.HasValue || x.EndDateUtc >= dayStartUtc))
            .OrderBy(x => x.Product.Name)
            .ToListAsync(cancellationToken);

        var trackerIds = trackers.Select(x => x.Id).ToList();
        var logs = await _dbContext.SupplementConsumptionLogs
            .AsNoTracking()
            .Where(x => trackerIds.Contains(x.TrackerId))
            .Where(x => x.ConsumedAtUtc >= dayStartUtc && x.ConsumedAtUtc < dayEndUtc)
            .OrderBy(x => x.ConsumedAtUtc)
            .ToListAsync(cancellationToken);

        var logsByTracker = logs.GroupBy(x => x.TrackerId).ToDictionary(g => g.Key, g => g.ToList());

        var intakeRows = new List<DashboardIntakeRowResponse>();
        var totalSlots = 0;
        var completedSlots = 0;
        SupplementConsumptionLog? lastLogOverall = null;

        foreach (var tracker in trackers)
        {
            var slots = BuildSlotsForTracker(tracker.TimesOfDayJson, tracker.TimesPerDay);
            var trackerLogs = logsByTracker.TryGetValue(tracker.Id, out var list)
                ? list.OrderBy(x => x.ConsumedAtUtc).ToList()
                : new List<SupplementConsumptionLog>();

            var doseAmount = slots.Count <= 0
                ? tracker.DailyDosage
                : Math.Round(tracker.DailyDosage / slots.Count, 4, MidpointRounding.AwayFromZero);

            for (var i = 0; i < slots.Count; i++)
            {
                var (timeLocal, hint) = slots[i];
                var isCompleted = i < trackerLogs.Count;
                var loggedAt = isCompleted ? trackerLogs[i].ConsumedAtUtc : (DateTime?)null;

                if (isCompleted)
                {
                    completedSlots++;
                    var lg = trackerLogs[i];
                    if (lastLogOverall is null || lg.ConsumedAtUtc > lastLogOverall.ConsumedAtUtc)
                    {
                        lastLogOverall = lg;
                    }
                }

                totalSlots++;

                var plannedLocal = day.ToDateTime(TimeOnly.FromTimeSpan(timeLocal));
                string status;
                if (isCompleted)
                {
                    status = "completed";
                }
                else if (plannedLocal <= nowLocal)
                {
                    status = "due";
                }
                else
                {
                    status = "upcoming";
                }

                intakeRows.Add(new DashboardIntakeRowResponse
                {
                    RowId = $"{tracker.Id:N}-{i}",
                    TrackerId = tracker.Id,
                    SlotIndex = i,
                    ProductId = tracker.ProductId,
                    ProductName = tracker.Product.Name,
                    PlannedTimeLocal = TimeOnly.FromTimeSpan(timeLocal).ToString("HH:mm", CultureInfo.InvariantCulture),
                    ContextHint = hint,
                    DoseAmount = doseAmount,
                    IsCompleted = isCompleted,
                    LoggedAtUtc = loggedAt,
                    Status = status
                });
            }
        }

        intakeRows.Sort((a, b) =>
        {
            var ta = TimeOnly.Parse(a.PlannedTimeLocal, CultureInfo.InvariantCulture);
            var tb = TimeOnly.Parse(b.PlannedTimeLocal, CultureInfo.InvariantCulture);
            var c = ta.CompareTo(tb);
            return c != 0 ? c : string.Compare(a.ProductName, b.ProductName, StringComparison.Ordinal);
        });

        var compliancePercent = totalSlots == 0
            ? 100
            : (int)Math.Round(100.0 * completedSlots / totalSlots, MidpointRounding.AwayFromZero);

        string? lastProductName = null;
        if (lastLogOverall is not null)
        {
            var tr = trackers.FirstOrDefault(x => x.Id == lastLogOverall.TrackerId);
            lastProductName = tr?.Product.Name;
        }

        var stockAlerts = trackers
            .Where(x => x.CurrentStock <= x.LowStockThreshold * 2)
            .Select(x => new DashboardStockAlertResponse
            {
                TrackerId = x.Id,
                ProductId = x.ProductId,
                ProductName = x.Product.Name,
                CurrentStock = x.CurrentStock,
                LowStockThreshold = x.LowStockThreshold,
                Severity = x.CurrentStock <= x.LowStockThreshold ? "urgent" : "warning"
            })
            .OrderBy(x => x.CurrentStock)
            .ToList();

        return new SupplementDashboardResponse
        {
            LocalDate = day.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture),
            TotalScheduledDoses = totalSlots,
            CompletedDoses = completedSlots,
            CompliancePercent = compliancePercent,
            LastCompletedProductName = lastProductName,
            LastCompletedAtUtc = lastLogOverall?.ConsumedAtUtc,
            Intakes = intakeRows,
            StockAlerts = stockAlerts
        };
    }

    private sealed class TimeOfDaySlotJson
    {
        public string? Time { get; set; }
        public string? Hint { get; set; }
    }

    private static List<(TimeSpan Time, string Hint)> TryParseTimesJson(string json)
    {
        var result = new List<(TimeSpan Time, string Hint)>();
        try
        {
            var raw = JsonSerializer.Deserialize<List<TimeOfDaySlotJson>>(json, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });
            if (raw is null)
            {
                return result;
            }

            foreach (var item in raw)
            {
                if (string.IsNullOrWhiteSpace(item.Time))
                {
                    continue;
                }

                if (!TimeSpan.TryParse(item.Time.Trim(), CultureInfo.InvariantCulture, out var ts))
                {
                    continue;
                }

                if (ts.TotalHours >= 24)
                {
                    continue;
                }

                result.Add((ts, item.Hint?.Trim() ?? string.Empty));
            }
        }
        catch (JsonException)
        {
        }

        return result;
    }

    private static IReadOnlyList<(TimeSpan Time, string Hint)> BuildSlotsForTracker(string json, int timesPerDay)
    {
        var n = Math.Clamp(timesPerDay < 1 ? 1 : timesPerDay, 1, 12);
        var parsed = TryParseTimesJson(json).OrderBy(x => x.Time).ToList();
        if (parsed.Count == n)
        {
            return parsed;
        }

        return GenerateEvenlySpacedSlots(n);
    }

    private static IReadOnlyList<(TimeSpan Time, string Hint)> GenerateEvenlySpacedSlots(int n)
    {
        var list = new List<(TimeSpan Time, string Hint)>();
        if (n <= 0)
        {
            return list;
        }

        if (n == 1)
        {
            list.Add((new TimeSpan(9, 0, 0), string.Empty));
            return list;
        }

        const int startMin = 8 * 60;
        const int endMin = 22 * 60;
        for (var i = 0; i < n; i++)
        {
            var minutes = startMin + (int)Math.Round((endMin - startMin) * (double)i / (n - 1));
            list.Add((TimeSpan.FromMinutes(minutes), string.Empty));
        }

        return list;
    }

    private static TimeZoneInfo ResolveTurkeyTimeZone()
    {
        foreach (var id in new[] { "Turkey Standard Time", "Europe/Istanbul" })
        {
            try
            {
                return TimeZoneInfo.FindSystemTimeZoneById(id);
            }
            catch (TimeZoneNotFoundException)
            {
            }
            catch (InvalidTimeZoneException)
            {
            }
        }

        return TimeZoneInfo.Utc;
    }

    private static (DateTime startUtc, DateTime endUtc) GetTurkeyDayRangeUtc(DateOnly localDate, TimeZoneInfo tz)
    {
        var localStart = DateTime.SpecifyKind(localDate.ToDateTime(TimeOnly.MinValue), DateTimeKind.Unspecified);
        var startUtc = TimeZoneInfo.ConvertTimeToUtc(localStart, tz);
        return (startUtc, startUtc.AddDays(1));
    }

    private static SupplementTrackerResponse Map(SupplementTracker tracker, string productName)
    {
        return new SupplementTrackerResponse
        {
            TrackerId = tracker.Id,
            UserId = tracker.UserId,
            ProductId = tracker.ProductId,
            ProductName = productName,
            DailyDosage = tracker.DailyDosage,
            TimesPerDay = tracker.TimesPerDay,
            TimesOfDayJson = tracker.TimesOfDayJson,
            CurrentStock = tracker.CurrentStock,
            LowStockThreshold = tracker.LowStockThreshold,
            StartDateUtc = tracker.StartDateUtc,
            EndDateUtc = tracker.EndDateUtc,
            IsActive = tracker.IsActive,
            LastConsumedAtUtc = tracker.LastConsumedAtUtc,
            CreatedAtUtc = tracker.CreatedAtUtc,
            UpdatedAtUtc = tracker.UpdatedAtUtc
        };
    }
}
