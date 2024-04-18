from functools import wraps

from django.conf import settings
from django.shortcuts import redirect


def auth_required(view_func):

    @wraps(view_func)
    def closure(request, **kwargs):
        if request.session.get("customer"):
            return view_func(request, **kwargs)
        elif settings.DEBUG:
            request.session["customer"] = {"email": "test@example.com", "id": "test"}
            return view_func(request, **kwargs)

        return redirect("accounts:sign_in")

    return closure
