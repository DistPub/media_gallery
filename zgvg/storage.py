import os

from py_mini_racer import py_mini_racer
from django.conf import settings
from whitenoise.storage import CompressedManifestStaticFilesStorage

from zgvg.middlewares import get_absolute_path, ConfigureError, get_file_content


class ReactJSXTranspilingStorage(CompressedManifestStaticFilesStorage):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.ctx = py_mini_racer.MiniRacer()

        # use this option to custom babel standalone file
        if hasattr(settings, 'BABEL_STANDALONE_STATIC_PATH'):
            path = settings.BABEL_STANDALONE_STATIC_PATH
        else:
            path = 'zgvg/js/babel_standalone.min.js'

        babel = get_absolute_path(path)
        if not babel:
            raise ConfigureError('babel.min.js not found')

        self.ctx.eval(get_file_content(babel))

    def _save(self, name, content):
        origin = super()._save(name, content)
        _, file_suffix = os.path.splitext(name)

        if file_suffix != '.jsx':
            return origin

        # transpiling on the fly
        file = open(self.path(name), 'r+')
        result = self.ctx.call('Babel.transform', file.read(), {
            "presets": ["react"],
            "minified": True,
            "comments": False
        })
        file.seek(0)
        file.truncate()
        file.write(result['code'])
        file.close()
        return origin
