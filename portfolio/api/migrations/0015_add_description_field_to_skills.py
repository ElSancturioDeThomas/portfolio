# Generated manually to fix description field constraint issue

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("api", "0014_remove_project_skills_and_skill_description"),
    ]

    operations = [
        migrations.AddField(
            model_name="skills",
            name="description",
            field=models.TextField(blank=True, default="", help_text="Description of the skill (optional)"),
        ),
    ]

