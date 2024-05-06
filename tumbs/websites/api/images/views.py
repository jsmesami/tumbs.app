from ipware import get_client_ip
from rest_framework import generics

from tumbs.websites.models import Image

from ..permissions import IsAuthenticated
from . import serializers


class QuerySetMixin:
    def get_queryset(self):
        customer_id = self.request.session["customer"]["id"]
        return Image.objects.valid().filter(website__customer_id=customer_id)


class ImageList(QuerySetMixin, generics.ListCreateAPIView):
    permission_classes = (IsAuthenticated,)

    def perform_create(self, serializer):
        ip, _trusted_route = get_client_ip(self.request)
        serializer.save(meta={"IP": ip})

    def get_serializer_class(self):
        if self.request.method == "POST":
            return serializers.ImageCreateSerializer

        return serializers.ImageSerializer


class ImageDetail(QuerySetMixin, generics.RetrieveUpdateDestroyAPIView):
    permission_classes = (IsAuthenticated,)

    def get_serializer_class(self):
        if self.request.method in ("PUT", "PATCH"):
            return serializers.ImageUpdateSerializer

        return serializers.ImageSerializer

    def perform_destroy(self, instance):
        instance.deleted = True
        instance.save()
