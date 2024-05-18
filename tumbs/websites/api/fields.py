from rest_framework import serializers

from tumbs.websites.models import Website


class WebsiteRelatedField(serializers.PrimaryKeyRelatedField):
    def get_queryset(self):
        customer_id = self.context["request"].session["customer"]["id"]
        return Website.objects.valid().filter(customer_id=customer_id)

    def to_internal_value(self, data):
        return str(data)
