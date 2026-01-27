from django.db import migrations


class Migration(migrations.Migration):
    dependencies = [
        ("surveys", "0003_driver_car_number_driver_last_name_and_more"),
    ]

    operations = [
        migrations.AlterUniqueTogether(
            name="response",
            unique_together=set(),
        ),
    ]
