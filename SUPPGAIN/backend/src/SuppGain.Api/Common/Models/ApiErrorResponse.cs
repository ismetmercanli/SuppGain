namespace SuppGain.Api.Common.Models;

public sealed class ApiErrorResponse
{
    public string ErrorCode { get; init; } = "UNKNOWN_ERROR";
    public string Message { get; init; } = "Beklenmeyen bir hata olustu.";
    public string TraceId { get; init; } = string.Empty;
}
