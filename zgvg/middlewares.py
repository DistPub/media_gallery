import posixpath

import os

from django.conf import settings
from django.contrib.staticfiles import finders
from django.http import HttpResponse
from django.utils.deprecation import MiddlewareMixin
from py_mini_racer import py_mini_racer


class ConfigureError(Exception):
    pass


def get_absolute_path(path, is_request_path=False):
    if is_request_path:
        path = path[len(settings.STATIC_URL):]
    normalized_path = posixpath.normpath(path).lstrip('/')
    return finders.find(normalized_path)


def get_file_content(path):
    file = open(path)
    code = file.read()
    file.close()
    return code


class ReactJSXTranspilingMiddleware(MiddlewareMixin):
    """
    Transpiling react .jsx file when DEBUG=True
    for production:
        file storage will transpiling when execute `collectstatic` command

    Note: `runserver` command **MUST** add `--nostatic` option
    """
    def __init__(self, get_response=None):
        super().__init__(get_response)
        self.ctx = py_mini_racer.MiniRacer()

        if not settings.DEBUG:
            return

        # use this option to custom babel standalone file
        if hasattr(settings, 'BABEL_STANDALONE_STATIC_PATH'):
            path = settings.BABEL_STANDALONE_STATIC_PATH
        else:
            path = 'zgvg/js/babel_standalone.min.js'

        babel = get_absolute_path(path)
        if not babel:
            raise ConfigureError('babel.min.js not found')

        self.ctx.eval(get_file_content(babel))

    def process_response(self, request, response):
        if not settings.DEBUG:
            return response

        _, file_suffix = os.path.splitext(request.path)

        if file_suffix != '.jsx':
            return response

        file_path = get_absolute_path(request.path, is_request_path=True)
        if not file_path:
            return response

        # transpiling on the fly
        result = self.ctx.call('Babel.transform', get_file_content(file_path), {
            "presets": ["react"],
            "sourceMaps": 'inline'
        })
        return HttpResponse(content=result['code'], content_type='application/javascript')
