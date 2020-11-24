from channels.routing import URLRouter
from django.urls import path

import zgdy.routing

urlpatterns = [
    path('zgdy/', URLRouter(zgdy.routing.urlpatterns)),
]
