"""
Vercel serverless function wrapper for Django WSGI application
"""
import os
import sys
from pathlib import Path

# Add project to Python path
BASE_DIR = Path(__file__).resolve().parent.parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

# Set Django settings module
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "portfolio.settings")

# Mark as Vercel environment (prevents SQLite file writes)
os.environ["VERCEL"] = "1"

# Import and setup Django
try:
    import django
    django.setup()
    
    # Import WSGI application
    from portfolio.wsgi import application
    
    # Vercel serverless function handler
    def handler(request, response):
        """
        Vercel serverless function handler
        """
        try:
            return application(request.environ, response.start_response)
        except Exception as e:
            # Log error for debugging
            import traceback
            print(f"Django Error: {str(e)}")
            print(traceback.format_exc())
            # Return error response
            response.status = 500
            response.headers = [('Content-Type', 'text/plain')]
            response.start_response('500 Internal Server Error', response.headers)
            return [f"Error: {str(e)}".encode()]
            
except Exception as e:
    # If Django setup fails, return error
    import traceback
    print(f"Setup Error: {str(e)}")
    print(traceback.format_exc())
    
    def handler(request, response):
        response.status = 500
        response.headers = [('Content-Type', 'text/plain')]
        response.start_response('500 Internal Server Error', response.headers)
        return [f"Setup Error: {str(e)}".encode()]
