from django.urls import include, path

app_name = "tumbs"

urlpatterns = [
    path("websites/", include("tumbs.websites.api.websites.urls")),
    path("pages/", include("tumbs.websites.api.pages.urls")),
    path("images/", include("tumbs.websites.api.images.urls")),
]
