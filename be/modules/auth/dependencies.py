from fastapi import Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from core.exceptions import ForbiddenException, UnauthorizedException
from db.database import get_db
from modules.auth import repository
from modules.auth.security import decode_access_token
from modules.users.model import User

bearer_scheme = HTTPBearer(auto_error=False)
 
def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> User:
    if not credentials or credentials.scheme.lower() != "bearer":
        raise UnauthorizedException(message="Access token is missing")

    payload = decode_access_token(credentials.credentials)

    user = repository.get_user_by_id(db, int(payload.sub))
    if not user:
        raise UnauthorizedException(message="User not found")

    if payload.sid is not None:
        session = repository.get_session_by_id(db, payload.sid)
        if not session or session.revoked:
            raise UnauthorizedException(message="Session is invalid or revoked")

        if session.user_id != user.id:
            raise UnauthorizedException(message="Session does not belong to user")

    return user

def require_roles(*allowed_roles: str):
    def dependency(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role not in allowed_roles:
            raise ForbiddenException(message="You do not have permission")
        return current_user

    return dependency
