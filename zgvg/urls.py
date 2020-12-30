from django.urls import path
from django.views.generic import TemplateView

from zgvg import views

urlpatterns = [
    path('', views.Index.as_view(), name='index'),
    path('sw.js', TemplateView.as_view(
        template_name="zgvg/sw.js", content_type='application/javascript'
    ), name='sw.js'),
]
