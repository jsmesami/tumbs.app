from django.contrib.auth.models import AbstractUser
from django.db.models import CharField, EmailField
from django.utils.translation import gettext_lazy as _

from tumbs.users.managers import UserManager


class User(AbstractUser):
    # First and last name do not cover name patterns around the globe
    name = CharField(_("user name"), blank=True, max_length=255)
    first_name = None
    last_name = None
    email = EmailField(_("email address"), unique=True)
    username = None

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []

    objects = UserManager()

    def __str__(self):
        return self.email

    def __repr__(self):
        return f"<users.User {self.pk}>"
