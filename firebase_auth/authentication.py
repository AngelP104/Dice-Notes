import firebase_config
from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
from firebase_admin import auth as firebase_auth
from dndapp.models import Perfil
from firebase_auth.models import CustomUser

class FirebaseAuthentication(BaseAuthentication):
    def authenticate(self, request):
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return None

        id_token = auth_header.split(' ')[1]
        try:
            decoded_token = firebase_auth.verify_id_token(id_token)
            uid = decoded_token["uid"]
            email = decoded_token.get("email", "")
            display_name = decoded_token.get("name") or email.split("@")[0]

            # Crear o recuperar usuario
            base_username = email.split("@")[0]
            username = base_username
            counter = 1
            while CustomUser.objects.filter(username=username).exists():
                username = f"{base_username}{counter}"
                counter += 1

            user, created = CustomUser.objects.get_or_create(
                firebase_uid=uid,
                defaults={
                    "email": email,
                    "username": username,
                    "first_name": display_name,
                    "is_active": True,
                }
            )

            if created:
                # Crear perfil único (apodo sin colisiones)
                apodo_base = username
                apodo = apodo_base
                counter = 1
                while Perfil.objects.filter(apodo=apodo).exists():
                    apodo = f"{apodo_base}{counter}"
                    counter += 1
                Perfil.objects.create(user=user, apodo=apodo)
            else:
                # Por si acaso, aseguramos que haya perfil
                Perfil.objects.get_or_create(user=user)

            return (user, None)

        except Exception as e:
            raise AuthenticationFailed(f"Autenticación fallida: {str(e)}")
