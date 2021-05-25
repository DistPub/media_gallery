from django.views.generic import TemplateView


class Index(TemplateView):
    template_name = 'zyms/index.html'

    def get_context_data(self, **kwargs):
        data = super().get_context_data(**kwargs)
        data['remove_body_class'] = True
        return data
