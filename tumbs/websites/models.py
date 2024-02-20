import os
import uuid

import magic
from django.conf import settings
from django.core.exceptions import ValidationError
from django.db import models
from django.utils.text import slugify
from django.utils.translation import gettext_lazy as _
from django_extensions.db.models import TimeStampedModel
from ordered_model.models import OrderedModel, OrderedModelManager, OrderedModelQuerySet


class ValidWebsiteQuerySet(models.QuerySet):
    def valid(self):
        return self.exclude(deleted=True)


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


class ValidPageQuerySet(OrderedModelQuerySet):
    def valid(self):
        return self.exclude(models.Q(deleted=True) | models.Q(website__deleted=True))


class Page(OrderedModel):
    website = models.ForeignKey(
        "websites.Website", verbose_name=_("website"), related_name="pages", on_delete=models.CASCADE
    )
    title = models.CharField(_("name"), max_length=255)
    description = models.TextField(_("description"), blank=True)
    content = models.JSONField(_("content"), null=True, blank=True)
    deleted = models.BooleanField(_("deleted"), default=False, db_index=True)

    order_with_respect_to = "website"
    objects = OrderedModelManager.from_queryset(ValidPageQuerySet)()

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


def file_size_validator(value):
    max_size = settings.CMS_IMAGE_ALLOWED_MAX_SIZE
    if value.size > max_size:
        raise ValidationError(f"File too large. Size should not exceed {max_size / 1048576:.0f} MiB.")


def file_type_validator(value):
    mime = magic.Magic(mime=True)
    file_mime_type = mime.from_buffer(value.read(2048))
    value.seek(0)  # Reset file pointer for future operations in the upload process

    if file_mime_type not in settings.CMS_IMAGE_ALLOWED_CONTENT_TYPES:
        raise ValidationError(f"File type '{file_mime_type}' is not supported.")


class ValidImageQuerySet(OrderedModelQuerySet):
    def valid(self):
        return self.exclude(models.Q(deleted=True) | models.Q(website__deleted=True))


class Image(TimeStampedModel):
    website = models.ForeignKey(
        "websites.Website", verbose_name=_("website"), related_name="images", on_delete=models.CASCADE
    )
    file = models.ImageField(
        _("image file"), upload_to=image_upload_path, validators=[file_type_validator, file_size_validator]
    )
    alt = models.TextField(_("alt text"), blank=True)
    caption = models.TextField(_("caption"), blank=True)
    deleted = models.BooleanField(_("deleted"), default=False, db_index=True)

    objects = models.Manager.from_queryset(ValidImageQuerySet)()

    def __str__(self):
        return self.file.name

    def __repr__(self):
        return f"<websites.Image {self.id}>"

    class Meta:
        verbose_name = _("image")
        verbose_name_plural = _("images")
