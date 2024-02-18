import pytest
from django.urls import reverse

from tumbs.websites.models import Website


@pytest.mark.django_db
def test_unauthorized(client):
    actions = (
        (client.post, reverse("api-1.0.0:create_page")),
        (client.get, reverse("api-1.0.0:read_page", args=[1])),
        (client.put, reverse("api-1.0.0:update_page", args=[1])),
        (client.delete, reverse("api-1.0.0:delete_page", args=[1])),
    )
    for method, url in actions:
        response = method(url, content_type="application/json")
        assert response.status_code == 401
        assert response.json() == {"detail": "Unauthorized"}


@pytest.mark.django_db
def test_create_read_update_delete(authorized_client, truncate_table, new_website):
    truncate_table(Website)

    website = new_website(authorized_client.session["customer"]["id"])

    # ---------------- Create
    fields = {
        "title": "Little Page of Horrors",
        "description": "Delves into how individual lives and decisions contribute to the pattern of human existence.",
        "content": {"A": ["B", "C"]},
    }

    page_id = 1
    provided = {"website_id": website.pk} | fields
    expected = {"id": page_id} | fields

    response = authorized_client.post(
        reverse("api-1.0.0:create_page"),
        provided,
        content_type="application/json",
    )
    assert response.status_code == 201
    assert response.json() == expected

    # ---------------- Read
    response = authorized_client.get(
        reverse("api-1.0.0:read_page", args=[page_id]),
        provided,
        content_type="application/json",
    )
    assert response.status_code == 200
    assert response.json() == expected

    # ---------------- Update
    fields = {
        "title": "Pages of Possibility",
        "description": "Motivational or inspirational read, encouraging readers to turn the pages of their own lives.",
        "content": {"X": ["Y", "Z"]},
    }
    provided |= fields
    expected |= fields

    response = authorized_client.put(
        reverse("api-1.0.0:update_page", args=[page_id]),
        provided,
        content_type="application/json",
    )
    assert response.status_code == 200
    assert response.json() == expected

    # ---------------- Delete
    response = authorized_client.delete(
        reverse("api-1.0.0:delete_page", args=[page_id]),
        content_type="application/json",
    )
    assert response.status_code == 200
    assert response.json() == {"success": True}
