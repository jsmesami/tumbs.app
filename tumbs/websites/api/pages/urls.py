from django.urls import path

from .views import PageDetail, PageList

urlpatterns = [
    path("", PageList.as_view(), name="page-list"),
    path("<int:pk>/", PageDetail.as_view(), name="page-detail"),
]
