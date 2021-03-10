from django.apps import AppConfig
from django.conf import settings


class BaseAppConfig(AppConfig):
    name = 'base'
    verbose_name = 'BASE'

    def ready(self):
        import rollbar
        rollbar.init(**{
            'access_token': settings.ROLLBAR_ACCESS_TOKEN_BACKEND,
            'environment': settings.ENVIRONMENT,
            'root': str(settings.BASE_DIR),
        })

        import base.receivers
