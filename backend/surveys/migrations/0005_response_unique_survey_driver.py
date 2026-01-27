from django.db import migrations
from django.db.models import Count, Max


def dedupe_responses(apps, schema_editor):
    Response = apps.get_model("surveys", "Response")
    duplicates = (
        Response.objects.values("survey_id", "driver_id")
        .annotate(total=Count("id"), max_id=Max("id"))
        .filter(total__gt=1)
    )
    for row in duplicates:
        Response.objects.filter(
            survey_id=row["survey_id"],
            driver_id=row["driver_id"],
        ).exclude(id=row["max_id"]).delete()


class Migration(migrations.Migration):
    dependencies = [
        ("surveys", "0004_remove_response_unique_together"),
    ]

    operations = [
        migrations.RunPython(dedupe_responses, migrations.RunPython.noop),
        migrations.AlterUniqueTogether(
            name="response",
            unique_together={("survey", "driver")},
        ),
    ]
