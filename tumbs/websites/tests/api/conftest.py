import pytest


@pytest.fixture
def authorized_client(client):
    session = client.session
    session["customer"] = {"id": 1}
    session.save()
    return client
