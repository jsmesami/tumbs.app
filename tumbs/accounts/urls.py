from django.urls import path

import tumbs.accounts.views as views

app_name = "accounts"

urlpatterns = [
    path("sign-in/", views.sign_in, name="sign_in"),
    path("sign-up/", views.sign_up, name="sign_up"),
    path("sign-out/", views.sign_out, name="sign_out"),
    path("verify/", views.verify, name="verify"),
]
