from django.conf import settings
from django.http import HttpResponseForbidden
from django.shortcuts import redirect
from django.urls import reverse
from django.views.decorators.http import require_GET
from kinde_sdk.exceptions import KindeTokenException
from kinde_sdk.kinde_api_client import GrantType, KindeApiClient

AUTH_CLIENT = KindeApiClient(
    domain=settings.KINDE_ISSUER_URL,
    client_id=settings.KINDE_CLIENT_ID,
    client_secret=settings.KINDE_CLIENT_SECRET,
    grant_type=GrantType.AUTHORIZATION_CODE,
    callback_url=settings.KINDE_CALLBACK_URL,
)


@require_GET
def sign_in(request):
    if request.session.get("customer"):
        return redirect("home")

    return redirect(AUTH_CLIENT.get_login_url())


@require_GET
def sign_up(request):
    if request.session.get("customer"):
        return redirect("home")

    return redirect(AUTH_CLIENT.get_register_url())


@require_GET
def sign_out(request):
    if not request.session.get("customer"):
        return redirect("home")

    request.session.clear()

    return redirect(AUTH_CLIENT.logout(redirect_to=request.build_absolute_uri(reverse("home"))))


@require_GET
def verify(request):
    AUTH_CLIENT.fetch_token(authorization_response=request.build_absolute_uri())

    if AUTH_CLIENT.is_authenticated():
        try:
            request.session["customer"] = AUTH_CLIENT.get_user_details()
        except KindeTokenException:
            return HttpResponseForbidden()

    return redirect("home")
