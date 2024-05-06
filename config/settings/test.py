"""
With these settings, tests run faster.
"""

from .base import *  # noqa
from .base import env

# GENERAL
# ------------------------------------------------------------------------------
# https://docs.djangoproject.com/en/dev/ref/settings/#secret-key
SECRET_KEY = env(
    "DJANGO_SECRET_KEY",
    default="n00azSxxZtJUNOFs5zPNjYuLUFW8qzSmp7TcbntI81Bsjc9VrUajshsOSZIaiLUC",
)
# https://docs.djangoproject.com/en/dev/ref/settings/#test-runner
TEST_RUNNER = "django.test.runner.DiscoverRunner"

# PASSWORDS
# ------------------------------------------------------------------------------
# https://docs.djangoproject.com/en/dev/ref/settings/#password-hashers
PASSWORD_HASHERS = ["django.contrib.auth.hashers.MD5PasswordHasher"]

# EMAIL
# ------------------------------------------------------------------------------
# https://docs.djangoproject.com/en/dev/ref/settings/#email-backend
EMAIL_BACKEND = "django.core.mail.backends.locmem.EmailBackend"

# MEDIA
# ------------------------------------------------------------------------------
# https://docs.djangoproject.com/en/dev/ref/settings/#media-url
MEDIA_URL = "http://media.testserver"
# django-webpack-loader
# ------------------------------------------------------------------------------
WEBPACK_LOADER["DEFAULT"]["LOADER_CLASS"] = "webpack_loader.loader.FakeWebpackLoader"  # noqa: F405

# Kinde configuration
# ------------------------------------------------------------------------------
KINDE_ISSUER_URL = env("KINDE_ISSUER_URL", default="")
KINDE_CALLBACK_URL = env("KINDE_CALLBACK_URL", default="")
KINDE_CLIENT_ID = env("KINDE_CLIENT_ID", default="")
KINDE_CLIENT_SECRET = env("KINDE_CLIENT_SECRET", default="")
