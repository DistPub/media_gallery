from django.urls import path
from django.views.generic import TemplateView

urlpatterns = [
    path('', TemplateView.as_view(
        template_name="avideo_chat/index.html"
    ), name='index'),
    path('sw.js', TemplateView.as_view(
        template_name="avideo_chat/sw.js", content_type='application/javascript'
    ), name='sw.js'),
]
