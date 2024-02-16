from django.urls import path

from tumbs.websites import views

app_name = "websites"

urlpatterns = [
    path("", view=views.websites_cms, name="websites_cms"),
]
