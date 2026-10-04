"""
URL configuration for the Submission Tracker API.

    /admin/        Django admin, for browsing the seeded data
    /api/          read-only REST resources (submissions, brokers) and their index
    /api/schema/   OpenAPI 3 schema
    /api/docs/     Swagger UI
"""
from django.contrib import admin
from django.urls import include, path
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView
from rest_framework.routers import DefaultRouter

from submissions.views import BrokerViewSet, SubmissionViewSet

# Read-only API resources. DefaultRouter also serves an index of them at /api/.
router = DefaultRouter()
router.register('submissions', SubmissionViewSet, basename='submission')
router.register('brokers', BrokerViewSet, basename='broker')

urlpatterns = [
    path('admin/', admin.site.urls),
    # OpenAPI 3 schema of the API (YAML; ?format=json for JSON) and Swagger UI on top of it.
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    # Every REST endpoint lives under /api/, matching the frontend's default base URL.
    path('api/', include(router.urls)),
]
