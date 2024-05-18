# pylint: disable=R0801
import uuid

import pytest
from django.urls import reverse
from rest_framework import status


@pytest.mark.django_db
@pytest.mark.parametrize(
    "method, url",
    (
        ("get", reverse("api:website-list")),
        ("post", reverse("api:website-list")),
        ("get", reverse("api:website-detail", args=[uuid.uuid4()])),
        ("put", reverse("api:website-detail", args=[uuid.uuid4()])),
        ("patch", reverse("api:website-detail", args=[uuid.uuid4()])),
        ("delete", reverse("api:website-detail", args=[uuid.uuid4()])),
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
def test_create_read_list(authorized_client):
    names = ("Eenie", "Meenie", "Miney", "Moe", "🫣🤫🤔")
    fields = {
        "language": "en",
        "region": "eu",
        "domain": "",
        "pages": [],
        "images": [],
    }

    for n in names:
        provided = {"name": n}
        expected = fields | {"name": n}

        response = authorized_client.post(
            reverse("api:website-list"),
            provided,
            content_type="application/json",
        )
        assert response.status_code == status.HTTP_201_CREATED
        response = response.json()
        expected |= {"id": response["id"]}
        assert response == expected

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
    response = response.json()
    expected = [fields | {"id": ws["id"], "name": name} for ws, name in zip(response, names)]
    assert response == expected


@pytest.mark.django_db(transaction=False)
def test_update_delete(authorized_client, new_website):
    website = new_website()

    response = authorized_client.patch(
        reverse("api:website-detail", args=[website["id"]]),
        {"name": "x.com"},
        content_type="application/json",
    )
    assert response.status_code == status.HTTP_200_OK
    assert response.json() == {
        "name": "x.com",
        "id": website["id"],
        "language": "en",
        "region": "eu",
        "domain": "",
        "pages": [],
        "images": [],
    }

    response = authorized_client.delete(
        reverse("api:website-detail", args=[website["id"]]),
        content_type="application/json",
    )
    assert response.status_code == status.HTTP_204_NO_CONTENT
