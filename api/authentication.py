from rest_framework.authentication import BaseAuthentication
from rest_framework.permissions import BasePermission
from rest_framework.exceptions import AuthenticationFailed
from django.core import signing
from django.conf import settings
from .models import Member


class CookieAuthentication(BaseAuthentication):
    """
    Custom authentication class that uses HttpOnly cookies for session management.
    """

    def authenticate(self, request):
        """
        Authenticate the request using session_id cookie.
        Returns (member, None) tuple if authenticated, None otherwise.
        """
        session_id = request.COOKIES.get('session_id')
        
        if not session_id:
            return None
        
        try:
            # Verify and decode the signed cookie
            member_id = signing.loads(
                session_id,
                key=settings.SECRET_KEY,
                max_age=60 * 60 * 24 * 7  # 7 days
            )
            
            # Retrieve the member from database
            member = Member.objects.get(id=member_id)
            return (member, None)
            
        except signing.SignatureExpired:
            raise AuthenticationFailed('Session expired')
        except signing.BadSignature:
            raise AuthenticationFailed('Invalid session')
        except Member.DoesNotExist:
            raise AuthenticationFailed('Member not found')
        except Exception:
            return None


class IsAuthenticatedMember(BasePermission):
    """
    Custom permission class to check if user is authenticated.
    """

    def has_permission(self, request, view):
        """
        Check if the request has an authenticated member.
        """
        return (
            request.user is not None and
            hasattr(request.user, 'is_authenticated') and
            request.user.is_authenticated
        )


def set_auth_cookie(response, member_id):
    """
    Set HttpOnly authentication cookie on the response.
    
    Args:
        response: Django Response object
        member_id: ID of the member to authenticate
    """
    # Sign the member_id
    signed_value = signing.dumps(member_id, key=settings.SECRET_KEY)
    
    # Set the cookie with secure options
    response.set_cookie(
        key='session_id',
        value=signed_value,
        max_age=60 * 60 * 24 * 7,  # 7 days
        httponly=True,
        secure=False,  # Set to True in production with HTTPS
        samesite='Lax',
        path='/'
    )
    
    return response


def clear_auth_cookie(response):
    """
    Clear the authentication cookie from the response.
    
    Args:
        response: Django Response object
    """
    response.delete_cookie(
        key='session_id',
        path='/'
    )
    
    return response
