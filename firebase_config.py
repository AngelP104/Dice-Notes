import firebase_admin
from firebase_admin import credentials
import os
from django.conf import settings

#cred = credentials.Certificate("./firebase_config.json")

cred = credentials.Certificate("firebase_config.json")

#firebase_admin.initialize_app(cred)
default_app = firebase_admin.initialize_app(cred)