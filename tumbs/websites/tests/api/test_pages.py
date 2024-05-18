# pylint: disable=R0801
import uuid

import pytest
from django.urls import reverse
from rest_framework import status


@pytest.mark.django_db
@pytest.mark.parametrize(
    "method, url",
    (
        ("get", reverse("api:page-list")),
        ("post", reverse("api:page-list")),
        ("get", reverse("api:page-detail", args=[uuid.uuid4()])),
        ("put", reverse("api:page-detail", args=[uuid.uuid4()])),
        ("patch", reverse("api:page-detail", args=[uuid.uuid4()])),
        ("delete", reverse("api:page-detail", args=[uuid.uuid4()])),
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
def test_create_read_update_delete(authorized_client, new_website):
    website = new_website()

    # ---------------- Create
    fields = {
        "title": "Little Page of Horrors",
        "description": "Delves into how individual lives and decisions contribute to the pattern of human existence.",
        "order": 0,
        "content": [{"A": ["B", "C"]}],
        "website_id": website["id"],
    }

    provided = fields
    expected = fields

    response = authorized_client.post(
        reverse("api:page-list"),
        provided,
        content_type="application/json",
    )
    assert response.status_code == status.HTTP_201_CREATED
    response = response.json()
    page_id = response["id"]
    expected |= {"id": page_id}
    assert response == expected

    # ---------------- Read
    response = authorized_client.get(
        reverse("api:page-detail", args=[page_id]),
        provided,
        content_type="application/json",
    )
    assert response.status_code == status.HTTP_200_OK
    assert response.json() == expected

    # ---------------- Update
    fields = {
        "title": "Pages of Possibility",
        "description": "Motivational or inspirational read, encouraging readers to turn the pages of their own lives.",
        "content": [{"X": ["Y", "Z"]}],
    }
    provided |= fields
    expected |= fields

    response = authorized_client.patch(
        reverse("api:page-detail", args=[page_id]),
        provided,
        content_type="application/json",
    )
    assert response.status_code == status.HTTP_200_OK
    assert response.json() == expected

    # ---------------- Delete
    response = authorized_client.delete(
        reverse("api:page-detail", args=[page_id]),
        content_type="application/json",
    )
    assert response.status_code == status.HTTP_204_NO_CONTENT


@pytest.mark.django_db
def test_delete_list(authorized_client, new_website, new_page):
    website = new_website()
    page1 = new_page(website)
    page2 = new_page(website)

    response = authorized_client.delete(
        reverse("api:page-detail", args=[page2["id"]]),
        content_type="application/json",
    )
    assert response.status_code == status.HTTP_204_NO_CONTENT

    response = authorized_client.get(
        reverse("api:page-list"),
        content_type="application/json",
    )
    assert response.status_code == status.HTTP_200_OK
    assert response.json() == [page1]

    expected = website | {"images": [], "pages": [page1]}

    response = authorized_client.get(
        reverse("api:website-detail", args=[website["id"]]),
        content_type="application/json",
    )
    assert response.status_code == status.HTTP_200_OK
    assert response.json() == expected


@pytest.mark.django_db
def test_max_pages(settings, authorized_client, new_website, new_page):
    max_pages = 1
    settings.CMS_PAGES_MAX_PER_WEBSITE = max_pages

    website = new_website()
    new_page(website)

    provided = {
        "website_id": website["id"],
        "title": "Home",
        "description": "",
        "content": [],
    }
    expected = {
        "type": "validation_error",
        "errors": [
            {
                "code": "invalid",
                "detail": f"Maximum pages per website is {max_pages}.",
                "attr": "non_field_errors",
            },
        ],
    }

    response = authorized_client.post(
        reverse("api:page-list"),
        provided,
        content_type="application/json",
    )
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert response.json() == expected
