from django.urls import path

from . import consumers

urlpatterns = [
    path('', consumers.Index.as_asgi()),
]
