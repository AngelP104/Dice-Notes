"""
# ANTES de despliegue
import firebase_admin
from firebase_admin import credentials
import os
from django.conf import settings

#cred = credentials.Certificate("./firebase_config.json")

cred = credentials.Certificate("firebase_config.json")

#firebase_admin.initialize_app(cred)
default_app = firebase_admin.initialize_app(cred)
"""

import os
import json
from firebase_admin import credentials

firebase_config_json = os.environ.get('FIREBASE_CONFIG')

if firebase_config_json:
    firebase_config_dict = json.loads(firebase_config_json)
    cred = credentials.Certificate(firebase_config_dict)
else:
    raise Exception("FIREBASE_CONFIG no encontrada")