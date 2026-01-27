from django.db.models import Avg, Count, Q
from django.db.models.functions import TruncDate
from rest_framework import generics, status, viewsets, filters
from rest_framework.authtoken.models import Token
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAdminUser
from rest_framework.response import Response as DRFResponse

from .models import Answer, Choice, Driver, Question, Response, Survey
from .serializers import (
    AdminUserSerializer,
    AdminUserCreateSerializer,
    ChoiceAdminSerializer,
    DriverSerializer,
    QuestionAdminSerializer,
    ResponseCreateSerializer,
    SurveyAdminSerializer,
    SurveyOverviewSerializer,
    SurveyPublicSerializer,
)


from django.shortcuts import render
from django.contrib.admin.views.decorators import staff_member_required
from django.contrib.auth import get_user_model, login

def _format_answer_value(answer):
    if answer.rating_value is not None:
        return str(answer.rating_value)
    choices = [choice.choice.text for choice in answer.answer_choices.all()]
    if choices:
        return ", ".join(choices)
    if answer.text_value:
        return answer.text_value
    return ""

@staff_member_required
def admin_dashboard_view(request):
    surveys = Survey.objects.all()
    selected_survey_id = request.GET.get('survey_id')
    results = None
    
    if selected_survey_id:
        survey = Survey.objects.get(id=selected_survey_id)
        rating_questions = survey.questions.filter(question_type="rating")
        
        driver_stats = (
            Response.objects.filter(survey=survey)
            .values("driver__id", "driver__name", "driver__car_number")
            .annotate(response_count=Count("id"))
            .order_by("-response_count")
        )

        rating_avg = (
            Response.objects.filter(survey=survey, answers__question__in=rating_questions)
            .aggregate(avg_rating=Avg("answers__rating_value"))
            .get("avg_rating")
        )

        results = {
            "survey": survey,
            "rating_avg": rating_avg or 0,
            "drivers": list(driver_stats),
        }

    return render(request, 'admin/dashboard.html', {
        'surveys': surveys,
        'results': results,
        'selected_survey_id': selected_survey_id,
        'title': 'Dashboard'
    })


@api_view(["GET"])
@permission_classes([IsAdminUser])
def admin_dashboard_table_view(request):
    survey_id = request.query_params.get("survey_id")
    driver_id = request.query_params.get("driver_id")
    counts = Response.objects.values("survey_id", "driver_id").annotate(total=Count("id")).order_by(
        "survey_id", "driver_id"
    )
    if survey_id:
        counts = counts.filter(survey_id=survey_id)
    if driver_id:
        counts = counts.filter(driver_id=driver_id)
    count_list = list(counts)
    if not count_list:
        return DRFResponse({"rows": []})

    survey_ids = {row["survey_id"] for row in count_list}
    driver_ids = {row["driver_id"] for row in count_list}

    survey_map = {
        survey.id: survey.title for survey in Survey.objects.filter(id__in=survey_ids)
    }
    driver_map = {}
    for driver in Driver.objects.filter(id__in=driver_ids):
        display = f"{driver.last_name} {driver.name}".strip() if driver.last_name else driver.name
        driver_map[driver.id] = display

    question_map = {}
    questions = Question.objects.filter(survey_id__in=survey_ids).order_by("order", "id")
    for question in questions:
        question_list = question_map.setdefault(question.survey_id, [])
        if len(question_list) < 8:
            question_list.append(question)

    index_map = {
        survey_id: {q.id: idx for idx, q in enumerate(question_list)}
        for survey_id, question_list in question_map.items()
    }
    question_ids = [q.id for question_list in question_map.values() for q in question_list]

    rows = []
    row_map = {}
    for row in count_list:
        key = (row["survey_id"], row["driver_id"])
        row_data = {
            "id": f"{row['survey_id']}-{row['driver_id']}",
            "survey": survey_map.get(row["survey_id"], ""),
            "driver": driver_map.get(row["driver_id"], ""),
            "response_count": row["total"],
            "ip_address": "",
            "answers": [[] for _ in range(8)],
        }
        rows.append(row_data)
        row_map[key] = row_data

    if question_ids:
        answers = (
            Answer.objects.filter(
                response__survey_id__in=survey_ids,
                response__driver_id__in=driver_ids,
                question_id__in=question_ids,
            )
            .select_related("response", "question")
            .prefetch_related("answer_choices__choice")
        )
        for answer in answers:
            key = (answer.response.survey_id, answer.response.driver_id)
            row = row_map.get(key)
            if not row:
                continue
            if not row["ip_address"]:
                row["ip_address"] = answer.response.ip_address or ""
            idx = index_map.get(key[0], {}).get(answer.question_id)
            if idx is None:
                continue
            value = _format_answer_value(answer)
            if value:
                row["answers"][idx].append(value)

    return DRFResponse({"rows": rows})


@api_view(["POST"])
@permission_classes([IsAdminUser])
def admin_responses_delete_view(request):
    survey_id = request.data.get("survey_id")
    driver_id = request.data.get("driver_id")
    queryset = Response.objects.all()
    if survey_id:
        queryset = queryset.filter(survey_id=survey_id)
    if driver_id:
        queryset = queryset.filter(driver_id=driver_id)
    deleted_responses = queryset.count()
    if deleted_responses:
        queryset.delete()
    return DRFResponse({"deleted_responses": deleted_responses})


@api_view(["GET"])
@permission_classes([IsAdminUser])
def admin_surveys_overview_view(request):
    surveys = Survey.objects.prefetch_related("questions").all()
    serializer = SurveyOverviewSerializer(surveys, many=True)
    return DRFResponse(serializer.data)


@api_view(["GET", "POST"])
@permission_classes([IsAdminUser])
def admin_users_view(request):
    if request.method == "POST":
        serializer = AdminUserCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return DRFResponse(AdminUserSerializer(user).data, status=status.HTTP_201_CREATED)
    users = get_user_model().objects.order_by("username")
    serializer = AdminUserSerializer(users, many=True)
    return DRFResponse(serializer.data)


@api_view(["POST"])
@permission_classes([IsAdminUser])
def admin_session_view(request):
    login(request, request.user)
    return DRFResponse({"ok": True})


@api_view(["POST"])
@permission_classes([AllowAny])
def login_view(request):
    username = request.data.get("username")
    password = request.data.get("password")
    if not username or not password:
        return DRFResponse(
            {"detail": "Username and password required."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    from django.contrib.auth import authenticate

    user = authenticate(request, username=username, password=password)
    if not user or not user.is_staff:
        return DRFResponse(
            {"detail": "Invalid credentials or not admin."},
            status=status.HTTP_401_UNAUTHORIZED,
        )

    token, _ = Token.objects.get_or_create(user=user)
    return DRFResponse({"token": token.key, "username": user.username})


class SurveyAdminViewSet(viewsets.ModelViewSet):
    queryset = Survey.objects.all()
    serializer_class = SurveyAdminSerializer
    permission_classes = [IsAdminUser]

    @action(detail=True, methods=["get"], permission_classes=[IsAdminUser])
    def results(self, request, pk=None):
        survey = self.get_object()
        rating_questions = survey.questions.filter(question_type="rating")

        driver_stats = (
            Response.objects.filter(survey=survey)
            .values("driver__id", "driver__name")
            .annotate(response_count=Count("id"))
            .order_by("driver__name")
        )

        rating_avg = (
            Response.objects.filter(survey=survey, answers__question__in=rating_questions)
            .aggregate(avg_rating=Avg("answers__rating_value"))
            .get("avg_rating")
        )

        date_stats = (
            Response.objects.filter(survey=survey)
            .annotate(day=TruncDate("submitted_at"))
            .values("day")
            .annotate(count=Count("id"))
            .order_by("day")
        )

        return DRFResponse(
            {
                "survey": SurveyAdminSerializer(survey).data,
                "rating_avg": rating_avg or 0,
                "drivers": list(driver_stats),
                "by_date": list(date_stats),
            }
        )


class QuestionAdminViewSet(viewsets.ModelViewSet):
    queryset = Question.objects.select_related("survey").all()
    serializer_class = QuestionAdminSerializer
    permission_classes = [IsAdminUser]


class ChoiceAdminViewSet(viewsets.ModelViewSet):
    queryset = Choice.objects.select_related("question").all()
    serializer_class = ChoiceAdminSerializer
    permission_classes = [IsAdminUser]


class DriverAdminViewSet(viewsets.ModelViewSet):
    queryset = Driver.objects.all()
    serializer_class = DriverSerializer
    permission_classes = [IsAdminUser]


class ActiveSurveyListView(generics.ListAPIView):
    serializer_class = SurveyPublicSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        return Survey.objects.filter(is_active=True)


class ActiveSurveyDetailView(generics.RetrieveAPIView):
    serializer_class = SurveyPublicSerializer
    permission_classes = [AllowAny]
    lookup_field = "slug"

    def get_queryset(self):
        return Survey.objects.filter(is_active=True)


class ActiveDriverListView(generics.ListAPIView):
    serializer_class = DriverSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        queryset = Driver.objects.filter(is_active=True)
        search = self.request.query_params.get("search")
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) | 
                Q(last_name__icontains=search) | 
                Q(phone_number__icontains=search) |
                Q(car_number__icontains=search)
            )
        return queryset


class ResponseCreateView(generics.CreateAPIView):
    serializer_class = ResponseCreateSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        response = serializer.save()
        return DRFResponse({"id": response.id}, status=status.HTTP_201_CREATED)
