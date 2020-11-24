import base64


def free(message):
    return base64.b64decode(message.encode()).decode()
