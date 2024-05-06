# pylint: disable=R0801
from operator import itemgetter

import pytest
from django.urls import reverse
from rest_framework import status

from tumbs.websites.models import Website


@pytest.mark.django_db
@pytest.mark.parametrize(
    "method, url",
    (
        ("get", reverse("api:website-list")),
        ("post", reverse("api:website-list")),
        ("get", reverse("api:website-detail", args=[1])),
        ("put", reverse("api:website-detail", args=[1])),
        ("patch", reverse("api:website-detail", args=[1])),
        ("delete", reverse("api:website-detail", args=[1])),
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
def test_create_read_list(authorized_client, truncate_table):
    names = ("Eenie", "Meenie", "Miney", "Moe", "🫣🤫🤔")
    src = [{"name": n} for n in names]
    dst = [
        {"id": i, "name": n, "language": "en", "region": "eu", "domain": "", "pages": [], "images": []}
        for i, n in enumerate(names, start=1)
    ]

    truncate_table(Website)

    for provided, expected in zip(src, dst):
        response = authorized_client.post(
            reverse("api:website-list"),
            provided,
            content_type="application/json",
        )
        assert response.status_code == status.HTTP_201_CREATED
        assert response.json() == expected

        response = authorized_client.get(
            reverse("api:website-detail", args=[expected["id"]]),
            content_type="application/json",
        )
        assert response.status_code == status.HTTP_200_OK
        assert response.json() == expected

    response = authorized_client.get(
        reverse("api:website-list"),
        content_type="application/json",
    )
    assert response.status_code == status.HTTP_200_OK
    assert sorted(response.json(), key=itemgetter("id")) == dst


@pytest.mark.django_db(transaction=False)
def test_update_delete(authorized_client, truncate_table, new_website):
    truncate_table(Website)
    website = new_website()

    response = authorized_client.patch(
        reverse("api:website-detail", args=[website.pk]),
        {"name": "x.com"},
        content_type="application/json",
    )
    assert response.status_code == status.HTTP_200_OK
    assert response.json() == {
        "name": "x.com",
        "id": website.pk,
        "language": "en",
        "region": "eu",
        "domain": "",
        "pages": [],
        "images": [],
    }

    response = authorized_client.delete(
        reverse("api:website-detail", args=[website.pk]),
        content_type="application/json",
    )
    assert response.status_code == status.HTTP_204_NO_CONTENT
