from functools import lru_cache

from django.conf import settings
from django.http import HttpResponseForbidden
from django.shortcuts import redirect
from django.urls import reverse
from django.views.decorators.http import require_GET
from kinde_sdk.exceptions import KindeTokenException
from kinde_sdk.kinde_api_client import GrantType, KindeApiClient


@lru_cache
def get_auth_client(**kwargs):
    defaults = {
        "domain": settings.KINDE_ISSUER_URL,
        "client_id": settings.KINDE_CLIENT_ID,
        "client_secret": settings.KINDE_CLIENT_SECRET,
        "grant_type": GrantType.AUTHORIZATION_CODE,
        "callback_url": settings.KINDE_CALLBACK_URL,
    }

    return KindeApiClient(**(defaults | kwargs))


@require_GET
def sign_in(request):
    if request.session.get("customer"):
        return redirect("home")

    return redirect(get_auth_client().get_login_url())


@require_GET
def sign_up(request):
    if request.session.get("customer"):
        return redirect("home")

    return redirect(get_auth_client().get_register_url())


@require_GET
def sign_out(request):
    if not request.session.get("customer"):
        return redirect("home")

    request.session.clear()

    return redirect(get_auth_client().logout(redirect_to=request.build_absolute_uri(reverse("home"))))


@require_GET
def verify(request):
    auth_client = get_auth_client()
    auth_client.fetch_token(authorization_response=request.build_absolute_uri())

    if auth_client.is_authenticated():
        try:
            request.session["customer"] = auth_client.get_user_details()
        except KindeTokenException:
            return HttpResponseForbidden()

    return redirect("home")
