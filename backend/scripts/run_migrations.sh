#!/bin/bash
# Migration script for production
# This ensures migrations run safely

set -e

echo "Checking migration status..."
python manage.py migrate --plan

echo "Running database migrations..."
python manage.py migrate --noinput

echo "Migrations completed successfully!"
