from django.conf import settings


class AllowAdminIframe:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)
        if request.path.startswith("/admin/"):
            response.headers.pop("X-Frame-Options", None)
            origins = getattr(settings, "FRONTEND_ADMIN_ORIGINS", [])
            ancestors = " ".join(["'self'"] + origins) if origins else "'self'"
            response.headers["Content-Security-Policy"] = (
                f"frame-ancestors {ancestors}"
            )
        return response
