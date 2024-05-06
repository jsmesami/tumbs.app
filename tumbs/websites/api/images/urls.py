from django.urls import path

from .views import ImageDetail, ImageList

urlpatterns = [
    path("", ImageList.as_view(), name="image-list"),
    path("<int:pk>/", ImageDetail.as_view(), name="image-detail"),
]
