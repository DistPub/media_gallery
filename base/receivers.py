import sys
from django.core import signals
from django.dispatch import receiver


@receiver(signals.got_request_exception)
def report_request_exception(request, **kwargs):
    import rollbar
    rollbar.report_exc_info(sys.exc_info(), request)
