from django.urls import path

from .views import ImageDetail, ImageList

urlpatterns = [
    path("", ImageList.as_view(), name="image-list"),
    path("<uuid:pk>/", ImageDetail.as_view(), name="image-detail"),
]
