using CatalogService.Application.Exceptions;

namespace CatalogService.API.Middleware
{
    public class ExceptionMiddleware
    {
        private readonly ILogger<ExceptionMiddleware> _logger;
        private readonly RequestDelegate _next;

        public  ExceptionMiddleware(ILogger<ExceptionMiddleware> logger, RequestDelegate next)
        {
            _logger = logger;
            _next = next;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                await _next(context);
            }
            catch(Exception e)
            {
                await HandleExceptionAsync(context, e);
            }
        }

        private async Task HandleExceptionAsync(HttpContext context, Exception e)
        {
            context.Response.ContentType = "application/json";
            var path = context.Request.Path;

            switch (e)
            {
                case NotFoundException notFound:
                    _logger.LogInformation($"Resource not found at {path}: {notFound.Message}");
                    context.Response.StatusCode = StatusCodes.Status404NotFound;
                    await context.Response.WriteAsJsonAsync(new { error = notFound.Message });
                    break;
                case UnauthorizedException unauthorized:
                    _logger.LogInformation($"Unauthorized access attempt at {path}: {unauthorized.Message}");
                    context.Response.StatusCode = StatusCodes.Status401Unauthorized;
                    await context.Response.WriteAsJsonAsync(new { error = unauthorized.Message });
                    break;
                case ForbiddenException forbidden:
                    _logger.LogWarning("Forbidden access attempt at {Path}: {Message}", path, forbidden.Message);
                    context.Response.StatusCode = StatusCodes.Status403Forbidden;
                    await context.Response.WriteAsJsonAsync(new { error = forbidden.Message });
                    break;

                case BadRequestException badRequest:
                    _logger.LogInformation("Bad request at {Path}: {Message}", path, badRequest.Message);
                    context.Response.StatusCode = StatusCodes.Status400BadRequest;
                    await context.Response.WriteAsJsonAsync(new { error = badRequest.Message });
                    break;

                case ConflictException conflict:
                    _logger.LogWarning("Conflict at {Path}: {Message}", path, conflict.Message);
                    context.Response.StatusCode = StatusCodes.Status409Conflict;
                    await context.Response.WriteAsJsonAsync(new { error = conflict.Message });
                    break;

                default:
                    _logger.LogError(e, "Unhandled exception at {Path}", path);
                    context.Response.StatusCode = StatusCodes.Status500InternalServerError;
                    await context.Response.WriteAsJsonAsync(new { error = "An unexpected error occurred. Please try again later." });
                    break;
            }
        }

    }
}
