"""
Vercel serverless function handler for Django
Exports the Django WSGI application for Vercel's Python runtime
"""
import os
import sys
from pathlib import Path

# Add project root to Python path
# vercel.py is at portfolio/api/vercel.py
# BASE_DIR should be portfolio/ (parent of api/)
BASE_DIR = Path(__file__).resolve().parent.parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

# Set Django settings module
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "portfolio.settings")

# Mark as Vercel environment (prevents SQLite file writes)
os.environ["VERCEL"] = "1"

# Import Django WSGI application
# The wsgi.py file is at portfolio/wsgi.py
# When Python path includes portfolio/, we import portfolio.wsgi
from portfolio.wsgi import application

# Vercel's @vercel/python runtime expects 'app' variable for WSGI applications
app = application
