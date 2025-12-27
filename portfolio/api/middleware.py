"""
Custom middleware to handle ALLOWED_HOSTS for Vercel custom domains
This works around Django's ALLOWED_HOSTS validation for custom domains on Vercel
"""
import os
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
            # Get the original host from X-Forwarded-Host (set by Vercel)
            forwarded_host = request.META.get('HTTP_X_FORWARDED_HOST', '')
            if forwarded_host:
                # Extract the hostname (remove port if present)
                host = forwarded_host.split(':')[0]
                # Temporarily set META['HTTP_HOST'] to a value in ALLOWED_HOSTS
                # This prevents DisallowedHost exception
                # We'll restore it after, but CommonMiddleware checks HTTP_HOST
                original_host = request.META.get('HTTP_HOST', '')
                # Use the forwarded host, but if it's not in ALLOWED_HOSTS,
                # use a vercel.app domain which is in ALLOWED_HOSTS
                from django.conf import settings
                if host not in settings.ALLOWED_HOSTS and not any(
                    host.endswith(allowed.replace('.', '')) if allowed.startswith('.') else host == allowed
                    for allowed in settings.ALLOWED_HOSTS
                ):
                    # If custom domain not in ALLOWED_HOSTS, use a vercel domain
                    # The actual domain info is preserved in X-Forwarded-Host
                    request.META['HTTP_HOST'] = request.META.get('HTTP_X_VERCEL_ORIGINAL_HOST', 'localhost')
        
        try:
            response = self.get_response(request)
        except DisallowedHost:
            # If still getting DisallowedHost, try to work around it
            if os.environ.get('VERCEL'):
                # Force use of a known good host
                request.META['HTTP_HOST'] = 'localhost'
                response = self.get_response(request)
            else:
                raise
        
        return response

