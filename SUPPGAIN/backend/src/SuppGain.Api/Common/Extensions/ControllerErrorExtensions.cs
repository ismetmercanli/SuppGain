using Microsoft.AspNetCore.Mvc;
using SuppGain.Api.Common.Models;

namespace SuppGain.Api.Common.Extensions;

public static class ControllerErrorExtensions
{
    public static IActionResult ApiError(this ControllerBase controller, int statusCode, string errorCode, string message)
    {
        return controller.StatusCode(statusCode, new ApiErrorResponse
        {
            ErrorCode = errorCode,
            Message = message,
            TraceId = controller.HttpContext.TraceIdentifier
        });
    }
}
