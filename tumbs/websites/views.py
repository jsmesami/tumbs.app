from django.shortcuts import render
from django.views.decorators.http import require_GET

from tumbs.accounts.decorators import auth_required
from tumbs.websites.models import Image, Page, Website


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
        "customer_id": website.customer_id,
        "name": website.name,
        "pages": list(map(prepare_page, website.pages.all())),
        "images": list(map(prepare_image, website.images.all())),
    }


@require_GET
@auth_required
def websites_admin_view(request):
    customer_id = request.session["customer"]["id"]
    websites = map(prepare_website, Website.objects.filter(customer_id=customer_id).order_by("pk"))
    context = {"websites": list(websites)}
    return render(request, "pages/websites_admin.html", context)
