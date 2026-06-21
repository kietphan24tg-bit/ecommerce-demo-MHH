from datetime import datetime, UTC

from sqlalchemy.orm import Session

from modules.auth.security import create_refresh_token
from modules.users.model import User
from modules.auth.models.session import Session as UserSession

def get_user_by_email(db: Session, email: str) -> User | None:
    return db.query(User).filter(User.email == email).first()

def get_user_by_phone(db: Session, phone: str) -> User | None:
    return db.query(User).filter(User.phone == phone).first()

def get_user_by_id(db: Session, user_id: int) -> User | None:
    return db.query(User).filter(User.id == user_id).first()

def create_user(
    db: Session,
    *,
    full_name: str,
    email: str,
    phone: str,
    password_hash: str,
    role: str = User.DEFAULT_ROLE,
) -> User:
    user = User(
        full_name=full_name,
        email=email,
        phone=phone,
        role=role,
        password_hash=password_hash,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

def create_session(
    db: Session,
    *,
    user_id: int,
    refresh_token: str,
    user_agent: str | None = None,
    device_id: str | None = None,
) -> UserSession:
    session = UserSession(
        user_id=user_id,
        refresh_token=refresh_token,
        user_agent=user_agent,
        device_id=device_id,
    )
    db.add(session)
    db.commit()
    db.refresh(session)
    return session

def get_session_by_refresh_token(db: Session, refresh_token: str) -> UserSession | None:
    return (
        db.query(UserSession)
        .filter(UserSession.refresh_token == refresh_token)
        .first()
    )

def get_session_by_id(db: Session, session_id: int) -> UserSession | None:
    return db.query(UserSession).filter(UserSession.id == session_id).first()


def update_session_refresh_token(
    db: Session,
    session: UserSession,
    new_refresh_token: str,
) -> UserSession:
    session.refresh_token = new_refresh_token
    session.revoked = False
    session.last_used_at = datetime.now(UTC)
    db.commit()
    db.refresh(session)
    return session


def touch_session_last_used_at(db: Session, session: UserSession) -> UserSession:
    session.last_used_at = datetime.now(UTC)
    db.commit()
    db.refresh(session)
    return session

def revoke_session(db: Session, session: UserSession) -> UserSession:
    session.revoked = True
    session.last_used_at = datetime.now(UTC)
    db.commit()
    db.refresh(session)
    return session

def create_token_reset(db: Session, user_id: int, token: str, expires_at: datetime) -> None:
    from modules.auth.models.password_reset import PasswordReset

    password_reset = PasswordReset(
        user_id=user_id,
        token_hash=token,
        expires_at=expires_at,
    )
    db.add(password_reset)
    db.commit()

def get_password_reset_by_token(db: Session, token: str) -> PasswordReset | None:
    from modules.auth.models.password_reset import PasswordReset

    return (
        db.query(PasswordReset)
        .filter(PasswordReset.token_hash == token)
        .order_by(PasswordReset.created_at.desc())
        .first()
    )


def get_password_reset_by_reset_token(
    db: Session,
    *,
    user_id: int,
    reset_token: str,
) -> PasswordReset | None:
    from modules.auth.models.password_reset import PasswordReset

    return (
        db.query(PasswordReset)
        .filter(
            PasswordReset.user_id == user_id,
            PasswordReset.reset_token == reset_token,
        )
        .order_by(PasswordReset.created_at.desc())
        .first()
    )


def mark_password_reset_as_verified(db: Session, password_reset: PasswordReset) -> PasswordReset:
    password_reset.verified_at = datetime.now(UTC)
    password_reset.reset_token = create_refresh_token()
    db.commit()
    db.refresh(password_reset)
    return password_reset


def mark_password_reset_as_used(db: Session, password_reset: PasswordReset) -> PasswordReset:
    password_reset.used_at = datetime.now(UTC)
    db.commit()
    db.refresh(password_reset)
    return password_reset


def update_user_password(db: Session, user: User, password_hash: str) -> User:
    user.password_hash = password_hash
    db.commit()
    db.refresh(user)
    return user


def revoke_all_user_sessions(db: Session, user_id: int) -> None:
    sessions = db.query(UserSession).filter(UserSession.user_id == user_id).all()
    now = datetime.now(UTC)
    for session in sessions:
        session.revoked = True
        session.last_used_at = now
    db.commit()
