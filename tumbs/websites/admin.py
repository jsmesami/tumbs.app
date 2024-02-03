from django.contrib import admin

import tumbs.websites.models as models


class PageAdminInline(admin.TabularInline):
    model = models.Page
    extra = 0


class ImageAdminInline(admin.TabularInline):
    model = models.Image
    extra = 0


@admin.register(models.Website)
class WebsiteAdmin(admin.ModelAdmin):
    inlines = (PageAdminInline, ImageAdminInline)


@admin.register(models.Image)
class ImageAdmin(admin.ModelAdmin):
    pass
