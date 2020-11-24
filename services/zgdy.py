import aiohttp

from services.consts import ZGDY_API_USER_INFO
from utils.exceptions import Resource404


async def get_signature(unique_id):
    async with aiohttp.ClientSession() as session:
        async with session.get(f'{ZGDY_API_USER_INFO}?unique_id={unique_id}') as response:
            data = await response.json()

            if data['status_code'] != 0:
                raise Resource404(unique_id, data['status_msg'])

            return data['user_info']['signature']
