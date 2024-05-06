import logging

from rest_framework import generics

from tumbs.websites.models import Website

from ..permissions import IsAuthenticated
from . import serializers

logger = logging.getLogger(__name__)


class QuerySetMixin:
    def get_queryset(self):
        customer_id = self.request.session["customer"]["id"]
        return Website.objects.valid().filter(customer_id=customer_id)


class WebsiteList(QuerySetMixin, generics.ListCreateAPIView):
    permission_classes = (IsAuthenticated,)
    serializer_class = serializers.WebsiteSerializer

    def perform_create(self, serializer):
        instance = serializer.save(customer_id=self.request.session["customer"]["id"])
        logger.info("Customer %s CREATED website %s", self.request.session["customer"]["id"], repr(instance))


class WebsiteDetail(QuerySetMixin, generics.RetrieveUpdateDestroyAPIView):
    permission_classes = (IsAuthenticated,)
    serializer_class = serializers.WebsiteSerializer

    def perform_destroy(self, instance):
        instance.pages.update(deleted=True)
        instance.images.update(deleted=True)
        instance.deleted = True
        instance.save()
        logger.info("Customer %s DELETED website %s", self.request.session["customer"]["id"], repr(instance))
