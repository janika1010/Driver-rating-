import json

from django.contrib import admin
from django.conf import settings
from django.contrib.auth import get_user_model
from django.contrib.auth.admin import UserAdmin as DjangoUserAdmin
from django.http import HttpResponse, HttpResponseRedirect

from .models import Answer, AnswerChoice, Choice, Driver, Question, Response, Survey


class ChoiceInline(admin.TabularInline):
    model = Choice
    extra = 1


class QuestionInline(admin.TabularInline):
    model = Question
    extra = 1
    min_num = 1
    validate_min = True

    def formfield_for_choice_field(self, db_field, request, **kwargs):
        if db_field.name == "question_type":
            hidden = {Question.TYPE_SINGLE, Question.TYPE_MULTI}
            kwargs["choices"] = [choice for choice in db_field.choices if choice[0] not in hidden]
        return super().formfield_for_choice_field(db_field, request, **kwargs)


admin.site.site_header = "NEXPRESS Delivery"
admin.site.site_title = "NEXPRESS Admin"
admin.site.index_title = "Welcome to NEXPRESS Delivery"

from django.contrib.admin.sites import NotRegistered
from django.contrib.auth.models import Group
from rest_framework.authtoken.models import TokenProxy

for model in (Group, TokenProxy):
    try:
        admin.site.unregister(model)
    except NotRegistered:
        pass

User = get_user_model()
try:
    admin.site.unregister(User)
except NotRegistered:
    pass


@admin.register(User)
class CustomUserAdmin(DjangoUserAdmin):
    list_display = (
        "username_display",
        "email_display",
        "first_name_display",
        "last_name_display",
        "is_staff_display",
    )

    def username_display(self, obj):
        return obj.username

    username_display.short_description = "Хэрэглэгчийн нэр"
    username_display.admin_order_field = "username"

    def email_display(self, obj):
        return obj.email

    email_display.short_description = "И-мэйл"
    email_display.admin_order_field = "email"

    def first_name_display(self, obj):
        return obj.first_name

    first_name_display.short_description = "Нэр"
    first_name_display.admin_order_field = "first_name"

    def last_name_display(self, obj):
        return obj.last_name

    last_name_display.short_description = "Овог"
    last_name_display.admin_order_field = "last_name"

    def is_staff_display(self, obj):
        return obj.is_staff

    is_staff_display.short_description = "Админ эрх"
    is_staff_display.admin_order_field = "is_staff"
    is_staff_display.boolean = True

@admin.register(Survey)
class SurveyAdmin(admin.ModelAdmin):
    list_display = ("title", "slug", "is_active", "created_at")
    list_filter = ("is_active", "created_at")
    search_fields = ("title", "slug")
    inlines = [QuestionInline]
    exclude = ("slug", "is_active")
    change_list_template = "admin/surveys/survey/change_list.html"

    def render_change_form(self, request, context, add=False, change=False, form_url="", obj=None):
        context["show_save_and_add_another"] = False
        context["show_save_and_continue"] = False
        return super().render_change_form(request, context, add, change, form_url, obj)

    def add_view(self, request, form_url="", extra_context=None):
        extra_context = extra_context or {}
        extra_context.setdefault("title", "Судалгаа нэмэх")
        return super().add_view(request, form_url, extra_context)

    def save_model(self, request, obj, form, change):
        if not change:
            obj.is_active = True
        super().save_model(request, obj, form, change)

    def _frontend_surveys_url(self):
        return getattr(settings, "FRONTEND_ADMIN_SURVEYS_URL", "/")

    def _top_redirect(self, url):
        return HttpResponse(
            "<!DOCTYPE html>"
            "<html><head><meta charset='utf-8'></head>"
            "<body><script>"
            f"window.top.location.href = {json.dumps(url)};"
            "</script></body></html>"
        )

    def response_add(self, request, obj, post_url_continue=None):
        return self._top_redirect(self._frontend_surveys_url())

    def response_change(self, request, obj):
        return self._top_redirect(self._frontend_surveys_url())

    class Media:
        js = ("admin/js/question_inline.js?v=3",)

    def get_inline_formsets(self, request, formsets, inline_instances, obj=None):
        inline_admin_formsets = super().get_inline_formsets(
            request, formsets, inline_instances, obj=obj
        )
        for inline_admin_formset in inline_admin_formsets:
            if inline_admin_formset.opts.model is Question:
                original = inline_admin_formset.inline_formset_data

                def inline_formset_data(original=original):
                    data = json.loads(original())
                    data["options"]["addText"] = "Өөр асуулт нэмэх"
                    return json.dumps(data)

                inline_admin_formset.inline_formset_data = inline_formset_data
        return inline_admin_formsets


@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    list_display = ("text", "survey", "question_type", "order")
    list_filter = ("question_type", "survey")
    search_fields = ("text",)
    inlines = [ChoiceInline]

    def formfield_for_choice_field(self, db_field, request, **kwargs):
        if db_field.name == "question_type":
            hidden = {Question.TYPE_SINGLE, Question.TYPE_MULTI}
            kwargs["choices"] = [choice for choice in db_field.choices if choice[0] not in hidden]
        return super().formfield_for_choice_field(db_field, request, **kwargs)


@admin.register(Driver)
class DriverAdmin(admin.ModelAdmin):
    list_display = ("last_name", "name", "phone_number", "car_number", "is_active")
    search_fields = ("last_name", "name", "phone_number", "car_number")
    change_list_template = "admin/surveys/driver/change_list.html"
    change_form_template = "admin/surveys/driver/change_form.html"

    def has_delete_permission(self, request, obj=None):
        return False

    def get_actions(self, request):
        actions = super().get_actions(request)
        if 'delete_selected' in actions:
            del actions['delete_selected']
        return actions

    def render_change_form(self, request, context, add=False, change=False, form_url="", obj=None):
        context["show_save_and_add_another"] = False
        context["show_save_and_continue"] = False
        return super().render_change_form(request, context, add, change, form_url, obj)


@admin.register(Response)
class ResponseAdmin(admin.ModelAdmin):
    list_display = ("survey", "driver", "ip_address", "submitted_at")
    list_filter = ("survey", "submitted_at")
    search_fields = ("driver__name", "driver__last_name", "driver__car_number", "ip_address")


admin.site.register(Answer)
admin.site.register(AnswerChoice)
