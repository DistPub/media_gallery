from django.urls import path
from django.views.generic import TemplateView

urlpatterns = [
    path('', TemplateView.as_view(
        template_name="libp2p/index.html"
    ), name='index'),
    path('sw.js', TemplateView.as_view(
        template_name="libp2p/sw.js", content_type='application/javascript'
    ), name='sw.js'),
]
