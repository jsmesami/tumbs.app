from rest_framework import serializers

from tumbs.websites.models import Website

from ..images.serializers import ImageSerializer
from ..pages.serializers import PageSerializer


class WebsiteSerializer(serializers.ModelSerializer):
    pages = serializers.SerializerMethodField()
    images = serializers.SerializerMethodField()

    def get_pages(self, obj):
        serializer = PageSerializer(obj.pages, many=True)
        return serializer.data

    def get_images(self, obj):
        serializer = ImageSerializer(obj.images, many=True)
        return serializer.data

    class Meta:
        model = Website
        fields = ("id", "name", "language", "region", "domain", "pages", "images")
