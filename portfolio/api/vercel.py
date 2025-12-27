"""
Vercel serverless function handler for Django
Exports the Django WSGI application for Vercel's Python runtime
"""
import os
import sys
import traceback
from pathlib import Path

# Add project root to Python path
# vercel.py is at portfolio/api/vercel.py
# BASE_DIR should be portfolio/ (parent of api/)
BASE_DIR = Path(__file__).resolve().parent.parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

# Mark as Vercel environment (prevents SQLite file writes)
os.environ["VERCEL"] = "1"

# Set Django settings module
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "portfolio.settings")

# Import Django WSGI application
# Wrap in try/except to provide better error messages
try:
    from portfolio.wsgi import application
    
    # Test database connection if configured
    try:
        from django.db import connection
        connection.ensure_connection()
        print("Database connection successful", file=sys.stderr)
    except Exception as db_error:
        # Log database error but don't crash - app can still serve static pages
        print(f"WARNING: Database connection failed: {db_error}", file=sys.stderr)
        print("App will continue but database operations may fail.", file=sys.stderr)
        print("Please set DB_NAME, DB_USER, DB_PASSWORD, DB_HOST in Vercel environment variables.", file=sys.stderr)
        
except Exception as e:
    # Log detailed error information for import/startup errors
    error_details = {
        "BASE_DIR": str(BASE_DIR),
        "Python path (first 3)": sys.path[:3],
        "DJANGO_SETTINGS_MODULE": os.environ.get("DJANGO_SETTINGS_MODULE"),
        "VERCEL env": os.environ.get("VERCEL"),
        "DB_NAME set": "Yes" if os.environ.get("DB_NAME") else "No",
        "Error type": type(e).__name__,
        "Error message": str(e),
        "Traceback": traceback.format_exc()
    }
    error_msg = "\n".join([f"{k}: {v}" for k, v in error_details.items()])
    print(f"ERROR loading Django application:\n{error_msg}", file=sys.stderr)
    # Re-raise to let Vercel show the error
    raise

# Vercel's @vercel/python runtime expects 'app' variable for WSGI applications
app = application
