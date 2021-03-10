from django.conf import settings


def base_context(request):
    return {'environment': settings.ENVIRONMENT, 'access_token': settings.ROLLBAR_ACCESS_TOKEN_FRONTEND}
