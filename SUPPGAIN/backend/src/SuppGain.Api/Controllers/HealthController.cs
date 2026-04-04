using Microsoft.AspNetCore.Mvc;

namespace SuppGain.Api.Controllers;

[ApiController]
[Route("health")]
public class HealthController : ControllerBase
{
    [HttpGet]
    public IActionResult Get()
    {
        return Ok(new
        {
            status = "ok",
            service = "SuppGain.Api",
            utcNow = DateTime.UtcNow
        });
    }
}
