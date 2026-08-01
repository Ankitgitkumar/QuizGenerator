import os
import json
import urllib.request
from dotenv import load_dotenv

load_dotenv('.env')
key = os.getenv('GEMINI_API_KEY')
print('KEY_PRESENT', bool(key))
if key:
    url = f'https://generativelanguage.googleapis.com/v1/models?key={key}'
    try:
        with urllib.request.urlopen(url, timeout=30) as response:
            data = json.load(response)
            names = [m.get('name') for m in data.get('models', []) if 'name' in m]
            print('\n'.join(names[:50]))
    except Exception as ex:
        print('ERROR', ex)
