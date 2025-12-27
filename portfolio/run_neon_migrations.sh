#!/bin/bash

# Script to run Django migrations against Neon PostgreSQL database
# Usage: ./run_neon_migrations.sh

echo "🚀 Running Django migrations for Neon database..."
echo ""

# Check if environment variables are set
if [ -z "$DB_NAME" ] || [ -z "$DB_USER" ] || [ -z "$DB_PASSWORD" ] || [ -z "$DB_HOST" ]; then
    echo "❌ Error: Database environment variables not set!"
    echo ""
    echo "Please set the following environment variables:"
    echo "  - DB_NAME"
    echo "  - DB_USER"
    echo "  - DB_PASSWORD"
    echo "  - DB_HOST"
    echo "  - DB_PORT (optional, defaults to 5432)"
    echo ""
    echo "You can either:"
    echo "  1. Create a .env file in the portfolio/ directory"
    echo "  2. Export them in your shell: export DB_NAME=..."
    echo ""
    exit 1
fi

echo "✅ Database environment variables found"
echo "   Host: $DB_HOST"
echo "   Database: $DB_NAME"
echo "   User: $DB_USER"
echo ""

# Change to portfolio directory
cd "$(dirname "$0")/portfolio" || exit 1

# Run migrations
echo "📦 Running migrations..."
python manage.py migrate

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Migrations completed successfully!"
    echo ""
    echo "To verify, run: python manage.py showmigrations"
else
    echo ""
    echo "❌ Migration failed. Please check the error above."
    exit 1
fi

