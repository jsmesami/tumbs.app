import logging

from django.contrib.auth.decorators import login_required
from django.shortcuts import render
from django.views.decorators.http import require_http_methods

from tumbs.websites.models import Image, Page, Website

logger = logging.getLogger("websites")


def prepare_page(page: Page):
    return {
        "id": page.id,
        "url": page.title,
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
        "name": website.name,
        "pages": list(map(prepare_page, website.pages.all())),
        "images": list(map(prepare_image, website.images.all())),
    }


@login_required
@require_http_methods(["GET"])
def websites_admin_view(request):
    websites = map(prepare_website, request.user.websites.order_by("pk"))
    # logger.info(request.user.websites)
    context = {"websites": list(websites)}
    return render(request, "pages/websites_admin.html", context)
