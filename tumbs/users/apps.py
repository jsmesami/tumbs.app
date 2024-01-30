from django.apps import AppConfig
from django.utils.translation import gettext_lazy as _


class UsersConfig(AppConfig):
    name = "tumbs.users"
    verbose_name = _("Users")

    def ready(self):
        try:
            import tumbs.users.signals  # noqa: F401 pylint: disable=C0415,W0611
        except ImportError:
            pass
