import logging

from django.conf import settings
from django.utils.translation import gettext_lazy as _
from rest_framework import serializers

from tumbs.websites.models import Page

from ..fields import WebsiteRelatedField

logger = logging.getLogger(__name__)


class PageSerializer(serializers.ModelSerializer):
    website_id = serializers.PrimaryKeyRelatedField(read_only=True)
    order = serializers.IntegerField()

    class Meta:
        model = Page
        fields = ("id", "website_id", "title", "description", "content", "order")


class PageCreateSerializer(serializers.ModelSerializer):
    website_id = WebsiteRelatedField()
    order = serializers.IntegerField(read_only=True)

    def validate(self, attrs):
        website_id = attrs.get("website_id")
        n_pages = Page.objects.filter(website_id=website_id).valid().count()
        max_pages = settings.CMS_PAGES_MAX_PER_WEBSITE
        if n_pages >= max_pages:
            logger.warning(
                "Customer %s attempted to exceed max pages (%s) per website <websites.Website %s>",
                self.context["request"].session["customer"]["id"],
                max_pages,
                website_id,
            )
            raise serializers.ValidationError(_("Maximum pages per website is {max}.").format(max=max_pages))

        return super().validate(attrs)

    class Meta:
        model = Page
        fields = ("id", "website_id", "title", "description", "content", "order")
