import logging
from typing import List, Optional

from django.conf import settings
from django.core.exceptions import ValidationError as DjangoValidationError
from django.http import Http404
from django.shortcuts import get_object_or_404
from django.utils.translation import gettext_lazy as _
from ipware import get_client_ip
from ninja import File, Router, Schema, UploadedFile
from ninja.errors import AuthenticationError, ValidationError

from tumbs.websites.models import Image, Page, Website

router = Router(auth=lambda request: request.session.get("customer"))
logger = logging.getLogger(__name__)


class PageSchema(Schema):
    id: int
    title: str
    description: str
    order: int
    content: list


class PageCreateSchema(Schema):
    website_id: int
    title: str = ""
    description: str = ""
    order: Optional[int] = None
    content: list = []


class PageUpdateSchema(Schema):
    title: str = ""
    description: str = ""
    order: Optional[int] = None
    content: list = []


class ImageSchema(Schema):
    id: int
    file: str
    alt: str
    caption: str


class ImageCreateSchema(Schema):
    website_id: int
    alt: str = ""
    caption: str = ""


class ImageUpdateSchema(Schema):
    alt: str = ""
    caption: str = ""


class WebsiteSchema(Schema):
    id: int
    name: str
    language: str
    region: str
    domain: str
    pages: List[PageSchema]
    images: List[ImageSchema]


class WebsiteCreateUpdateSchema(Schema):
    name: str
    domain: Optional[str] = None
    language: Optional[str] = None
    region: Optional[str] = None


def ensure_customer_id(request):
    """
    Get customer ID from current session. Raise Http403 when not found.
    """
    try:
        return request.session["customer"]["id"]
    except KeyError as err:
        logger.warning("Unauthenticated user tried to access CMS API")
        raise AuthenticationError() from err


def ensure_website_owner(request, website_id):
    """
    Check if a website with website_id exists and is owned by current customer. Raise Http404 when not.
    """
    try:
        return get_object_or_404(
            Website.objects.valid().only("id"), customer_id=ensure_customer_id(request), id=website_id
        )
    except Http404 as e:
        logger.warning(
            "User %s failed to access website <websites.Website %s>", request.session["customer"]["id"], website_id
        )
        raise e


def delete_orphaned_images(website):
    """
    Scan for images referenced by all widgets on all pages and mark the rest of them as deleted.
    """

    def gather_referenced_image_ids():
        for page in website.pages.valid():
            for widget in page.content:
                if iid := widget.get("imageId"):
                    yield iid
                if iids := widget.get("imageIds"):
                    yield from iids

    iids = gather_referenced_image_ids()
    website.images.exclude(id__in=iids).update(deleted=True)


# ---------------- Websites


@router.get("/websites", response=List[WebsiteSchema])
def list_websites(request):
    return Website.objects.valid().filter(customer_id=ensure_customer_id(request))


@router.post("/websites", response={201: WebsiteSchema})
def create_website(request, payload: WebsiteCreateUpdateSchema):
    ws = Website(customer_id=ensure_customer_id(request))
    for attr, value in payload.dict().items():
        if value is not None:
            setattr(ws, attr, value)
    ws.save()
    logger.info("User %s CREATED website %s", request.session["customer"]["id"], repr(ws))
    return 201, ws


@router.get("/websites/{website_id}", response=WebsiteSchema)
def read_website(request, website_id: int):
    return get_object_or_404(Website.objects.valid(), customer_id=ensure_customer_id(request), id=website_id)


@router.put("/websites/{website_id}", response=WebsiteSchema)
def update_website(request, website_id: int, payload: WebsiteCreateUpdateSchema):
    ws = get_object_or_404(Website.objects.valid(), customer_id=ensure_customer_id(request), id=website_id)
    for attr, value in payload.dict().items():
        if value is not None:
            setattr(ws, attr, value)
    ws.save()
    return ws


@router.delete("/websites/{website_id}")
def delete_website(request, website_id: int):
    ws = get_object_or_404(Website.objects.valid(), customer_id=ensure_customer_id(request), id=website_id)
    ws.deleted = True
    ws.save()
    ws.pages.update(deleted=True)
    ws.images.update(deleted=True)
    logger.info("User %s DELETED website %s", request.session["customer"]["id"], repr(ws))
    return {"success": True}


# ---------------- Pages


@router.post("/pages", response={201: PageSchema})
def create_page(request, payload: PageCreateSchema):
    ws = ensure_website_owner(request, payload.website_id)
    max_pages = settings.CMS_PAGES_MAX_PER_WEBSITE

    if ws.pages.count() >= max_pages:
        logger.warning(
            "User %s tried to exceed max pages (%s) per website %s",
            request.session["customer"]["id"],
            max_pages,
            repr(ws),
        )
        raise ValidationError(errors=[{"msg": _("Maximum pages per website is {max}.").format(max=max_pages)}])

    page = Page.objects.create(**payload.dict())
    logger.info("User %s CREATED page %s", request.session["customer"]["id"], repr(page))
    return 201, page


@router.get("/pages/{page_id}", response=PageSchema)
def read_page(request, page_id: int):
    return get_object_or_404(Page.objects.valid(), website__customer_id=ensure_customer_id(request), id=page_id)


@router.put("/pages/{page_id}", response=PageSchema)
def update_page(request, page_id: int, payload: PageUpdateSchema):
    page = get_object_or_404(Page.objects.valid(), website__customer_id=ensure_customer_id(request), id=page_id)
    for attr, value in payload.dict().items():
        setattr(page, attr, value)
    page.save()
    delete_orphaned_images(page.website)
    return page


@router.delete("/pages/{page_id}")
def delete_page(request, page_id: int):
    page = get_object_or_404(Page.objects.valid(), website__customer_id=ensure_customer_id(request), id=page_id)
    page.deleted = True
    page.save()
    delete_orphaned_images(page.website)
    logger.info("User %s DELETED page %s", request.session["customer"]["id"], repr(page))
    return {"success": True}


# ---------------- Images


@router.post("/images", response={201: ImageSchema})
def create_image(request, image_file: File[UploadedFile], payload: ImageCreateSchema):
    ensure_website_owner(request, payload.website_id)
    ip, _trusted_route = get_client_ip(request)
    image = Image(**payload.dict(), meta={"IP": ip}, file=image_file)

    try:
        image.full_clean()
    except DjangoValidationError as err:
        raise ValidationError(errors=[{"msg": msg} for msg in err.messages]) from err

    image.file.save("file.jpg", image_file)
    return 201, image


@router.get("/images/{image_id}", response=ImageSchema)
def read_image(request, image_id: int):
    return get_object_or_404(Image.objects.valid(), website__customer_id=ensure_customer_id(request), id=image_id)


@router.put("/images/{image_id}", response=ImageSchema)
def update_image(request, image_id: int, payload: ImageUpdateSchema):
    image = get_object_or_404(Image.objects.valid(), website__customer_id=ensure_customer_id(request), id=image_id)
    for attr, value in payload.dict().items():
        setattr(image, attr, value)
    image.save()
    return image


@router.delete("/images/{image_id}")
def delete_image(request, image_id: int):
    image = get_object_or_404(Image.objects.valid(), website__customer_id=ensure_customer_id(request), id=image_id)
    image.deleted = True
    image.save()
    return {"success": True}
