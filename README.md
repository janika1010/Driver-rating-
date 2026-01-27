# Driver Rating System

React + Django starter for a driver rating survey system.

## Structure
- `backend/` Django REST API
- `frontend/` React app

## Quick start
Backend
1) `cd "backend"`
2) `python -m venv .venv`
3) `source .venv/bin/activate`
4) `pip install -r requirements.txt`
5) `python manage.py migrate`
6) `python manage.py createsuperuser`
7) `python manage.py runserver`

Frontend
1) `cd "frontend"`
2) `npm install`
3) `npm run dev`

## Admin URLs
- Django admin: `http://127.0.0.1:8000/admin/`
- API base: `http://127.0.0.1:8000/api/`

## Public survey URL
- `http://localhost:5173/survey/{survey-slug}`
