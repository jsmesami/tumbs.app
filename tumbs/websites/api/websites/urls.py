from django.urls import path

from .views import WebsiteDetail, WebsiteList

urlpatterns = [
    path("", WebsiteList.as_view(), name="website-list"),
    path("<int:pk>/", WebsiteDetail.as_view(), name="website-detail"),
]
