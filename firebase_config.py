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
from firebase_admin import credentials, initialize_app

firebase_creds = os.environ.get('FIREBASE_CONFIG')

if os.environ.get("FIREBASE_CONFIG"):
    firebase_dict = json.loads(os.environ["FIREBASE_CONFIG"])
    cred = credentials.Certificate(firebase_dict)
else:
    cred = credentials.Certificate("firebase_config.json")

firebase_app = initialize_app(cred)
