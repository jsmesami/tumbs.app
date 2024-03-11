import itertools
import json

from django.forms import model_to_dict
from django.shortcuts import render
from django.utils.translation import get_language
from django.views.decorators.http import require_GET

from config.urls import api
from tumbs.accounts.decorators import auth_required
from tumbs.websites.models import Website
from tumbs.websites.utils.languages import LANG_CODES, LANGUAGES


def _prepare_website(website):
    return model_to_dict(website, ["id", "name", "language", "region", "domain"]) | {
        "pages": [
            model_to_dict(page, fields=["id", "title", "description", "content"]) for page in website.pages.all()
        ],
        "images": [model_to_dict(image, fields=["id", "url", "alt", "caption"]) for image in website.images.all()],
    }


def _get_api_endpoints(server_uri):
    """
    Reads API schema to find available CMS endpoints. Returns them in a dictionary {name: {uri: method:}}
    """
    paths = api.get_openapi_schema().get_paths()

    def flatten_paths(uri, params):
        yield from ((v["operationId"], uri, method) for method, v in params.items())

    return {
        name.removeprefix("tumbs_websites_api_"): {
            "uri": server_uri + uri,
            "method": method.upper(),
        }
        for name, uri, method in itertools.chain(
            *(flatten_paths(p, params) for p, params in paths.items() if p.startswith("/api/cms/"))
        )
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
