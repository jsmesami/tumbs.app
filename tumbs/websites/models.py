from django.db import models
from django.utils.translation import gettext_lazy as _
from django_extensions.db.fields import AutoSlugField
from django_extensions.db.models import TimeStampedModel


class Website(TimeStampedModel):
    user = models.ForeignKey("users.User", verbose_name=_("user"), related_name="websites", on_delete=models.CASCADE)

    name = models.CharField(_("name"), max_length=255)
    slug = AutoSlugField(populate_from="name")

    def __str__(self):
        return self.name

    def __repr__(self):
        return f"<websites.Website {self.id}>"

    class Meta:
        verbose_name = _("website")
        verbose_name_plural = _("websites")


class Page(models.Model):
    website = models.ForeignKey(
        "websites.Website", verbose_name=_("website"), related_name="pages", on_delete=models.CASCADE
    )

    title = models.CharField(_("name"), max_length=255)
    slug = AutoSlugField(populate_from="title")
    description = models.TextField(_("description"), blank=True)
    content = models.JSONField(_("content"), null=True, blank=True)

    def __str__(self):
        return self.title

    def __repr__(self):
        return f"<websites.Page {self.id}>"

    class Meta:
        verbose_name = _("page")
        verbose_name_plural = _("pages")


class Image(TimeStampedModel):
    website = models.ForeignKey(
        "websites.Website", verbose_name=_("website"), related_name="images", on_delete=models.CASCADE
    )

    file = models.ImageField(_("image file"))
    alt = models.TextField(_("alt text"), blank=True)
    caption = models.TextField(_("caption"), blank=True)

    def __str__(self):
        return self.file.name

    def __repr__(self):
        return f"<websites.Image {self.id}>"

    class Meta:
        verbose_name = _("image")
        verbose_name_plural = _("images")
