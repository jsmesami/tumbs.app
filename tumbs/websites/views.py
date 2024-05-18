import orjson
from django.shortcuts import render
from django.utils.translation import get_language
from django.views.decorators.http import require_GET

from tumbs.accounts.decorators import auth_required

from .api import ENDPOINTS  # pylint: disable=E0611
from .api.websites.serializers import WebsiteSerializer
from .models import Website
from .utils.languages import LANG_CODES, LANGUAGES


@require_GET
@auth_required
def websites_cms(request):
    customer_id = request.session["customer"]["id"]
    websites = [WebsiteSerializer(ws).data for ws in Website.objects.valid().filter(customer_id=customer_id)]
    regions = [(code, str(name)) for code, name in Website.Regions.choices]
    current_language = get_language()
    context = {
        "js_init": orjson.dumps(  # pylint: disable=E1101
            {
                "websites": websites,
                "endpoints": ENDPOINTS,
                "languages": LANGUAGES,
                "currentLanguage": current_language if current_language in LANG_CODES else "en",
                "regions": regions,
            }
        ).decode("utf8")
    }
    return render(request, "pages/websites.html", context)
