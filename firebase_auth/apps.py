from django.apps import AppConfig


class FirebaseAuthConfig(AppConfig):
    name = 'firebase_auth'

    def ready(self):
        import firebase_auth.signals