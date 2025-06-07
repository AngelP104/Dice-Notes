import django
import os

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "dicenotes.settings")
django.setup()

from django.contrib.auth import get_user_model
from dndapp.models import Idioma, RolCampana
from firebase_auth.models import CustomUser

CustomUser = get_user_model()

# Crear superusuario
if not CustomUser.objects.filter(username="admin").exists():
    CustomUser.objects.create_superuser("admin", "admin@example.com", "admin")
    print("Superusuario 'admin' creado.")
else:
    print("El superusuario 'admin' ya existe.")

# Crear idiomas base
IDIOMAS = [
    'Común',
    'Infracomún',
    'Enano',
    'Élfico',
    'Gigante',
    'Gnomo',
    'Goblin',
    'Mediano',
    'Dracónido',
    'Druídico',
    'Orco',
    'Troll',
    'Vampiro',
    'Brujo',
]

for idiom in IDIOMAS:
    if not Idioma.objects.filter(nombre=idiom).exists():
        Idioma.objects.create(nombre=idiom)
        print(f"Idioma creado: {idiom}")
    else:
        print(f"Idioma ya existe: {idiom}")

#Crear Rol de "Jugador", necesario para poder unirse a una campaña 

if not RolCampana.objects.filter(nombre="Jugador").exists():
    RolCampana.objects.create(nombre="Jugador")
    print(f"Rol de campaña 'Jugador' creado.")
else:
    print(f"Rol de campaña 'Jugador' ya existe.")