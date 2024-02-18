import json

import pytest
from django.urls import reverse

from tumbs.websites.models import Website


@pytest.mark.django_db
def test_unauthorized(client):
    actions = (
        (client.post, reverse("api-1.0.0:create_image")),
        (client.get, reverse("api-1.0.0:read_image", args=[1])),
        (client.put, reverse("api-1.0.0:update_image", args=[1])),
        (client.delete, reverse("api-1.0.0:delete_image", args=[1])),
    )
    for method, url in actions:
        response = method(url, content_type="application/json")
        assert response.status_code == 401
        assert response.json() == {"detail": "Unauthorized"}


@pytest.mark.django_db
def test_create_read_update_delete(authorized_client, truncate_table, new_website, small_image_jpg):
    truncate_table(Website)
    website = new_website(authorized_client.session["customer"]["id"])

    # ---------------- Create
    alt = "A squirrel wearing a tiny astronaut helmet, floating on a cheeseburger through outer space."
    caption = "Ludicrous image"
    image_id = 1
    provided = {"website_id": website.pk, "alt": alt, "caption": caption}
    expected = {"id": image_id, "alt": alt, "caption": caption}

    response = authorized_client.post(
        reverse("api-1.0.0:create_image"),
        data={
            "payload": json.dumps(provided),
            "image_file": small_image_jpg("test.jpg"),
        },
    )

    assert response.status_code == 201
    response = response.json()
    path = response.pop("file")
    assert path.startswith(f"/media/website/{website.pk}/")
    assert response == expected

    # ---------------- Read
    response = authorized_client.get(
        reverse("api-1.0.0:read_image", args=[image_id]),
        provided,
        content_type="application/json",
    )
    assert response.status_code == 200
    response = response.json()
    path = response.pop("file")
    assert path.startswith(f"/media/website/{website.pk}/")
    assert response == expected

    # ---------------- Update
    alt = "A penguin in a tuxedo attempting to order sushi at a fancy underwater restaurant."
    caption = "Farcical image"
    provided = {"website_id": website.pk, "alt": alt, "caption": caption}
    expected = {"id": image_id, "alt": alt, "caption": caption}

    response = authorized_client.put(
        reverse("api-1.0.0:update_image", args=[image_id]),
        provided,
        content_type="application/json",
    )
    assert response.status_code == 200
    response = response.json()
    path = response.pop("file")
    assert path.startswith(f"/media/website/{website.pk}/")
    assert response == expected

    # ---------------- Delete
    response = authorized_client.delete(
        reverse("api-1.0.0:delete_image", args=[image_id]),
        content_type="application/json",
    )
    assert response.status_code == 200
    assert response.json() == {"success": True}