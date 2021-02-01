import os
from urllib.parse import unquote, urlsplit, urlunsplit

from whitenoise.storage import CompressedManifestStaticFilesStorage


class SkipHashFile(Exception):
    pass


class CustomCompressedManifestStaticFilesStorage(CompressedManifestStaticFilesStorage):
    def file_hash(self, name, content=None):
        _, ext = os.path.splitext(name)
        if ext == '.jsx':
            raise SkipHashFile()
        return super().file_hash(name, content)

    def hashed_name(self, name, content=None, filename=None):
        # `filename` is the name of file to hash if `content` isn't given.
        # `name` is the base name to construct the new hashed filename from.
        parsed_name = urlsplit(unquote(name))
        clean_name = parsed_name.path.strip()
        filename = (filename and urlsplit(unquote(filename)).path.strip()) or clean_name
        opened = content is None
        if opened:
            if not self.exists(filename):
                raise ValueError("The file '%s' could not be found with %r." % (filename, self))
            try:
                content = self.open(filename)
            except OSError:
                # Handle directory paths and fragments
                return name
        try:
            file_hash = self.file_hash(clean_name, content)
        except SkipHashFile:
            file_hash = None
        finally:
            if opened:
                content.close()
        path, filename = os.path.split(clean_name)
        root, ext = os.path.splitext(filename)
        file_hash = ('.%s' % file_hash) if file_hash else ''
        hashed_name = os.path.join(path, "%s%s%s" %
                                   (root, file_hash, ext))
        unparsed_name = list(parsed_name)
        unparsed_name[2] = hashed_name
        # Special casing for a @font-face hack, like url(myfont.eot?#iefix")
        # http://www.fontspring.com/blog/the-new-bulletproof-font-face-syntax
        if '?#' in name and not unparsed_name[3]:
            unparsed_name[2] += '?'
        return urlunsplit(unparsed_name)
