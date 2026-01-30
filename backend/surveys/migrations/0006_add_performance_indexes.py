# Generated manually for performance optimization

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('surveys', '0005_response_unique_survey_driver'),
    ]

    operations = [
        # Add indexes to Response model
        migrations.AlterField(
            model_name='response',
            name='survey',
            field=models.ForeignKey(
                db_index=True,
                on_delete=models.CASCADE,
                related_name='responses',
                to='surveys.survey'
            ),
        ),
        migrations.AlterField(
            model_name='response',
            name='driver',
            field=models.ForeignKey(
                db_index=True,
                on_delete=models.PROTECT,
                related_name='responses',
                to='surveys.driver'
            ),
        ),
        migrations.AlterField(
            model_name='response',
            name='submitted_at',
            field=models.DateTimeField(auto_now_add=True, db_index=True),
        ),
        migrations.AddIndex(
            model_name='response',
            index=models.Index(fields=['survey', 'driver'], name='surveys_res_survey__idx'),
        ),
        migrations.AddIndex(
            model_name='response',
            index=models.Index(fields=['-submitted_at'], name='surveys_res_submitt_idx'),
        ),
        
        # Add indexes to Question model
        migrations.AlterField(
            model_name='question',
            name='survey',
            field=models.ForeignKey(
                db_index=True,
                on_delete=models.CASCADE,
                related_name='questions',
                to='surveys.survey'
            ),
        ),
        migrations.AlterField(
            model_name='question',
            name='order',
            field=models.PositiveIntegerField(db_index=True, default=0, verbose_name='Дараалал'),
        ),
        migrations.AddIndex(
            model_name='question',
            index=models.Index(fields=['survey', 'order', 'id'], name='surveys_ques_survey__idx'),
        ),
        
        # Add indexes to Answer model
        migrations.AlterField(
            model_name='answer',
            name='response',
            field=models.ForeignKey(
                db_index=True,
                on_delete=models.CASCADE,
                related_name='answers',
                to='surveys.response'
            ),
        ),
        migrations.AlterField(
            model_name='answer',
            name='question',
            field=models.ForeignKey(
                db_index=True,
                on_delete=models.CASCADE,
                related_name='answers',
                to='surveys.question'
            ),
        ),
        migrations.AddIndex(
            model_name='answer',
            index=models.Index(fields=['response', 'question'], name='surveys_answ_respons_idx'),
        ),
        
        # Add indexes to Driver model
        migrations.AlterField(
            model_name='driver',
            name='phone_number',
            field=models.CharField(blank=True, db_index=True, max_length=20, null=True, verbose_name='Утасны дугаар'),
        ),
        migrations.AlterField(
            model_name='driver',
            name='car_number',
            field=models.CharField(blank=True, db_index=True, max_length=20, null=True, verbose_name='Машины дугаар'),
        ),
        migrations.AlterField(
            model_name='driver',
            name='is_active',
            field=models.BooleanField(db_index=True, default=True, verbose_name='Идэвхтэй'),
        ),
        migrations.AddIndex(
            model_name='driver',
            index=models.Index(fields=['is_active'], name='surveys_driv_is_acti_idx'),
        ),
        
        # Add indexes to Survey model
        migrations.AlterField(
            model_name='survey',
            name='slug',
            field=models.SlugField(db_index=True, max_length=220, unique=True),
        ),
        migrations.AlterField(
            model_name='survey',
            name='is_active',
            field=models.BooleanField(db_index=True, default=False, verbose_name='Идэвхтэй'),
        ),
    ]
