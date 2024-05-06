import json

from django.forms import model_to_dict
from django.shortcuts import render
from django.utils.translation import get_language
from django.views.decorators.http import require_GET

from tumbs.accounts.decorators import auth_required

from .api import ENDPOINTS  # pylint: disable=E0611
from .models import Website
from .utils.languages import LANG_CODES, LANGUAGES


def _prepare_website(website):
    return model_to_dict(website, ["id", "name", "language", "region", "domain"]) | {
        "pages": [
            model_to_dict(page, fields=["id", "title", "description", "content"]) | {"order": page.order}
            for page in website.pages.all()
        ],
        "images": [
            model_to_dict(image, fields=["id", "alt", "caption"]) | {"file": image.file.url}
            for image in website.images.all()
        ],
    }


def _get_websites(customer_id):
    return [_prepare_website(ws) for ws in Website.objects.valid().filter(customer_id=customer_id)]


@require_GET
@auth_required
def websites_cms(request):
    customer_id = request.session["customer"]["id"]
    current_language = get_language()
    context = {
        "js_init": json.dumps(
            {
                "websites": _get_websites(customer_id),
                "endpoints": ENDPOINTS,
                "languages": LANGUAGES,
                "currentLanguage": current_language if current_language in LANG_CODES else "en",
                "regions": [(code, str(name)) for code, name in Website.Regions.choices],
            }
        )
    }
    return render(request, "pages/websites.html", context)
