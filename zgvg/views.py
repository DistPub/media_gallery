from django.views.generic import TemplateView

from services.consts import ICE_SERVERS_LIST_JSON_ENCODE


class Index(TemplateView):
    template_name = 'zgvg/index.html'

    def get_context_data(self, **kwargs):
        return {'iceServers': ICE_SERVERS_LIST_JSON_ENCODE, 'lang': 'zh_CN'}
