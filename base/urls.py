from django.urls import path
from django.views.generic import TemplateView


urlpatterns = [
    path('sw.js', TemplateView.as_view(
        template_name="sw.js", content_type='application/javascript'
    ), name='sw.js'),
]
