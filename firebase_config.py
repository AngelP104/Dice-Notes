import os
import json
import firebase_admin
from firebase_admin import credentials

def initialize_firebase():
    if not firebase_admin._apps:
        config = os.environ.get("FIREBASE_CONFIG")
        if not config:
            raise Exception("FIREBASE_CONFIG no encontrada")

        try:
            config_dict = json.loads(config)
            cred = credentials.Certificate(config_dict)
            firebase_admin.initialize_app(cred)
        except Exception as e:
            raise Exception("Error al inicializar Firebase:", str(e))
