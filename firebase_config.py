import os
import json
import firebase_admin
from firebase_admin import credentials

firebase_config_json = os.environ.get('FIREBASE_CONFIG')

if firebase_config_json:
    try:
        firebase_config_dict = json.loads(firebase_config_json)
        cred = credentials.Certificate(firebase_config_dict)
    except json.JSONDecodeError:
        raise ValueError("FIREBASE_CONFIG malformado. Asegúrate de que es JSON válido.")
else:
    # Asume entorno local
    cred_path = os.path.join(os.path.dirname(__file__), "firebase_config.json")
    if not os.path.exists(cred_path):
        raise FileNotFoundError("No se encontró firebase_config.json y no se definió FIREBASE_CONFIG.")
    cred = credentials.Certificate(cred_path)

# Inicializar la app de Firebase si no se ha hecho ya
if not firebase_admin._apps:
    default_app = firebase_admin.initialize_app(cred)
