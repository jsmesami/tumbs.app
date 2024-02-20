# Generated by Django 5.0.2 on 2024-02-11 22:04

import django.db.models.deletion
import django_extensions.db.fields
import tumbs.websites.models
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name="Website",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                (
                    "created",
                    django_extensions.db.fields.CreationDateTimeField(auto_now_add=True, verbose_name="created"),
                ),
                (
                    "modified",
                    django_extensions.db.fields.ModificationDateTimeField(auto_now=True, verbose_name="modified"),
                ),
                ("customer_id", models.CharField(db_index=True, max_length=255, verbose_name="customer ID")),
                ("name", models.CharField(max_length=255, verbose_name="name")),
            ],
            options={
                "verbose_name": "website",
                "verbose_name_plural": "websites",
            },
        ),
        migrations.CreateModel(
            name="Page",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("order", models.PositiveIntegerField(db_index=True, editable=False, verbose_name="order")),
                ("title", models.CharField(max_length=255, verbose_name="name")),
                ("description", models.TextField(blank=True, verbose_name="description")),
                ("content", models.JSONField(blank=True, null=True, verbose_name="content")),
                (
                    "website",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="pages",
                        to="websites.website",
                        verbose_name="website",
                    ),
                ),
            ],
            options={
                "verbose_name": "page",
                "verbose_name_plural": "pages",
                "ordering": ("website", "order"),
                "abstract": False,
            },
        ),
        migrations.CreateModel(
            name="Image",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                (
                    "created",
                    django_extensions.db.fields.CreationDateTimeField(auto_now_add=True, verbose_name="created"),
                ),
                (
                    "modified",
                    django_extensions.db.fields.ModificationDateTimeField(auto_now=True, verbose_name="modified"),
                ),
                (
                    "file",
                    models.ImageField(
                        upload_to=tumbs.websites.models.image.image_upload_path, verbose_name="image file"
                    ),
                ),
                ("alt", models.TextField(blank=True, verbose_name="alt text")),
                ("caption", models.TextField(blank=True, verbose_name="caption")),
                (
                    "website",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="images",
                        to="websites.website",
                        verbose_name="website",
                    ),
                ),
            ],
            options={
                "verbose_name": "image",
                "verbose_name_plural": "images",
            },
        ),
    ]
