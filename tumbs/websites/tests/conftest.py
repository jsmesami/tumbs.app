# pylint: disable=W0621, R0801
import random
import string
from io import BytesIO

import pytest
from django.conf import settings
from django.core.files.base import ContentFile
from django.db import connection
from psycopg.sql import SQL, Identifier

from tumbs.websites.models import Image, Page, Website

TESTS_DIR = "tumbs/websites/tests"

with open(settings.BASE_DIR / TESTS_DIR / "data/small_image.jpg", "rb") as image_file:
    SMALL_IMAGE_DATA_JPG = image_file.read()


with open(settings.BASE_DIR / TESTS_DIR / "data/larger_image.jpg", "rb") as image_file:
    LARGER_IMAGE_DATA_JPG = image_file.read()

with open(settings.BASE_DIR / TESTS_DIR / "data/small_image.png", "rb") as image_file:
    SMALL_IMAGE_DATA_PNG = image_file.read()


@pytest.fixture
def random_string():
    return lambda length: "".join(random.choice(string.ascii_lowercase) for _ in range(length))


@pytest.fixture(autouse=True)
def set_default_language(settings):
    settings.LANGUAGE_CODE = "en"


@pytest.fixture(autouse=True)
def set_media_root(settings):
    settings.MEDIA_ROOT = settings.BASE_DIR / TESTS_DIR / "media"


@pytest.fixture
def authorized_client(client):
    session = client.session
    session["customer"] = {"id": 1}
    session.save()
    return client


@pytest.fixture
def truncate_table():
    def closure(model):
        table_name = Identifier(model._meta.db_table)
        with connection.cursor() as cursor:
            cursor.execute(SQL("TRUNCATE TABLE {} RESTART IDENTITY CASCADE").format(table_name))

    return closure


@pytest.fixture
def small_image_jpg():
    def closure(name):
        image_bytes = BytesIO(SMALL_IMAGE_DATA_JPG)
        image_bytes.name = name
        return image_bytes

    return closure


@pytest.fixture
def larger_image_jpg():
    def closure(name):
        image_bytes = BytesIO(LARGER_IMAGE_DATA_JPG)
        image_bytes.name = name
        return image_bytes

    return closure


@pytest.fixture
def new_website(authorized_client, random_string):
    return lambda: Website.objects.create(
        customer_id=authorized_client.session["customer"]["id"], name=random_string(8)
    )


@pytest.fixture
def new_image():
    return lambda website: Image.objects.create(
        website=website,
        file=ContentFile(SMALL_IMAGE_DATA_JPG, name="test.jpg"),
    )


@pytest.fixture
def new_page():
    return lambda website: Page.objects.create(website=website)
