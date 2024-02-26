from PIL import Image

from tumbs.websites.utils import exif

from .conftest import EXIF_IMAGE_CORRUPTED, EXIF_IMAGE_GPS


def test_location_creation():
    with Image.open(EXIF_IMAGE_GPS) as image:
        exif_data = image.getexif()
        assert exif.get_location(exif_data) == {"lat": 43.46715666666389, "lng": 11.885394999997223}
        assert exif.get_creation_time(exif_data) == "2008:10:22 16:29:49"


def test_corrupted():
    with Image.open(EXIF_IMAGE_CORRUPTED) as image:
        exif_data = image.getexif()
        assert exif.get_location(exif_data) is None
        assert exif.get_creation_time(exif_data) is None
