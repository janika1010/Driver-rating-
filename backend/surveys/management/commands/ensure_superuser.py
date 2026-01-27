import os

from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model


class Command(BaseCommand):
    help = "Ensure a superuser exists with credentials from environment variables"

    def handle(self, *args, **options):
        username = os.environ.get("DJANGO_SUPERUSER_USERNAME")
        password = os.environ.get("DJANGO_SUPERUSER_PASSWORD")
        email = os.environ.get("DJANGO_SUPERUSER_EMAIL", "")

        if not username or not password:
            self.stdout.write(
                self.style.WARNING(
                    "DJANGO_SUPERUSER_USERNAME and DJANGO_SUPERUSER_PASSWORD must be set"
                )
            )
            return

        User = get_user_model()
        user, created = User.objects.get_or_create(
            username=username,
            defaults={"email": email, "is_staff": True, "is_superuser": True},
        )

        if not user.is_staff or not user.is_superuser:
            user.is_staff = True
            user.is_superuser = True

        user.set_password(password)
        if email and not user.email:
            user.email = email

        user.save(update_fields=["is_staff", "is_superuser", "password", "email"])

        if created:
            self.stdout.write(
                self.style.SUCCESS(f'Successfully created superuser "{username}"')
            )
        else:
            self.stdout.write(
                self.style.SUCCESS(f'Successfully updated superuser "{username}"')
            )
