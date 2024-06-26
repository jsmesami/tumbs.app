# pylint: disable=R0801
import uuid

import pytest
from django.core.files.base import ContentFile
from django.urls import reverse
from rest_framework import status

from tumbs.websites.tests import conftest


@pytest.mark.django_db
@pytest.mark.parametrize(
    "method, url",
    (
        ("get", reverse("api:image-list")),
        ("post", reverse("api:image-list")),
        ("get", reverse("api:image-detail", args=[uuid.uuid4()])),
        ("put", reverse("api:image-detail", args=[uuid.uuid4()])),
        ("patch", reverse("api:image-detail", args=[uuid.uuid4()])),
        ("delete", reverse("api:image-detail", args=[uuid.uuid4()])),
    ),
)
def test_unauthorized(client, method, url):
    response = getattr(client, method)(url, content_type="application/json")
    assert response.status_code == status.HTTP_403_FORBIDDEN
    assert response.json() == {
        "type": "client_error",
        "errors": [
            {
                "code": "not_authenticated",
                "detail": "Authentication credentials were not provided.",
                "attr": None,
            }
        ],
    }


@pytest.mark.django_db
def test_create_read_update_delete(authorized_client, new_website, small_image_jpg):
    website = new_website()

    # ---------------- Create
    fields = {
        "alt": "A squirrel wearing a tiny asonaut helmet, floating on a cheeseburger through outer space.",
        "caption": "Ludicrous image",
        "website_id": website["id"],
    }

    provided = fields
    expected = fields

    response = authorized_client.post(
        reverse("api:image-list"),
        data=provided | {"file": small_image_jpg("test.jpg")},
    )

    assert response.status_code == status.HTTP_201_CREATED
    response = response.json()
    image_id = response["id"]
    website_id_hex = uuid.UUID(website["id"]).hex
    expected |= {"id": image_id}
    assert response.pop("file").startswith(f"http://media.testserver/ws-{website_id_hex}/")
    assert response == expected

    # ---------------- Read
    response = authorized_client.get(
        reverse("api:image-detail", args=[image_id]),
        provided,
        content_type="application/json",
    )
    assert response.status_code == status.HTTP_200_OK
    response = response.json()
    assert response.pop("file").startswith(f"http://media.testserver/ws-{website_id_hex}/")
    assert response == expected

    # ---------------- Update
    fields = {
        "alt": "A penguin in a tuxedo attempting to order sushi at a fancy underwater restaurant.",
        "caption": "Farcical image",
    }
    provided |= fields
    expected |= fields

    response = authorized_client.patch(
        reverse("api:image-detail", args=[image_id]),
        provided,
        content_type="application/json",
    )
    assert response.status_code == status.HTTP_200_OK
    response = response.json()
    assert response.pop("file").startswith(f"http://media.testserver/ws-{website_id_hex}/")
    assert response == expected

    # ---------------- Delete
    response = authorized_client.delete(
        reverse("api:image-detail", args=[image_id]),
        content_type="application/json",
    )
    assert response.status_code == status.HTTP_204_NO_CONTENT


@pytest.mark.django_db
def test_delete_list(authorized_client, new_website, new_image):
    website = new_website()
    image1 = new_image(website)
    image2 = new_image(website)

    response = authorized_client.delete(
        reverse("api:image-detail", args=[image2["id"]]),
        content_type="application/json",
    )
    assert response.status_code == status.HTTP_204_NO_CONTENT

    response = authorized_client.get(
        reverse("api:image-list"),
        content_type="application/json",
    )
    assert response.status_code == status.HTTP_200_OK
    assert response.json() == [image1]

    expected = website | {"images": [image1], "pages": []}

    response = authorized_client.get(
        reverse("api:website-detail", args=[website["id"]]),
        content_type="application/json",
    )
    assert response.status_code == status.HTTP_200_OK
    assert response.json() == expected


@pytest.mark.django_db
def test_create_too_large(settings, authorized_client, new_website):
    settings.CMS_IMAGE_ALLOWED_MAX_SIZE = 700
    website = new_website()

    response = authorized_client.post(
        reverse("api:image-list"),
        data={
            "website_id": website["id"],
            "file": ContentFile(conftest.LARGER_IMAGE_DATA_JPG, name="test.jpg"),
        },
    )
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert response.json() == {
        "type": "validation_error",
        "errors": [
            {
                "code": "invalid",
                "detail": "File too large. Size should not exceed 0.00 MiB.",
                "attr": "file",
            }
        ],
    }


@pytest.mark.django_db
def test_create_unsupported(authorized_client, new_website):
    website = new_website()

    response = authorized_client.post(
        reverse("api:image-list"),
        data={
            "website_id": website["id"],
            "file": ContentFile(conftest.SMALL_IMAGE_DATA_PNG, name="test.jpg"),
        },
    )
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert response.json() == {
        "type": "validation_error",
        "errors": [
            {
                "code": "invalid",
                "detail": "File type 'image/png' is not supported.",
                "attr": "file",
            }
        ],
    }
