class Resource404(Exception):
    def __init__(self, resource, message):
        self.resource = resource
        super().__init__(message)
