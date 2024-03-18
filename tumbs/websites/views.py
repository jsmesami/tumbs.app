import json
import sys
from inspect import getmembers, isfunction

from django.forms import model_to_dict
from django.shortcuts import render
from django.utils.translation import get_language
from django.views.decorators.http import require_GET

from tumbs.accounts.decorators import auth_required
from tumbs.websites import api
from tumbs.websites.models import Website
from tumbs.websites.utils.languages import LANG_CODES, LANGUAGES


def _prepare_website(website):
    return model_to_dict(website, ["id", "name", "language", "region", "domain"]) | {
        "pages": [
            model_to_dict(page, fields=["id", "title", "description", "content"]) | {"order": page.order}
            for page in website.pages.all()
        ],
        "images": [model_to_dict(image, fields=["id", "url", "alt", "caption"]) for image in website.images.all()],
    }


def _get_api_endpoints(server_uri):
    """
    Reads CMS API module to find available endpoints. Returns them in a dictionary {name: {uri: method:}}
    """
    cms_module = sys.modules[api.__name__]
    operations = (func.__dict__.get("_ninja_operation") for _, func in getmembers(cms_module, isfunction))

    return {
        op.view_func.__name__: {
            "method": op.methods[0],
            "uri": f"{server_uri}/api/cms{op.path}",
        }
        for op in filter(None, operations)
    }


@require_GET
@auth_required
def websites_cms(request):
    server_uri = request.build_absolute_uri("/")[:-1]
    customer_id = request.session["customer"]["id"]
    current_language = get_language()
    websites = [_prepare_website(ws) for ws in Website.objects.valid().filter(customer_id=customer_id)]
    context = {
        "js_init": json.dumps(
            {
                "websites": websites,
                "endpoints": _get_api_endpoints(server_uri),
                "languages": LANGUAGES,
                "currentLanguage": current_language if current_language in LANG_CODES else "en",
                "regions": [(code, str(name)) for code, name in Website.Regions.choices],
            }
        )
    }
    return render(request, "pages/websites.html", context)
