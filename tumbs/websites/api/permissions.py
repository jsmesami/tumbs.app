import logging

from ipware import get_client_ip
from rest_framework import permissions

logger = logging.getLogger(__name__)


class IsAuthenticated(permissions.BasePermission):
    def has_permission(self, request, _view):
        try:
            return request.session["customer"]["id"]
        except KeyError:
            ip, _trusted_route = get_client_ip(request)
            logger.warning("Attempt to unauthorized access to %s [IP: %s]", request.path, ip)
            return False
