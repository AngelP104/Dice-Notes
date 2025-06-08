import os
import json
from firebase_admin import credentials

firebase_config_json = os.environ.get('FIREBASE_CONFIG')

if firebase_config_json:
    try:
        firebase_config_dict = json.loads(firebase_config_json)
        cred = credentials.Certificate(firebase_config_dict)
    except json.JSONDecodeError:
        raise ValueError("FIREBASE_CONFIG malformado. Asegúrate de que es JSON válido.")
else:
    raise Exception("FIREBASE_CONFIG no encontrada")
