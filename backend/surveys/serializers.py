from django.contrib.auth import get_user_model
from django.db import transaction
from rest_framework import serializers

from .models import Answer, AnswerChoice, Choice, Driver, Question, Response, Survey

User = get_user_model()


class ChoiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Choice
        fields = ["id", "text", "order"]


class QuestionSerializer(serializers.ModelSerializer):
    choices = ChoiceSerializer(many=True, read_only=True)

    class Meta:
        model = Question
        fields = ["id", "text", "question_type", "is_required", "order", "choices"]


class SurveyPublicSerializer(serializers.ModelSerializer):
    questions = QuestionSerializer(many=True, read_only=True)

    class Meta:
        model = Survey
        fields = ["id", "title", "slug", "description", "is_active", "questions"]


class DriverSerializer(serializers.ModelSerializer):
    class Meta:
        model = Driver
        fields = ["id", "last_name", "name", "phone_number", "car_number", "is_active"]


class SurveyAdminSerializer(serializers.ModelSerializer):
    slug = serializers.SlugField(required=False, allow_blank=True)

    class Meta:
        model = Survey
        fields = ["id", "title", "slug", "description", "is_active", "created_at"]


class AdminUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email", "first_name", "last_name", "is_staff", "is_active"]


class AdminUserCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "is_staff",
            "is_active",
            "password",
        ]

    def create(self, validated_data):
        password = validated_data.pop("password")
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user

class SurveyOverviewSerializer(serializers.ModelSerializer):
    questions = serializers.SerializerMethodField()

    class Meta:
        model = Survey
        fields = ["id", "title", "slug", "description", "is_active", "questions"]

    def get_questions(self, obj):
        questions = obj.questions.all().order_by("order", "id")[:8]
        return [question.text for question in questions]


class QuestionAdminSerializer(serializers.ModelSerializer):
    class Meta:
        model = Question
        fields = [
            "id",
            "survey",
            "text",
            "question_type",
            "is_required",
            "order",
        ]


class ChoiceAdminSerializer(serializers.ModelSerializer):
    class Meta:
        model = Choice
        fields = ["id", "question", "text", "order"]


class AnswerInputSerializer(serializers.Serializer):
    question_id = serializers.IntegerField()
    rating_value = serializers.IntegerField(required=False, min_value=1, max_value=5)
    text_value = serializers.CharField(required=False, allow_blank=True)
    choice_ids = serializers.ListField(
        child=serializers.IntegerField(), required=False
    )


class ResponseCreateSerializer(serializers.Serializer):
    survey_id = serializers.IntegerField()
    driver_id = serializers.IntegerField()
    answers = AnswerInputSerializer(many=True)

    def validate(self, data):
        survey = Survey.objects.filter(id=data["survey_id"], is_active=True).first()
        if not survey:
            raise serializers.ValidationError("Survey not found or inactive.")
        driver = Driver.objects.filter(id=data["driver_id"], is_active=True).first()
        if not driver:
            raise serializers.ValidationError("Driver not found or inactive.")
        if Response.objects.filter(survey=survey, driver=driver).exists():
            raise serializers.ValidationError("Энэ жолоочид нэг л удаа судалгаа бөглөх боломжтой.")

        data["survey"] = survey
        data["driver"] = driver
        return data

    @transaction.atomic
    def create(self, validated_data):
        request = self.context.get("request")
        ip_address = None
        if request:
            ip_address = request.META.get("REMOTE_ADDR")

        response = Response.objects.create(
            survey=validated_data["survey"],
            driver=validated_data["driver"],
            ip_address=ip_address,
        )

        question_map = {
            q.id: q for q in validated_data["survey"].questions.all()
        }

        for answer_payload in validated_data["answers"]:
            question = question_map.get(answer_payload["question_id"])
            if not question:
                continue

            answer = Answer.objects.create(
                response=response,
                question=question,
                rating_value=answer_payload.get("rating_value"),
                text_value=answer_payload.get("text_value", ""),
            )

            choice_ids = answer_payload.get("choice_ids") or []
            if choice_ids:
                choices = Choice.objects.filter(question=question, id__in=choice_ids)
                AnswerChoice.objects.bulk_create(
                    [AnswerChoice(answer=answer, choice=choice) for choice in choices]
                )

        return response
