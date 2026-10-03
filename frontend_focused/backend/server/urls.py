"""
URL configuration for server project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
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
