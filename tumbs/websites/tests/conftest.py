# pylint: disable=W0621, R0801
import random
import string
from io import BytesIO

import pytest
from django.conf import settings

TESTS_DIR = "tumbs/websites/tests"

with open(settings.BASE_DIR / TESTS_DIR / "data/small_image.jpg", "rb") as image_file:
    SMALL_IMAGE_DATA_JPG = image_file.read()

with open(settings.BASE_DIR / TESTS_DIR / "data/larger_image.jpg", "rb") as image_file:
    LARGER_IMAGE_DATA_JPG = image_file.read()

with open(settings.BASE_DIR / TESTS_DIR / "data/small_image.png", "rb") as image_file:
    SMALL_IMAGE_DATA_PNG = image_file.read()

EXIF_IMAGE_GPS = settings.BASE_DIR / TESTS_DIR / "data/exif_gps.jpg"

EXIF_IMAGE_CORRUPTED = settings.BASE_DIR / TESTS_DIR / "data/exif_corrupted.jpg"


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
