from django.views.generic import TemplateView


class Index(TemplateView):
    template_name = 'zgvg/index.html'
