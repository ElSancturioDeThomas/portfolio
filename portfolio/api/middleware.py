"""
Custom middleware to handle ALLOWED_HOSTS for Vercel custom domains
This works around Django's ALLOWED_HOSTS validation for custom domains on Vercel
"""
import os
import sys
from django.core.exceptions import DisallowedHost
from django.http import HttpRequest


class VercelCustomDomainMiddleware:
    """
    Middleware to allow custom domains on Vercel by modifying the request
    to use a host that's in ALLOWED_HOSTS before Django's CommonMiddleware validates it.
    This is safe because Vercel handles domain routing and SSL termination.
    """
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Only apply in Vercel environment
        if os.environ.get('VERCEL'):
            # Get the original host from X-Forwarded-Host (set by Vercel) or HTTP_HOST
            forwarded_host = request.META.get('HTTP_X_FORWARDED_HOST', '')
            current_host = request.META.get('HTTP_HOST', '')
            
            # Determine the actual host being used
            host = forwarded_host.split(':')[0] if forwarded_host else current_host.split(':')[0]
            
            # Check if host is in ALLOWED_HOSTS
            from django.conf import settings
            host_allowed = False
            
            # Check exact match
            if host in settings.ALLOWED_HOSTS:
                host_allowed = True
            else:
                # Check pattern matches (e.g., '.vercel.app' matches 'anything.vercel.app')
                for allowed in settings.ALLOWED_HOSTS:
                    if allowed.startswith('.'):
                        if host.endswith(allowed[1:]):
                            host_allowed = True
                            break
                    elif host == allowed:
                        host_allowed = True
                        break
            
            # If host is not allowed, replace HTTP_HOST with a known good value
            # This must happen BEFORE CommonMiddleware validates it
            if not host_allowed and host:
                # Log for debugging (only in Vercel)
                print(f"VercelCustomDomainMiddleware: Host '{host}' not in ALLOWED_HOSTS, using localhost", file=sys.stderr)
                # Use localhost which is always in ALLOWED_HOSTS
                # Store original host for reference
                request.META['HTTP_X_ORIGINAL_HOST'] = host
                request.META['HTTP_HOST'] = 'localhost'
                # Also update SERVER_NAME to prevent issues
                request.META['SERVER_NAME'] = 'localhost'
                # Remove X-Forwarded-Host to prevent double validation
                if 'HTTP_X_FORWARDED_HOST' in request.META:
                    request.META['HTTP_X_FORWARDED_HOST'] = 'localhost'
        
        try:
            response = self.get_response(request)
        except DisallowedHost as e:
            # If still getting DisallowedHost, force use of localhost
            if os.environ.get('VERCEL'):
                request.META['HTTP_HOST'] = 'localhost'
                request.META['SERVER_NAME'] = 'localhost'
                # Remove the problematic host from META
                if 'HTTP_X_FORWARDED_HOST' in request.META:
                    del request.META['HTTP_X_FORWARDED_HOST']
                response = self.get_response(request)
            else:
                raise
        
        return response

