from django.conf import settings


def frontend_urls(request):
    return {
        "frontend_admin_dashboard_url": getattr(
            settings, "FRONTEND_ADMIN_DASHBOARD_URL", "http://localhost:5173/admin/dashboard"
        )
    }
