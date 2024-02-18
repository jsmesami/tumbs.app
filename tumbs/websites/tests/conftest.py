import random
import string
from io import BytesIO

import pytest
from django.conf import settings
from django.db import connection
from psycopg.sql import SQL, Identifier

from tumbs.websites.models import Website

TESTS_DIR = "tumbs/websites/tests"

with open(settings.BASE_DIR / TESTS_DIR / "data/small_image.jpg", "rb") as image_file:
    SMALL_IMAGE_DATA_JPG = image_file.read()


with open(settings.BASE_DIR / TESTS_DIR / "data/larger_image.jpg", "rb") as image_file:
    LARGER_IMAGE_DATA_JPG = image_file.read()


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
@pytest.mark.django_db
def truncate_table():
    def closure(model):
        table_name = Identifier(model._meta.db_table)
        with connection.cursor() as cursor:
            cursor.execute(SQL("TRUNCATE TABLE {} RESTART IDENTITY CASCADE").format(table_name))

    return closure


@pytest.fixture
@pytest.mark.django_db
def new_website(random_string):
    return lambda customer_id: Website.objects.create(customer_id=customer_id, name=random_string(8))


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
