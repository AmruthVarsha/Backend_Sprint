namespace CatalogService.Application.Exceptions
{
    /// <summary>Thrown when a requested resource does not exist.</summary>
    public class NotFoundException : Exception
    {
        public NotFoundException(string message) : base(message) { }
        public NotFoundException(string entity, Guid id)
            : base($"{entity} with id '{id}' was not found.") { }
    }

    /// <summary>Thrown when a create/update would violate a uniqueness constraint.</summary>
    public class ConflictException : Exception
    {
        public ConflictException(string message) : base(message) { }
    }

    /// <summary>Thrown when incoming request data fails business-rule validation.</summary>
    public class BadRequestException : Exception
    {
        public BadRequestException(string message) : base(message) { }
    }

    /// <summary>Thrown when the caller does not own the resource they are trying to modify.</summary>
    public class ForbiddenException : Exception
    {
        public ForbiddenException(string message) : base(message) { }
    }

    /// <summary>Thrown when the caller is not authenticated.</summary>
    public class UnauthorizedException : Exception
    {
        public UnauthorizedException(string message) : base(message) { }
    }
}
