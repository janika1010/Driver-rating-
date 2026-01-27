import os

from django.apps import AppConfig
from django.db.utils import OperationalError, ProgrammingError


class SurveysConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "surveys"

    def ready(self) -> None:
        """
        Auto-create an admin user in environments where we can't easily run
        `createsuperuser` (e.g. managed PaaS without shell access).

        Controlled by environment variables:
        - DJANGO_SUPERUSER_USERNAME
        - DJANGO_SUPERUSER_PASSWORD
        - DJANGO_SUPERUSER_EMAIL
        """
        from django.contrib.auth import get_user_model

        username = os.environ.get("DJANGO_SUPERUSER_USERNAME")
        password = os.environ.get("DJANGO_SUPERUSER_PASSWORD")
        email = os.environ.get("DJANGO_SUPERUSER_EMAIL", "")

        # Only attempt auto-create if credentials are provided
        if not (username and password):
            return

        User = get_user_model()

        try:
            # If a user with this username exists, ensure they are admin and update password
            user, created = User.objects.get_or_create(
                username=username,
                defaults={"email": email, "is_staff": True, "is_superuser": True},
            )
            # Always ensure admin status and update password
            if not user.is_staff or not user.is_superuser:
                user.is_staff = True
                user.is_superuser = True
            user.set_password(password)
            if email and not user.email:
                user.email = email
            user.save(update_fields=["is_staff", "is_superuser", "password", "email"])
        except (OperationalError, ProgrammingError):
            # Database tables (e.g. auth_user) not ready yet – happens before first migrate
            return
