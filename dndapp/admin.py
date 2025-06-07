from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import *


class CustomUserAdmin(UserAdmin):
    model = CustomUser
    list_display = [
        "username",
        "email",
        "first_name",
        "id",
        "firebase_uid",
        "is_staff",
        "is_superuser",
    ]
    search_fields = ["username", "email"]
    ordering = ["username"]
    fieldsets = UserAdmin.fieldsets + ((None, {"fields": ("firebase_uid",)}),)
    add_fieldsets = UserAdmin.add_fieldsets + ((None, {"fields": ("firebase_uid",)}),)


admin.site.register(CustomUser, CustomUserAdmin)
admin.site.register(Perfil)
admin.site.register(Campana)
admin.site.register(Sesion)
admin.site.register(Nota)
admin.site.register(Tag)
admin.site.register(Item)
admin.site.register(Hechizo)
admin.site.register(InventarioParty)
admin.site.register(Idioma)
admin.site.register(Personaje)
admin.site.register(PersonajeNoJugable)
admin.site.register(Enemigo)
admin.site.register(Encuentro)
admin.site.register(ImagenCampana)
admin.site.register(Arma)
admin.site.register(Equipamiento)
admin.site.register(Consumible)
admin.site.register(Tesoro)
admin.site.register(Alineamiento)
admin.site.register(Invitacion)
admin.site.register(RolCampana)
admin.site.register(ParticipanteCampana)
admin.site.register(ParticipanteEncuentro)
admin.site.register(InventarioPersonaje)
admin.site.register(Mision)
