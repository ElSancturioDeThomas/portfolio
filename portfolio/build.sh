#!/bin/bash
set -e

echo "Starting build process..."
cd portfolio

echo "Installing dependencies..."
pip install -r requirements.txt

echo "Collecting static files..."
python manage.py collectstatic --noinput

echo "Build completed successfully!"

