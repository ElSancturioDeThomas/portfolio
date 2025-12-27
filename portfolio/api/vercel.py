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
except Exception as e:
    # Log detailed error information
    error_details = {
        "BASE_DIR": str(BASE_DIR),
        "Python path (first 3)": sys.path[:3],
        "DJANGO_SETTINGS_MODULE": os.environ.get("DJANGO_SETTINGS_MODULE"),
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
