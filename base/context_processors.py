from django.conf import settings


def base_context(request):
    return {'env': settings.ENVIRONMENT}
