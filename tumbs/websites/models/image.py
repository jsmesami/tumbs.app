import os
import uuid

import magic
from django.conf import settings
from django.core.exceptions import ValidationError
from django.db import models
from django.utils.translation import gettext_lazy as _
from django_extensions.db.models import TimeStampedModel
from PIL import Image as RawImage

from tumbs.websites.utils import exif


def image_upload_path(instance, filename):
    _, ext = os.path.splitext(filename)
    return f"ws-{uuid.UUID(instance.website_id).hex}/{uuid.uuid4().hex}{ext}"


def file_size_validator(value):
    max_size = settings.CMS_IMAGE_ALLOWED_MAX_SIZE
    max_size_mib = max_size / 1024 / 1024

    if value.size > max_size:
        raise ValidationError(f"File too large. Size should not exceed {max_size_mib:.2f} MiB.")


def file_type_validator(value):
    mime = magic.Magic(mime=True)
    file_mime_type = mime.from_buffer(value.read(2048))
    value.seek(0)  # Reset file pointer for future operations in the upload process

    if file_mime_type not in settings.CMS_IMAGE_ALLOWED_CONTENT_TYPES:
        raise ValidationError(f"File type '{file_mime_type}' is not supported.")


class ValidImageQuerySet(models.QuerySet):
    def valid(self):
        return self.exclude(models.Q(deleted=True) | models.Q(website__deleted=True))


class Image(TimeStampedModel):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    website = models.ForeignKey(
        "websites.Website", verbose_name=_("website"), related_name="images", on_delete=models.CASCADE
    )
    file = models.ImageField(
        _("image file"), upload_to=image_upload_path, validators=[file_type_validator, file_size_validator]
    )
    alt = models.TextField(_("alt text"), blank=True)
    caption = models.TextField(_("caption"), blank=True)
    meta = models.JSONField(_("meta"), blank=True, null=True)
    deleted = models.BooleanField(_("deleted"), default=False, db_index=True)

    objects = models.Manager.from_queryset(ValidImageQuerySet)()

    def save(self, **kwargs):
        with RawImage.open(self.file.file) as image:  # <- InMemoryUploadedFile
            exif_data = image.getexif()
            self.meta = (self.meta or {}) | {
                "gps": exif.get_location(exif_data),
                "created": exif.get_creation_time(exif_data),
            }
        super().save(**kwargs)

    def __str__(self):
        return self.file.name

    def __repr__(self):
        return f"<websites.Image {self.pk}>"

    class Meta:
        verbose_name = _("image")
        verbose_name_plural = _("images")
