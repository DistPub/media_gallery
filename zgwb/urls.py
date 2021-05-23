from django.urls import path
from django.views.generic import TemplateView

from zgwb import views

urlpatterns = [
    path('', views.Index.as_view(), name='index'),
    path('sw.js', TemplateView.as_view(
        template_name="zgwb/sw.js", content_type='application/javascript'
    ), name='sw.js'),
]
