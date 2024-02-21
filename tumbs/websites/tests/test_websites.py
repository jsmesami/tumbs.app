# pylint: disable=R0801
from operator import itemgetter

import pytest
from django.urls import reverse

from tumbs.websites.models import Website


@pytest.mark.django_db
@pytest.mark.parametrize(
    "method, url",
    (
        ("get", reverse("api-1.0.0:list_websites")),
        ("post", reverse("api-1.0.0:create_website")),
        ("get", reverse("api-1.0.0:read_website", args=[1])),
        ("put", reverse("api-1.0.0:update_website", args=[1])),
        ("delete", reverse("api-1.0.0:delete_website", args=[1])),
    ),
)
def test_unauthorized(client, method, url):
    response = getattr(client, method)(url, content_type="application/json")
    assert response.status_code == 401
    assert response.json() == {"detail": "Unauthorized"}


@pytest.mark.django_db
def test_create_read_list(authorized_client, truncate_table):
    names = ("", "Eenie", "Meenie", "Miney", "Moe", "🫣🤫🤔")
    src = [{"name": n} for n in names]
    dst = [{"name": n, "id": i, "pages": [], "images": []} for i, n in enumerate(names, start=1)]

    truncate_table(Website)

    for provided, expected in zip(src, dst):
        response = authorized_client.post(
            reverse("api-1.0.0:create_website"),
            provided,
            content_type="application/json",
        )
        assert response.status_code == 201
        assert response.json() == expected

        response = authorized_client.get(
            reverse("api-1.0.0:read_website", args=[expected["id"]]),
            content_type="application/json",
        )
        assert response.status_code == 200
        assert response.json() == expected

    response = authorized_client.get(
        reverse("api-1.0.0:list_websites"),
        content_type="application/json",
    )
    assert response.status_code == 200
    assert sorted(response.json(), key=itemgetter("id")) == dst


@pytest.mark.django_db(transaction=False)
def test_update_delete(authorized_client, truncate_table, new_website):
    truncate_table(Website)

    website = new_website(authorized_client.session["customer"]["id"])

    response = authorized_client.put(
        reverse("api-1.0.0:update_website", args=[website.pk]),
        {"name": "x.com"},
        content_type="application/json",
    )
    assert response.status_code == 200
    assert response.json() == {
        "name": "x.com",
        "id": website.pk,
        "pages": [],
        "images": [],
    }

    response = authorized_client.delete(
        reverse("api-1.0.0:delete_website", args=[website.pk]),
        content_type="application/json",
    )
    assert response.status_code == 200
    assert response.json() == {"success": True}
