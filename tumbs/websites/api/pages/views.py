import logging

from rest_framework import generics

from tumbs.websites.models import Page

from ..permissions import IsAuthenticated
from . import serializers

logger = logging.getLogger(__name__)


class QuerySetMixin:
    def get_queryset(self):
        customer_id = self.request.session["customer"]["id"]
        return Page.objects.valid().filter(website__customer_id=customer_id)


def delete_orphaned_images(website):
    """
    Take website's images, delete ones that are not referenced by any widget of any page.
    """

    def gather_referenced_image_ids():
        for page in website.pages.valid():
            for widget in page.content:
                if iid := widget.get("imageId"):
                    yield iid
                if iids := widget.get("imageIds"):
                    yield from iids

    iids = gather_referenced_image_ids()
    website.images.exclude(id__in=iids).update(deleted=True)


class PageList(QuerySetMixin, generics.ListCreateAPIView):
    permission_classes = (IsAuthenticated,)

    def perform_create(self, serializer):
        instance = serializer.save()
        logger.info("Customer %s CREATED page %s", self.request.session["customer"]["id"], repr(instance))

    def get_serializer_class(self):
        if self.request.method == "POST":
            return serializers.PageCreateSerializer

        return serializers.PageSerializer


class PageDetail(QuerySetMixin, generics.RetrieveUpdateDestroyAPIView):
    permission_classes = (IsAuthenticated,)
    serializer_class = serializers.PageSerializer

    def perform_update(self, serializer):
        serializer.save()
        instance = self.get_object()
        delete_orphaned_images(instance.website)

    def perform_destroy(self, instance):
        instance.deleted = True
        instance.save()
        delete_orphaned_images(instance.website)
        logger.info("Customer %s DELETED page %s", self.request.session["customer"]["id"], repr(instance))
