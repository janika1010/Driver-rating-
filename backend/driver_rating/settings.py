from pathlib import Path
import os
import dj_database_url

BASE_DIR = Path(__file__).resolve().parent.parent

def _env_list(name: str, default: list[str] | None = None) -> list[str]:
    value = os.environ.get(name, "")
    if value:
        return [item.strip() for item in value.split(",") if item.strip()]
    return default or []


SECRET_KEY = os.environ.get(
    "SECRET_KEY",
    "m5@E9w4v2r!t8Qp6Yz1Nf7sX0kL3cV9uB5dR2gH8jK4eP6mT1x",
)
DEBUG = os.environ.get("DEBUG", "True").lower() in ("1", "true", "yes", "on")
ALLOWED_HOSTS: list[str] = _env_list("ALLOWED_HOSTS", ["127.0.0.1", "localhost"])
render_host = os.environ.get("RENDER_EXTERNAL_HOSTNAME")
if render_host and render_host not in ALLOWED_HOSTS:
    ALLOWED_HOSTS.append(render_host)

INSTALLED_APPS = [
    "surveys",
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "rest_framework",
    "rest_framework.authtoken",
    "corsheaders",
]

MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
    "driver_rating.middleware.AllowAdminIframe",
]

ROOT_URLCONF = "driver_rating.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
                "surveys.context_processors.frontend_urls",
            ],
        },
    },
]

WSGI_APPLICATION = "driver_rating.wsgi.application"
ASGI_APPLICATION = "driver_rating.asgi.application"

DATABASES = {
    "default": dj_database_url.config(
        default=f"sqlite:///{BASE_DIR / 'db.sqlite3'}",
        conn_max_age=600,
    )
}

AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

LANGUAGE_CODE = "en-us"
TIME_ZONE = "Asia/Ulaanbaatar"
USE_I18N = True
USE_TZ = True

STATIC_URL = "static/"
STATIC_ROOT = BASE_DIR / "staticfiles"
STATICFILES_STORAGE = "whitenoise.storage.CompressedManifestStaticFilesStorage"
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework.authentication.TokenAuthentication",
        "rest_framework.authentication.SessionAuthentication",
    ],
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.IsAuthenticatedOrReadOnly",
    ],
}

CORS_ALLOWED_ORIGINS = _env_list(
    "CORS_ALLOWED_ORIGINS",
    [
        "http://localhost:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
        "https://drivers-rating.vercel.app",
    ],
)

CORS_ALLOW_CREDENTIALS = True

# For this project we allow all origins to simplify admin/frontend integration
CORS_ALLOW_ALL_ORIGINS = True

CSRF_TRUSTED_ORIGINS = _env_list("CSRF_TRUSTED_ORIGINS", CORS_ALLOWED_ORIGINS)

SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")

FRONTEND_ADMIN_SURVEYS_URL = os.environ.get(
    "FRONTEND_ADMIN_SURVEYS_URL", "http://localhost:5173/admin/surveys"
)
FRONTEND_ADMIN_DASHBOARD_URL = os.environ.get(
    "FRONTEND_ADMIN_DASHBOARD_URL", "http://localhost:5173/admin/dashboard"
)
FRONTEND_ADMIN_ORIGINS = _env_list(
    "FRONTEND_ADMIN_ORIGINS",
    ["http://localhost:5173", "http://127.0.0.1:5173"],
)
