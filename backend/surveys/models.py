from django.db import models
from django.utils.text import slugify


class Driver(models.Model):
    last_name = models.CharField(max_length=120, verbose_name="Овог", blank=True)
    name = models.CharField(max_length=120, verbose_name="Нэр")
    phone_number = models.CharField(max_length=20, blank=True, null=True, verbose_name="Утасны дугаар", db_index=True)
    car_number = models.CharField(max_length=20, blank=True, null=True, verbose_name="Машины дугаар", db_index=True)
    is_active = models.BooleanField(default=True, verbose_name="Идэвхтэй", db_index=True)

    class Meta:
        verbose_name = "жолооч"
        verbose_name_plural = "жолооч"
        indexes = [
            models.Index(fields=["is_active"]),
        ]

    def __str__(self) -> str:
        display = f"{self.last_name} {self.name}" if self.last_name else self.name
        if self.car_number:
            display += f" [{self.car_number}]"
        return display


class Survey(models.Model):
    title = models.CharField(max_length=200, verbose_name="Судалгааны нэр")
    slug = models.SlugField(max_length=220, unique=True, db_index=True)
    description = models.TextField(blank=True, verbose_name="Тайлбар")
    is_active = models.BooleanField(default=False, verbose_name="Идэвхтэй", db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self) -> str:
        return self.title

    def save(self, *args, **kwargs):
        if not self.slug:
            max_length = self._meta.get_field("slug").max_length
            base_slug = slugify(self.title) or "survey"
            base_slug = base_slug[:max_length]
            candidate = base_slug
            suffix = 1
            while Survey.objects.filter(slug=candidate).exclude(pk=self.pk).exists():
                suffix_text = f"-{suffix}"
                candidate = f"{base_slug[: max_length - len(suffix_text)]}{suffix_text}"
                suffix += 1
            self.slug = candidate
        super().save(*args, **kwargs)


class Question(models.Model):
    TYPE_RATING = "rating"
    TYPE_SINGLE = "single"
    TYPE_MULTI = "multi"
    TYPE_TEXT = "text"

    TYPE_CHOICES = [
        (TYPE_RATING, "1-5 үнэлгээ"),
        (TYPE_SINGLE, "Нэг сонголт"),
        (TYPE_MULTI, "Олон сонголт"),
        (TYPE_TEXT, "Чөлөөт текст"),
    ]

    survey = models.ForeignKey(Survey, on_delete=models.CASCADE, related_name="questions", db_index=True)
    text = models.CharField(max_length=500, verbose_name="Асуулт")
    question_type = models.CharField(max_length=20, choices=TYPE_CHOICES, verbose_name="Асуултын төрөл")
    is_required = models.BooleanField(default=True, verbose_name="Заавал эсэх")
    order = models.PositiveIntegerField(default=0, verbose_name="Дараалал", db_index=True)

    class Meta:
        ordering = ["order", "id"]
        verbose_name = "Асуулт"
        verbose_name_plural = "Асуулт"
        indexes = [
            models.Index(fields=["survey", "order", "id"]),
        ]

    def __str__(self) -> str:
        return f"{self.survey.title}: {self.text}"


class Choice(models.Model):
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name="choices")
    text = models.CharField(max_length=200, verbose_name="Сонголт")
    order = models.PositiveIntegerField(default=0, verbose_name="Дараалал")

    class Meta:
        ordering = ["order", "id"]

    def __str__(self) -> str:
        return self.text


class Response(models.Model):
    survey = models.ForeignKey(Survey, on_delete=models.CASCADE, related_name="responses", db_index=True)
    driver = models.ForeignKey(Driver, on_delete=models.PROTECT, related_name="responses", db_index=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    submitted_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        unique_together = [("survey", "driver")]
        ordering = ["-submitted_at"]
        indexes = [
            models.Index(fields=["survey", "driver"]),
            models.Index(fields=["-submitted_at"]),
        ]

    def __str__(self) -> str:
        return f"{self.survey.title} - {self.driver.name}"


class Answer(models.Model):
    response = models.ForeignKey(Response, on_delete=models.CASCADE, related_name="answers", db_index=True)
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name="answers", db_index=True)
    rating_value = models.PositiveSmallIntegerField(null=True, blank=True)
    text_value = models.TextField(blank=True)

    class Meta:
        unique_together = [("response", "question")]
        indexes = [
            models.Index(fields=["response", "question"]),
        ]

    def __str__(self) -> str:
        return f"{self.question.text}"


class AnswerChoice(models.Model):
    answer = models.ForeignKey(Answer, on_delete=models.CASCADE, related_name="answer_choices")
    choice = models.ForeignKey(Choice, on_delete=models.CASCADE)

    class Meta:
        unique_together = [("answer", "choice")]
