import pytest
from django.core.files.base import ContentFile

from tumbs.websites.api.images.serializers import ImageSerializer
from tumbs.websites.api.websites.serializers import WebsiteSerializer
from tumbs.websites.models import Image, Page, Website

from ...api.pages.serializers import PageSerializer
from ..conftest import SMALL_IMAGE_DATA_JPG


@pytest.fixture
def authorized_client(client):
    session = client.session
    session["customer"] = {"id": 1}
    session.save()
    return client


@pytest.fixture
def new_website(authorized_client, random_string):  # pylint: disable=W0621
    def closure():
        website = Website.objects.create(
            customer_id=authorized_client.session["customer"]["id"],
            name=random_string(8),
        )
        return WebsiteSerializer(website).data

    return closure


@pytest.fixture
def new_image():
    def closure(website):
        image = Image.objects.create(
            website_id=website["id"],
            file=ContentFile(SMALL_IMAGE_DATA_JPG, name="test.jpg"),
        )
        return ImageSerializer(image).data

    return closure


@pytest.fixture
def new_page():
    def closure(website):
        page = Page.objects.create(website_id=website["id"])
        return PageSerializer(page).data

    return closure
