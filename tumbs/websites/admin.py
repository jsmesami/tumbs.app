from django.contrib import admin
from django.db import models
from django.forms import Textarea
from django.utils.html import format_html
from django.utils.text import Truncator
from django.utils.translation import gettext_lazy as _
from ordered_model.admin import OrderedInlineModelAdminMixin, OrderedModelAdmin

from tumbs.websites.models import Image, Page, Website

SMALL_TEXTAREA = Textarea(attrs={"rows": 2, "cols": 30})


class PageAdminInline(admin.TabularInline):
    model = Page
    extra = 0
    formfield_overrides = {
        models.TextField: {"widget": SMALL_TEXTAREA},
        models.JSONField: {"widget": SMALL_TEXTAREA},
    }


class ImageAdminInline(admin.TabularInline):
    model = Image
    extra = 0
    formfield_overrides = {
        models.TextField: {"widget": SMALL_TEXTAREA},
    }


@admin.register(Website)
class WebsiteAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "user", "_pages_count", "_images_count")
    search_fields = ("name", "user__name", "user__email")
    inlines = (PageAdminInline, ImageAdminInline)

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        return qs.annotate(pages_count=models.Count("pages"), images_count=models.Count("images"))

    @admin.display(description=_("pages count"), ordering="pages_count")
    def _pages_count(self, obj):
        return obj.pages_count

    @admin.display(description=_("images count"), ordering="images_count")
    def _images_count(self, obj):
        return obj.images_count


@admin.register(Page)
class PageAdmin(OrderedInlineModelAdminMixin, OrderedModelAdmin):
    list_display = ("id", "website", "title", "_short_description", "order", "move_up_down_links")
    search_fields = ("title", "website__name")

    @admin.display(description=_("description"))
    def _short_description(self, obj):
        return Truncator(obj.description).chars(50)


@admin.register(Image)
class ImageAdmin(admin.ModelAdmin):
    list_display = ("id", "website", "_image_tag", "_short_alt", "_short_caption")
    search_fields = ("alt", "caption", "website__name")

    @admin.display(description=_("image"))
    def _image_tag(self, obj):
        return format_html('<img src="{url}" style="max-height: 100px">', url=obj.file.url)

    @admin.display(description=_("alt"))
    def _short_alt(self, obj):
        return Truncator(obj.alt).chars(50)

    @admin.display(description=_("caption"))
    def _short_caption(self, obj):
        return Truncator(obj.caption).chars(50)
