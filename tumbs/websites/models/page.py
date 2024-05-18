import uuid

from django.db import models
from django.utils.translation import gettext_lazy as _
from ordered_model.models import OrderedModel, OrderedModelManager, OrderedModelQuerySet


class ValidPageQuerySet(OrderedModelQuerySet):
    def valid(self):
        return self.exclude(models.Q(deleted=True) | models.Q(website__deleted=True))


class Page(OrderedModel):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    website = models.ForeignKey(
        "websites.Website", verbose_name=_("website"), related_name="pages", on_delete=models.CASCADE
    )
    title = models.CharField(_("name"), max_length=255)
    description = models.TextField(_("description"), blank=True)
    content = models.JSONField(_("content"), default=list, blank=True)
    deleted = models.BooleanField(_("deleted"), default=False, db_index=True)

    order_with_respect_to = "website"
    objects = OrderedModelManager.from_queryset(ValidPageQuerySet)()

    def __str__(self):
        return self.title

    def __repr__(self):
        return f"<websites.Page {self.pk}>"

    class Meta(OrderedModel.Meta):
        verbose_name = _("page")
        verbose_name_plural = _("pages")
        ordering = ("website", "order")
