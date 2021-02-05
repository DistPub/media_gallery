from babel_transpiling.storage import StaticFilesTranspilingStorage
from django.contrib.staticfiles.storage import ManifestStaticFilesStorage


class CustomManifestStaticFilesStorage(StaticFilesTranspilingStorage, ManifestStaticFilesStorage):
    pass
