# pylint: disable=R0801
import json

import pytest
from django.core.files.base import ContentFile
from django.forms.models import model_to_dict
from django.urls import reverse

from tumbs.websites.models import Website
from tumbs.websites.tests import conftest


@pytest.mark.django_db
@pytest.mark.parametrize(
    "method, url",
    (
        ("post", reverse("api-1.0.0:create_image")),
        ("get", reverse("api-1.0.0:read_image", args=[1])),
        ("put", reverse("api-1.0.0:update_image", args=[1])),
        ("delete", reverse("api-1.0.0:delete_image", args=[1])),
    ),
)
def test_unauthorized(client, method, url):
    response = getattr(client, method)(url, content_type="application/json")
    assert response.status_code == 401
    assert response.json() == {"detail": "Unauthorized"}


@pytest.mark.django_db
def test_create_read_update_delete(authorized_client, truncate_table, new_website, small_image_jpg):
    truncate_table(Website)
    website = new_website(authorized_client.session["customer"]["id"])

    # ---------------- Create
    fields = {
        "alt": "A squirrel wearing a tiny astronaut helmet, floating on a cheeseburger through outer space.",
        "caption": "Ludicrous image",
    }
    image_id = 1
    provided = {"website_id": website.pk} | fields
    expected = {"id": image_id} | fields

    response = authorized_client.post(
        reverse("api-1.0.0:create_image"),
        data={
            "payload": json.dumps(provided),
            "image_file": small_image_jpg("test.jpg"),
        },
    )

    assert response.status_code == 201
    response = response.json()
    assert response.pop("file").startswith(f"http://media.testserver/website/{website.pk}/")
    assert response == expected

    # ---------------- Read
    response = authorized_client.get(
        reverse("api-1.0.0:read_image", args=[image_id]),
        provided,
        content_type="application/json",
    )
    assert response.status_code == 200
    response = response.json()
    assert response.pop("file").startswith(f"http://media.testserver/website/{website.pk}/")
    assert response == expected

    # ---------------- Update
    fields = {
        "alt": "A penguin in a tuxedo attempting to order sushi at a fancy underwater restaurant.",
        "caption": "Farcical image",
    }
    provided |= fields
    expected |= fields

    response = authorized_client.put(
        reverse("api-1.0.0:update_image", args=[image_id]),
        provided,
        content_type="application/json",
    )
    assert response.status_code == 200
    response = response.json()
    assert response.pop("file").startswith(f"http://media.testserver/website/{website.pk}/")
    assert response == expected

    # ---------------- Delete
    response = authorized_client.delete(
        reverse("api-1.0.0:delete_image", args=[image_id]),
        content_type="application/json",
    )
    assert response.status_code == 200
    assert response.json() == {"success": True}


@pytest.mark.django_db
def test_delete_list(authorized_client, new_website, new_image):
    website = new_website(authorized_client.session["customer"]["id"])
    image1 = new_image(website)
    image2 = new_image(website)

    response = authorized_client.delete(
        reverse("api-1.0.0:delete_image", args=[image2.pk]),
        content_type="application/json",
    )
    assert response.status_code == 200
    assert response.json() == {"success": True}

    website_dict = model_to_dict(website, fields=["id", "name"])
    image1_dict = model_to_dict(image1, fields=["id", "alt", "caption"]) | {"file": image1.file.url}
    expected = website_dict | {"images": [image1_dict], "pages": []}

    response = authorized_client.get(
        reverse("api-1.0.0:read_website", args=[website.pk]),
        content_type="application/json",
    )
    assert response.status_code == 200
    assert response.json() == expected


@pytest.mark.django_db
def test_create_too_large(authorized_client, new_website):
    website = new_website(authorized_client.session["customer"]["id"])

    response = authorized_client.post(
        reverse("api-1.0.0:create_image"),
        data={
            "payload": json.dumps({"website_id": website.pk}),
            "image_file": ContentFile(conftest.LARGER_IMAGE_DATA_JPG, name="test.jpg"),
        },
    )
    assert response.status_code == 422
    assert response.json() == {"detail": [{"msg": "File too large. Size should not exceed 0.00 MiB."}]}
