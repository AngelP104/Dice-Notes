import os
import json
import firebase_admin
from firebase_admin import credentials

if not firebase_admin._apps:
    firebase_config_json = os.environ.get('FIREBASE_CONFIG')
    if not firebase_config_json:
        raise Exception("FIREBASE_CONFIG no encontrada")

    try:
        firebase_config_dict = json.loads(firebase_config_json)
        cred = credentials.Certificate(firebase_config_dict)
        firebase_admin.initialize_app(cred)
        print("Firebase inicializado correctamente")

    except json.JSONDecodeError:
        raise ValueError("FIREBASE_CONFIG malformado. Asegúrate de que es JSON válido.")
