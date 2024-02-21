from django.db import models
from django.db.models import Prefetch
from django.utils.translation import gettext_lazy as _
from django_extensions.db.models import TimeStampedModel

from tumbs.websites.models.image import Image
from tumbs.websites.models.page import Page


class ValidWebsiteQuerySet(models.QuerySet):
    def valid(self):
        return self.exclude(deleted=True).prefetch_related(
            Prefetch("images", queryset=Image.objects.valid()),
            Prefetch("pages", queryset=Page.objects.valid()),
        )


class Website(TimeStampedModel):
    customer_id = models.CharField(_("customer ID"), max_length=255, db_index=True)
    name = models.CharField(_("name"), max_length=255)
    deleted = models.BooleanField(_("deleted"), default=False, db_index=True)

    objects = models.Manager.from_queryset(ValidWebsiteQuerySet)()

    def __str__(self):
        return self.name

    def __repr__(self):
        return f"<websites.Website {self.id}>"

    class Meta:
        verbose_name = _("website")
        verbose_name_plural = _("websites")
        unique_together = ("customer_id", "name")
