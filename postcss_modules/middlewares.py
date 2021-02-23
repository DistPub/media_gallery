import os

import time
from django.conf import settings
from django.http import HttpResponse
from django.utils.deprecation import MiddlewareMixin

from postcss_modules.utils import get_options, get_absolute_path, get_file_content, get_transpiler, get_composes, \
    MaxTimeout


class PostCSSModulesMiddleware(MiddlewareMixin):
    """
    Post CSS Modules

    Note: if you use django build-in `runserver` command?
        You **MUST** add `--nostatic` option to command to make sure static file request also pass through middleware
    """
    def __init__(self, get_response=None):
        super().__init__(get_response)
        self.options = get_options()
        if settings.DEBUG:
            self.ctx = get_transpiler(self.options)

    def process_response(self, request, response):
        if not self.check_request(request):
            return response

        if settings.DEBUG:
            return self.transpiling(request, response)
        return self.fixup_content_type(request, response)

    def check_request(self, request):
        if not request.path.startswith(settings.STATIC_URL):
            return False

        file_path = request.path[len(settings.STATIC_URL):]
        _, file_suffix = os.path.splitext(file_path)

        if file_suffix not in self.options['extensions']:
            return False

        return True

    def transpiling(self, request, response):
        path = get_absolute_path(request.path[len(settings.STATIC_URL):])
        if not path:
            return response

        source = get_file_content(path)
        self.populate_vfs(request.path, source)
        css = self.ctx.call('postcssModules', request.path)
        max_time = self.options['max_time'] * 10
        while css is None and max_time:
            css = self.ctx.call('getResult', request.path)
            if css is not None:
                break
            time.sleep(0.1)
            max_time -= 0.1

        if css is None:
            raise MaxTimeout('transpiling css timeout!')

        _, file_suffix = os.path.splitext(path)
        return HttpResponse(content=css, content_type=self.options['mimetypes'][file_suffix])

    def write_vfs(self, path, source):
        cursor = 0
        while 1:
            try:
                index = path.index('/', cursor + 1)
            except ValueError:
                break

            cursor = index
            sub_dir = path[:index]

            if self.ctx.call('fs.existsSync', sub_dir):
                continue
            self.ctx.call('fs.mkdirSync', sub_dir)

        self.ctx.call('fs.writeFileSync', path, source)

    def populate_vfs(self, path, source):
        self.write_vfs(path, source)
        dir_path, _ = os.path.split(path)
        composes = get_composes(dir_path, source)
        for depend in composes:
            path = get_absolute_path(depend[len(settings.STATIC_URL):])
            if not path:
                continue
            self.write_vfs(depend, get_file_content(path))

    def fixup_content_type(self, request, response):
        if response.status_code != 200:
            return response
        _, file_suffix = os.path.splitext(request.path)
        response['Content-Type'] = self.options['mimetypes'][file_suffix]
        return response
