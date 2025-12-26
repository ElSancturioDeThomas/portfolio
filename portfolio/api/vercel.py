"""
Vercel serverless function handler for Django
Exports the Django WSGI application for Vercel's Python runtime
"""
import os
import sys
from pathlib import Path

# Add project root to Python path
BASE_DIR = Path(__file__).resolve().parent.parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

# Set Django settings module
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "portfolio.settings")

# Mark as Vercel environment (prevents SQLite file writes)
os.environ["VERCEL"] = "1"

# Import Django WSGI application
# Vercel's @vercel/python runtime expects 'app' variable for WSGI applications
from portfolio.wsgi import application

app = application
