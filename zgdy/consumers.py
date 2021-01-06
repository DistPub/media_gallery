import json

import asyncio
from channels.generic.websocket import AsyncWebsocketConsumer

from services.zgdy import get_signature
from utils.exceptions import Resource404


class Index(AsyncWebsocketConsumer):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.loop = asyncio.get_event_loop()

    async def receive(self, text_data=None, bytes_data=None):
        """
        One request message structure:

            [type, body]

        One response message structure:

            [type, status, body]

        If body is a file, then direct response binary file content.

        :param text_data: raw message
        :param bytes_data: None
        """
        try:
            message_type, body = json.loads(text_data)
            self.loop.create_task(self.process(message_type, body))
        except Exception as error:
            print(f'consumer construct message error: {error} raw message: {text_data}')

    async def process(self, message_type, body):
        handler_name = f'do_{message_type}'
        status = 200
        response = None

        try:
            if hasattr(self, handler_name):
                handler = getattr(self, handler_name)
                response = await handler(body)

            else:
                raise Resource404(handler_name, 'handler not found')

        except Resource404 as error:
            status = 404
            response = [error.resource, str(error)]

        except Exception as error:
            status = 500
            response = f'handle message unexpected error: {error}'

        finally:
            if response is None:
                return

            await self.send(text_data=json.dumps([message_type, status, response]))

    @staticmethod
    async def do_get(unique_id):
        return [unique_id, await get_signature(unique_id)]
