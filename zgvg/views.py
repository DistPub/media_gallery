from django.views.generic import TemplateView


class Index(TemplateView):
    template_name = 'zgvg/index.html'

    def get_context_data(self, **kwargs):
        return {'lang': 'zh_CN'}
