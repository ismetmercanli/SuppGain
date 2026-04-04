using SuppGain.Domain.Common;

namespace SuppGain.Domain.Entities;

public class WeeklyProgram : BaseEntity
{
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;
    public string Title { get; set; } = string.Empty;
    public string ContentJson { get; set; } = "{}";
}
