from django.urls import path

import tumbs.websites.views as views

app_name = "websites"

urlpatterns = [
    path("", view=views.websites_cms, name="websites_cms"),
]
