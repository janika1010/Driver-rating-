from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    ActiveDriverListView,
    ActiveSurveyDetailView,
    ActiveSurveyListView,
    ChoiceAdminViewSet,
    DriverAdminViewSet,
    QuestionAdminViewSet,
    ResponseCreateView,
    SurveyAdminViewSet,
    login_view,
    admin_dashboard_view,
    admin_dashboard_table_view,
    admin_responses_delete_view,
    admin_surveys_overview_view,
    admin_users_view,
    admin_session_view,
)

router = DefaultRouter()
router.register("admin/surveys", SurveyAdminViewSet, basename="admin-surveys")
router.register("admin/questions", QuestionAdminViewSet, basename="admin-questions")
router.register("admin/choices", ChoiceAdminViewSet, basename="admin-choices")
router.register("admin/drivers", DriverAdminViewSet, basename="admin-drivers")

urlpatterns = [
    path("dashboard/", admin_dashboard_view, name="admin-dashboard"),
    path("admin/dashboard-table/", admin_dashboard_table_view, name="admin-dashboard-table"),
    path("admin/responses/delete/", admin_responses_delete_view, name="admin-responses-delete"),
    path("admin/surveys-overview/", admin_surveys_overview_view, name="admin-surveys-overview"),
    path("admin/users/", admin_users_view, name="admin-users"),
    path("admin/session/", admin_session_view, name="admin-session"),
    path("auth/login/", login_view),
    path("surveys/active/", ActiveSurveyListView.as_view()),
    path("surveys/active/<slug:slug>/", ActiveSurveyDetailView.as_view()),
    path("drivers/active/", ActiveDriverListView.as_view()),
    path("responses/", ResponseCreateView.as_view()),
    path("", include(router.urls)),
]
