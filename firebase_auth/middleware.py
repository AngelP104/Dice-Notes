import firebase_config
from django.contrib.auth.models import AnonymousUser
from urllib.parse import parse_qs
from firebase_admin import auth as firebase_auth
from firebase_auth.models import CustomUser
from dndapp.models import Perfil
from channels.middleware import BaseMiddleware
from asgiref.sync import sync_to_async

# Creación de usuario y perfil tras el inicio de sesión / registro con Firebase
class FirebaseAuthMiddleware(BaseMiddleware):
    async def __call__(self, scope, receive, send):
        query_string = parse_qs(scope["query_string"].decode())
        token = query_string.get("token", [None])[0]

        if token is None:
            scope["user"] = AnonymousUser()
            return await super().__call__(scope, receive, send)

        try:
            # Verificación del token (bloqueante, por eso usamos sync_to_async)
            decoded_token = await sync_to_async(firebase_auth.verify_id_token)(token)
            uid = decoded_token["uid"]
            email = decoded_token.get("email", "")
            display_name = decoded_token.get("name") or email.split("@")[0]

            base_username = email.split("@")[0]
            username = base_username
            counter = 1

            # Búsqueda síncrona dentro de async: envolver con sync_to_async
            while await sync_to_async(CustomUser.objects.filter(username=username).exists)():
                username = f"{base_username}{counter}"
                counter += 1

            # Comprobar si hay email existente
            try:
                existing_user = await sync_to_async(CustomUser.objects.get)(email=email)
                user = existing_user
                created = False
            except CustomUser.DoesNotExist:
                base_username = email.split("@")[0]
                username = base_username
                counter = 1

                while await sync_to_async(CustomUser.objects.filter(username=username).exists)():
                    username = f"{base_username}{counter}"
                    counter += 1

                user = await sync_to_async(CustomUser.objects.create)(
                    firebase_uid=uid,
                    email=email,
                    username=username,
                    first_name=display_name,
                    is_active=True
                )
                created = True


            # if created:
            #     apodo_base = username
            #     apodo = apodo_base
            #     counter = 1
            #     while await sync_to_async(Perfil.objects.filter(apodo=apodo).exists)():
            #         apodo = f"{apodo_base}{counter}"
            #         counter += 1
            #     await sync_to_async(Perfil.objects.create)(user=user, apodo=apodo)
            # else:
            #     await sync_to_async(Perfil.objects.get_or_create)(user=user)

            await sync_to_async(Perfil.objects.get_or_create)(user=user)

            scope["user"] = user

        except Exception as e:
            print("Fallo autenticando WebSocket con Firebase:", e)
            scope["user"] = AnonymousUser()

        return await super().__call__(scope, receive, send)
