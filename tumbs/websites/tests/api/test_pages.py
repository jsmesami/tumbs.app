# pylint: disable=R0801
import pytest
from django.forms import model_to_dict
from django.urls import reverse

from tumbs.websites.models import Website


@pytest.mark.django_db
@pytest.mark.parametrize(
    "method, url",
    (
        ("post", reverse("api-1.0.0:create_page")),
        ("get", reverse("api-1.0.0:read_page", args=[1])),
        ("put", reverse("api-1.0.0:update_page", args=[1])),
        ("delete", reverse("api-1.0.0:delete_page", args=[1])),
    ),
)
def test_unauthorized(client, method, url):
    response = getattr(client, method)(url, content_type="application/json")
    assert response.status_code == 401
    assert response.json() == {"detail": "Unauthorized"}


@pytest.mark.django_db
def test_create_read_update_delete(authorized_client, truncate_table, new_website):
    truncate_table(Website)
    website = new_website()

    # ---------------- Create
    fields = {
        "title": "Little Page of Horrors",
        "description": "Delves into how individual lives and decisions contribute to the pattern of human existence.",
        "order": 0,
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


@pytest.mark.django_db
def test_delete_list(authorized_client, new_website, new_page):
    website = new_website()
    page1 = new_page(website)
    page2 = new_page(website)

    response = authorized_client.delete(
        reverse("api-1.0.0:delete_page", args=[page2.pk]),
        content_type="application/json",
    )
    assert response.status_code == 200
    assert response.json() == {"success": True}

    website_dict = model_to_dict(website, fields=["id", "name", "language", "region", "domain"])
    page1_dict = model_to_dict(page1, fields=["id", "title", "description", "content"]) | {
        "order": 0,  # <- model_to_dict doesn't return non-editable fields
    }
    expected = website_dict | {"images": [], "pages": [page1_dict]}

    print(page1.__dict__)
    print(page1_dict)
    response = authorized_client.get(
        reverse("api-1.0.0:read_website", args=[website.pk]),
        content_type="application/json",
    )
    assert response.status_code == 200
    assert response.json() == expected
