from core.errors import ErrorCode


class AppException(Exception):
    def __init__(
        self,
        *,
        status_code: int,
        code: ErrorCode,
        message: str,
        details: dict | list | str | None = None,
    ) -> None:
        super().__init__(message)
        self.status_code = status_code
        self.code = code
        self.message = message
        self.details = details




class BadRequestException(AppException):
    def __init__(
        self,
        message: str = "Bad request",
        *,
        code: ErrorCode = ErrorCode.BAD_REQUEST,
        details: dict | list | str | None = None,
    ) -> None:
        super().__init__(
            status_code=400,
            code=code,
            message=message,
            details=details,
        )


class UnauthorizedException(AppException):
    def __init__(
        self,
        message: str = "Unauthorized",
        *,
        code: ErrorCode = ErrorCode.UNAUTHORIZED,
        details: dict | list | str | None = None,
    ) -> None:
        super().__init__(
            status_code=401,
            code=code,
            message=message,
            details=details,
        )


class ForbiddenException(AppException):
    def __init__(
        self,
        message: str = "Forbidden",
        *,
        code: ErrorCode = ErrorCode.FORBIDDEN,
        details: dict | list | str | None = None,
    ) -> None:
        super().__init__(
            status_code=403,
            code=code,
            message=message,
            details=details,
        )


class NotFoundException(AppException):
    def __init__(
        self,
        message: str = "Resource not found",
        *,
        code: ErrorCode = ErrorCode.NOT_FOUND,
        details: dict | list | str | None = None,
    ) -> None:
        super().__init__(
            status_code=404,
            code=code,
            message=message,
            details=details,
        )


class ConflictException(AppException):
    def __init__(
        self,
        message: str = "Resource conflict",
        *,
        code: ErrorCode = ErrorCode.CONFLICT,
        details: dict | list | str | None = None,
    ) -> None:
        super().__init__(
            status_code=409,
            code=code,
            message=message,
            details=details,
        )


class InvalidCredentialsException(UnauthorizedException):
    def __init__(
        self,
        message: str = "Invalid credentials",
        *,
        details: dict | list | str | None = None,
    ) -> None:
        super().__init__(
            message=message,
            code=ErrorCode.AUTH_INVALID_CREDENTIALS,
            details=details,
        )


class EmailAlreadyExistsException(ConflictException):
    def __init__(
        self,
        message: str = "Email already exists",
        *,
        details: dict | list | str | None = None,
    ) -> None:
        super().__init__(
            message=message,
            code=ErrorCode.AUTH_EMAIL_ALREADY_EXISTS,
            details=details,
        )


