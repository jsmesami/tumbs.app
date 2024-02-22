import json

from django.shortcuts import render
from django.views.decorators.http import require_GET

from tumbs.accounts.decorators import auth_required
from tumbs.websites.models import Image, Page, Website


def prepare_page(page: Page):
    return {
        "id": page.id,
        "title": page.title,
        "description": page.description,
        "content": page.content,
    }


def prepare_image(image: Image):
    return {
        "id": image.id,
        "url": image.file.url,
        "alt": image.alt,
        "caption": image.caption,
    }


def prepare_website(website: Website):
    return {
        "id": website.id,
        "customer_id": website.customer_id,
        "name": website.name,
        "pages": [prepare_page(page) for page in website.pages.all()],
        "images": [prepare_image(image) for image in website.images.all()],
    }


@require_GET
@auth_required
def websites_cms(request):
    customer_id = request.session["customer"]["id"]
    websites = [
        prepare_website(ws) for ws in Website.objects.valid().filter(customer_id=customer_id).order_by("created")
    ]
    context = {"js_init": json.dumps({"websites": websites})}
    return render(request, "pages/websites.html", context)
