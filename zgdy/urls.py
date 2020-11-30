from django.urls import path
from django.views.generic import TemplateView


urlpatterns = [
    path('', TemplateView.as_view(
        template_name="zgdy/index.html"
    ), name='index'),
    path('sw.js', TemplateView.as_view(
        template_name="zgdy/sw.js", content_type='application/javascript'
    ), name='sw.js'),
]
