from django.apps import AppConfig


# App registration for the "submissions" app; verbose_name is the heading shown in the admin.
class SubmissionsConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "submissions"
    verbose_name = "Submission Tracker"

