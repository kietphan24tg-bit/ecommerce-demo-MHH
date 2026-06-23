import smtplib
from email.message import EmailMessage

from core.config import get_settings
from core.exceptions import BadRequestException

settings = get_settings()


def _build_password_reset_email(*, to_email: str, code: str) -> EmailMessage:
    message = EmailMessage()
    message["Subject"] = "Password reset code"
    message["From"] = f"{settings.mail_from_name} <{settings.mail_from}>"
    message["To"] = to_email
    message.set_content(
        "\n".join(
            [
                f"Your password reset code is: {code}",
                "",
                (
                    "This code will expire in "
                    f"{settings.password_reset_code_expires_in} minutes."
                ),
                "If you did not request this, please ignore this email.",
            ]
        )
    )
    return message


def _validate_smtp_settings() -> None:
    if not settings.smtp_host:
        raise BadRequestException(message="SMTP host is not configured")
    if not settings.smtp_username:
        raise BadRequestException(message="SMTP username is not configured")
    if not settings.smtp_password:
        raise BadRequestException(message="SMTP password is not configured")
    if settings.smtp_use_tls and settings.smtp_use_ssl:
        raise BadRequestException(
            message="SMTP TLS and SSL cannot be enabled at the same time",
        )


def send_password_reset_email(*, to_email: str, code: str) -> None:
    if not settings.mail_enabled:
        return

    _validate_smtp_settings()
    message = _build_password_reset_email(to_email=to_email, code=code)

    smtp_cls = smtplib.SMTP_SSL if settings.smtp_use_ssl else smtplib.SMTP

    try:
        with smtp_cls(
            settings.smtp_host,
            settings.smtp_port,
            timeout=settings.smtp_timeout_seconds,
        ) as server:
            if settings.smtp_use_tls and not settings.smtp_use_ssl:
                server.starttls()
            server.login(settings.smtp_username, settings.smtp_password)
            server.send_message(message)
    except smtplib.SMTPException as exc:
        raise BadRequestException(
            message="Failed to send password reset email",
        ) from exc
