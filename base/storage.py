from babel_transpiling.storage import StaticFilesTranspilingStorage
from django.contrib.staticfiles.storage import ManifestStaticFilesStorage

from postcss_modules.storage import PostCSSModulesStorage


class CustomManifestStaticFilesStorage(PostCSSModulesStorage, StaticFilesTranspilingStorage, ManifestStaticFilesStorage):
    pass
