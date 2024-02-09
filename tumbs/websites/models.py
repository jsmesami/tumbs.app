import os
import uuid

from django.db import models
from django.utils.text import slugify
from django.utils.translation import gettext_lazy as _
from django_extensions.db.models import TimeStampedModel
from ordered_model.models import OrderedModel


class Website(TimeStampedModel):
    user = models.ForeignKey("users.User", verbose_name=_("user"), related_name="websites", on_delete=models.CASCADE)

    name = models.CharField(_("name"), max_length=255)

    def __str__(self):
        return self.name

    def __repr__(self):
        return f"<websites.Website {self.id}>"

    class Meta:
        verbose_name = _("website")
        verbose_name_plural = _("websites")


class Page(OrderedModel):
    website = models.ForeignKey(
        "websites.Website", verbose_name=_("website"), related_name="pages", on_delete=models.CASCADE
    )

    title = models.CharField(_("name"), max_length=255)
    description = models.TextField(_("description"), blank=True)
    content = models.JSONField(_("content"), null=True, blank=True)

    order_with_respect_to = "website"

    def __str__(self):
        return self.title

    def __repr__(self):
        return f"<websites.Page {self.id}>"

    class Meta(OrderedModel.Meta):
        verbose_name = _("page")
        verbose_name_plural = _("pages")
        ordering = ("website", "order")


def image_upload_path(instance, filename):
    _, ext = os.path.splitext(filename)
    new_name = slugify(instance.alt) if instance.alt else uuid.uuid4().hex

    return f"website/{instance.website_id}/{new_name}{ext}"


class Image(TimeStampedModel):
    website = models.ForeignKey(
        "websites.Website", verbose_name=_("website"), related_name="images", on_delete=models.CASCADE
    )

    file = models.ImageField(_("image file"), upload_to=image_upload_path)
    alt = models.TextField(_("alt text"), blank=True)
    caption = models.TextField(_("caption"), blank=True)

    def __str__(self):
        return self.file.name

    def __repr__(self):
        return f"<websites.Image {self.id}>"

    class Meta:
        verbose_name = _("image")
        verbose_name_plural = _("images")
