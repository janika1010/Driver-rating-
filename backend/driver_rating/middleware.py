class AllowAdminIframe:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)
        if request.path.startswith("/admin/"):
            response.headers.pop("X-Frame-Options", None)
            # Allow embedding admin from local dev and deployed frontend.
            ancestors = "'self' http://localhost:5173 http://127.0.0.1:5173 https://drivers-rating.vercel.app"
            response.headers["Content-Security-Policy"] = (
                f"frame-ancestors {ancestors}"
            )
        return response
