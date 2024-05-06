from rest_framework import serializers

from tumbs.websites.models import Image

from ..fields import WebsiteRelatedField


class ImageSerializer(serializers.ModelSerializer):
    website_id = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = Image
        fields = ("id", "website_id", "file", "alt", "caption")


class ImageCreateSerializer(ImageSerializer):
    website_id = WebsiteRelatedField()


class ImageUpdateSerializer(ImageSerializer):
    file = serializers.ImageField(read_only=True)
