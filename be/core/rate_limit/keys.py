import re


def normalize_email(value: str) -> str:
    return value.strip().lower()


def normalize_identifier(value: str) -> str:
    return re.sub(r"\s+", "", value.strip().lower())


def global_ip_key(ip: str) -> str:
    return f"rl:global:ip:{ip}"


def login_ip_key(ip: str) -> str:
    return f"rl:login:ip:{ip}"


def login_identifier_key(identifier: str) -> str:
    return f"rl:login:identifier:{normalize_identifier(identifier)}"


def register_ip_key(ip: str) -> str:
    return f"rl:register:ip:{ip}"


def register_email_key(email: str) -> str:
    return f"rl:register:email:{normalize_email(email)}"


def forgot_request_ip_key(ip: str) -> str:
    return f"rl:forgot_request:ip:{ip}"


def forgot_request_email_key(email: str) -> str:
    return f"rl:forgot_request:email:{normalize_email(email)}"


def forgot_request_cooldown_key(email: str) -> str:
    return f"rl:forgot_request:cooldown:{normalize_email(email)}"


def forgot_verify_ip_key(ip: str) -> str:
    return f"rl:forgot_verify:ip:{ip}"


def forgot_verify_email_key(email: str) -> str:
    return f"rl:forgot_verify:email:{normalize_email(email)}"


def forgot_verify_attempt_key(email: str, token: str) -> str:
    return f"rl:forgot_verify:attempt:{normalize_email(email)}:{token}"


def forgot_reset_email_key(email: str) -> str:
    return f"rl:forgot_reset:email:{normalize_email(email)}"


def refresh_ip_key(ip: str) -> str:
    return f"rl:refresh:ip:{ip}"
