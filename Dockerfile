FROM python:3.13-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

COPY backend/requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

COPY backend /app

ENV PORT=8000

# Migration script with lock to prevent concurrent migrations
COPY backend/scripts/run_migrations.sh /app/run_migrations.sh
RUN chmod +x /app/run_migrations.sh

CMD ["sh", "-c", "/app/run_migrations.sh && python manage.py ensure_superuser && gunicorn driver_rating.wsgi:application --bind 0.0.0.0:$PORT"]
