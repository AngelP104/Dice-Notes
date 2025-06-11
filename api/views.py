from django.dispatch import receiver
from rest_framework import generics
from rest_framework.generics import (
    ListCreateAPIView,
    RetrieveUpdateDestroyAPIView,
    RetrieveAPIView,
    RetrieveUpdateAPIView,
)
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.shortcuts import get_object_or_404
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.decorators import api_view, permission_classes
from rest_framework import status
from django.shortcuts import render
from dndapp.models import *
from django.http import JsonResponse
from .serializers import *
from django.shortcuts import redirect
from django.contrib.auth.decorators import login_required
from firebase_admin import auth
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
import json


from django.contrib.auth import login
from rest_framework.authtoken.models import Token

import firebase_admin
from firebase_admin import auth, credentials
from django.conf import settings
from django.utils.timezone import now, timedelta
from django.contrib.auth import get_user_model
from firebase_admin import auth as firebase_auth
from rest_framework_simplejwt.tokens import RefreshToken

from rest_framework.permissions import IsAuthenticated
from firebase_auth.authentication import FirebaseAuthentication
from rest_framework.decorators import authentication_classes
from rest_framework.viewsets import ModelViewSet
from django.contrib.contenttypes.models import ContentType
from django.db.models import Q

from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

# Se usa el modelo de usuario de firebase_auth
CustomUser = get_user_model()


# * Home
def index(request):
    if request.user.is_authenticated:
        return redirect("dashboard")  # Redirige al dashboard si está autenticado
    return redirect("login")  # Redirige al login si no está autenticado


@api_view(["POST"])
def logout_view(request):
    response = Response({"message": "Sesión cerrada"})
    return response


from rest_framework.permissions import IsAuthenticated
from firebase_auth.authentication import FirebaseAuthentication


@api_view(["GET"])
@authentication_classes([FirebaseAuthentication])
@permission_classes([IsAuthenticated])
def obtener_perfil(request):
    perfil = getattr(request.user, "perfil", None)
    if not perfil:
        return Response({"error": "Perfil no encontrado"}, status=404)

    return Response(
        {
            "id": request.user.pk,
            "apodo": perfil.apodo,
            "biografia": perfil.biografia,
            "avatar": (
                request.build_absolute_uri(perfil.avatar.url) if perfil.avatar else None
            ),
        }
    )


# Proceso de generacion de invitacion a una campaña por medio de la creacion de un enlace a compartir con otros usuarios
class CrearInvitacionView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, campana_id):
        perfil = get_object_or_404(Perfil, user=request.user)
        campana = get_object_or_404(Campana, id=campana_id)

        if campana.dungeon_master != perfil:
            return Response(
                {"detail": "Solo el DM puede crear invitaciones"}, status=403
            )

        # Eliminar todas las invitaciones anteriores para ahorrar espacio
        Invitacion.objects.filter(campana=campana).delete()

        # Se crea una nueva invitación
        expiracion = now() + timedelta(days=1)
        invitacion = Invitacion.objects.create(
            campana=campana, creador=perfil, expiracion=expiracion
        )
        return Response({"codigo": str(invitacion.codigo), "expira_en": expiracion})


# Proceso de unirse a una campaña por medio de la invitacion generada por el DM
class UnirseCampanaView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, codigo):
        perfil = get_object_or_404(Perfil, user=request.user)
        try:
            invitacion = Invitacion.objects.get(codigo=codigo)
        except Invitacion.DoesNotExist:
            return Response({"detail": "Esta invitación no existe o se ha generado una nueva para esta campaña."}, status=400)

        if invitacion.expiracion < now():
            return Response({"detail": "Esta invitación ha expirado."}, status=400)

        if ParticipanteCampana.objects.filter(
            perfil=perfil, campana=invitacion.campana
        ).exists():
            return Response({"detail": "Ya formas parte de esta campaña."}, status=400)

        personajes = Personaje.objects.filter(creador=perfil)
        campana_data = CampanaSerializer(invitacion.campana).data
        personajes_data = PersonajeSerializer(personajes, many=True).data

        return Response(
            {
                "campana": campana_data,
                "personajes": personajes_data,
                "invitacion": str(invitacion.codigo),
            }
        )

    def post(self, request, codigo):
        perfil = get_object_or_404(Perfil, user=request.user)
        invitacion = get_object_or_404(Invitacion, codigo=codigo)
        personaje_id = request.data.get("personaje_id")

        if invitacion.expiracion < now():
            return Response({"detail": "Invitación expirada"}, status=400)

        if ParticipanteCampana.objects.filter(
            perfil=perfil, campana=invitacion.campana
        ).exists():
            return Response({"detail": "Ya formas parte de esta campaña"}, status=400)

        personaje = get_object_or_404(Personaje, id=personaje_id, creador=perfil)

        ParticipanteCampana.objects.create(
            perfil=perfil,
            campana=invitacion.campana,
            personaje=personaje,
            rol=RolCampana.objects.get(
                nombre="Jugador"
            ),  # Ajusta si tienes ID o lógica distinta
        )

        return Response(
            {"detail": "Te has unido a la campaña correctamente."}, status=201
        )


# Muestra toda la informacion de los items del inventario de un personaje, dividiendolos por tipo y mostrando sus atributos
# En un futuro...
class InventarioPorTipoView(APIView):
    def get(self, request, personaje_id):
        inventario = InventarioPersonaje.objects.filter(
            personaje_id=personaje_id
        ).select_related("item")

        agrupado = {
            "equipado": [],
            "armas": [],
            "equipamiento": [],
            "consumibles": [],
            "tesoros": [],
        }

        for entrada in inventario:
            item = entrada.item
            tipo = item.tipo_real().lower()

            # Base común del ítem
            data = {
                "id": entrada.id,
                "item_id": item.id,
                "nombre": item.nombre,
                "imagen": item.imagen.url if item.imagen else None,
                "cantidad": entrada.cantidad,
                "equipado": entrada.equipado,
                "tipo": tipo,
                "peso": item.peso,
                "valor": item.valor,
                "efecto": item.efecto,
                "informacion": item.informacion,
                "tags": [tag.nombre for tag in item.tags.all()],
            }

            # Atributos específicos por tipo
            if tipo == "arma" and hasattr(item, "arma"):
                arma = item.arma
                data.update(
                    {
                        "puntaje_fijo": arma.puntaje_fijo,
                        "puntaje_dados": arma.puntaje_dados,
                        "alcance": arma.alcance,
                    }
                )
                agrupado["armas"].append(data)

            elif tipo == "equipamiento" and hasattr(item, "equipamiento"):
                equipamiento = item.equipamiento
                data.update(
                    {
                        "tipo_equipamiento": equipamiento.get_tipo_display(),
                        "puntaje_fijo": equipamiento.puntaje_fijo,
                    }
                )
                agrupado["equipamiento"].append(data)

            elif tipo == "consumible" and hasattr(item, "consumible"):
                consumible = item.consumible
                data.update(
                    {
                        "duracion": consumible.duracion,
                        "usos": consumible.usos,
                    }
                )
                agrupado["consumibles"].append(data)

            elif tipo == "tesoro" and hasattr(item, "tesoro"):
                tesoro = item.tesoro
                data.update(
                    {
                        "rareza": tesoro.get_rareza_display(),
                    }
                )
                agrupado["tesoros"].append(data)

            # Equipado va en su grupo propio también
            if entrada.equipado:
                agrupado["equipado"].append(data)

        return Response(agrupado)


# * Websockets


class NotaViewSet(ModelViewSet):
    queryset = Nota.objects.all()
    serializer_class = NotaSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        perfil = self.request.user.perfil
        qs = Nota.objects.filter(
            Q(tipo="publica")
            | Q(tipo="privada", creador=perfil)
            | Q(tipo="dm", creador=perfil)
        )

        if self.action == "list":
            content_type_param = self.request.query_params.get("content_type")
            object_id = self.request.query_params.get("object_id")
            if content_type_param and object_id:
                try:
                    content_type = ContentType.objects.get(model=content_type_param)
                    qs = qs.filter(content_type=content_type, object_id=object_id)
                except ContentType.DoesNotExist:
                    return Nota.objects.none()

        return qs

    def perform_create(self, serializer):
        serializer.save(creador=self.request.user.perfil)


# * Vistas de muestras de la API
class CampanaListView(APIView):
    def get(self, request):
        campanas = Campana.objects.all()
        serializer = CampanaSerializer(campanas, many=True)
        return Response(serializer.data)


class CrearCampanaView(generics.CreateAPIView):
    queryset = Campana.objects.all()
    serializer_class = CampanaSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        perfil = self.request.user.perfil
        serializer.save(dungeon_master=perfil)


class CampanaDetailView(RetrieveUpdateDestroyAPIView):
    queryset = Campana.objects.all()
    serializer_class = CampanaSerializer


class PartyListView(APIView):
    def get(self, request, pk):
        campana = get_object_or_404(Campana, pk=pk)
        participantes = ParticipanteCampana.objects.filter(campana=campana)
        serializer = ParticipanteCampanaSerializer(participantes, many=True)
        return Response(serializer.data)


class PartyMemberDeleteView(APIView):
    def delete(self, request, pk, jug):
        campana = get_object_or_404(Campana, pk=pk)
        perfil_jugador = get_object_or_404(Perfil, pk=jug)

        try:
            participante = ParticipanteCampana.objects.get(
                perfil=perfil_jugador, campana=campana
            )
            participante.delete()
            return Response({"detail": "Participante eliminado."}, status=204)
        except ParticipanteCampana.DoesNotExist:
            return Response({"detail": "Participante no encontrado."}, status=404)


class PerfilDetailView(RetrieveUpdateAPIView):
    queryset = Perfil.objects.all()
    serializer_class = PerfilSerializer

    def get_object(self):
        user_id = self.kwargs["pk"]  # Se obtiene el pk del usuario desde la URL
        return get_object_or_404(Perfil, user__pk=user_id)


# Obtendra las campañas en las que el usuario está participando y las que ha creado
class MisCampanasView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user_id = self.kwargs["pk"]

        # Obtener el perfil del usuario autenticado
        user = get_object_or_404(CustomUser, pk=user_id)
        perfil = get_object_or_404(Perfil, user=user)

        # Campañas creadas por el usuario
        creadas = Campana.objects.filter(dungeon_master=perfil)

        # Campañas en las que participa (a través de ParticipanteCampana)
        participaciones = ParticipanteCampana.objects.filter(
            perfil=perfil
        ).select_related("campana")
        en_party = [p.campana for p in participaciones]

        return Response(
            {
                "creadas": CampanaSerializer(creadas, many=True).data,
                "en_party": CampanaSerializer(en_party, many=True).data,
            }
        )


# * Personajes

# Obtiene los personajes creados por un perfil
class MisPersonajesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user_id = self.kwargs["pk"]

        # Obtener el perfil del usuario autenticado
        user = get_object_or_404(CustomUser, pk=user_id)
        perfil = get_object_or_404(Perfil, user=user)

        personajes = Personaje.objects.filter(creador=perfil)

        return Response(PersonajeResumidoSerializer(personajes, many=True).data)


class PersonajeDetailView(RetrieveUpdateDestroyAPIView):
    queryset = Personaje.objects.all()
    serializer_class = PersonajeSerializer

    def patch(self, request, *args, **kwargs):
        instance = self.get_object()
        partial = True  # Permite actualizaciones parciales
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(serializer.data)


class CrearPersonajeView(generics.CreateAPIView):
    queryset = Personaje.objects.all()
    serializer_class = PersonajeSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        perfil = self.request.user.perfil
        serializer.save(creador=perfil)

# * Este es para personajes y enemigos
class IdiomaList(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        idiomas = Idioma.objects.all()
        return Response(IdiomaSerializer(idiomas, many=True).data)


# * Sesiones
class SesionesPorCampanaView(APIView):
    def get(self, request, campana_id):
        sesiones = Sesion.objects.filter(campana_id=campana_id).order_by('-fecha_inicio')
        serializer = SesionSerializer(sesiones, many=True)

        return Response(serializer.data)


class SesionDetailView(RetrieveUpdateDestroyAPIView):
    queryset = Sesion.objects.all()
    serializer_class = SesionSerializer
    permission_classes = [IsAuthenticated]

    def perform_update(self, serializer):
        instancia = serializer.save()
        data = SesionSerializer(instancia).data
        notificar_cambio("sesion", "update", data, object_id=instancia.id)

    def perform_destroy(self, instance):
        data = SesionSerializer(instance).data
        object_id = instance.id
        instance.delete()
        notificar_cambio("sesion", "delete", data, object_id=object_id)


class SesionCreateView(generics.CreateAPIView):
    serializer_class = SesionSerializer

    def perform_create(self, serializer):
        campana_id = self.kwargs["campana_id"]
        campana = Campana.objects.get(pk=campana_id)
        serializer.save(campana=campana)


class SesionComenzar(APIView):
    def post(self, request, campana_id, pk):
        sesion = get_object_or_404(Sesion, pk=pk)
        sesion.estado = "en_curso"
        sesion.save()

        notificar_cambio(
            modelo="sesion",
            tipo_accion="updated",
            objeto_serializado=SesionSerializer(sesion).data,
            object_id=sesion.id,
        )

        return Response({"detail": "Sesión comenzada."}, status=200)


class SesionProgramar(APIView):
    def post(self, request, campana_id, pk):
        sesion = get_object_or_404(Sesion, pk=pk)
        sesion.estado = "programada"
        sesion.save()

        notificar_cambio(
            modelo="sesion",
            tipo_accion="updated",
            objeto_serializado=SesionSerializer(sesion).data,
            object_id=sesion.id,
        )
        return Response({"detail": "Sesión programada."}, status=200)


class SesionFinalizar(APIView):
    def post(self, request, campana_id, pk):
        sesion = get_object_or_404(Sesion, pk=pk)
        sesion.estado = "finalizada"
        sesion.save()

        notificar_cambio(
            modelo="sesion",
            tipo_accion="updated",
            objeto_serializado=SesionSerializer(sesion).data,
            object_id=sesion.id,
        )

        return Response({"detail": "Sesión finalizada."}, status=200)

# * Encuentros de una campaña

class EncuentroListView(APIView):
    def get(self, request, campana_id):
        encuentros = Encuentro.objects.filter(campana_id=campana_id)
        serializer = EncuentroSerializer(encuentros, many=True)
        return Response(serializer.data)


class EncuentroDetailView(RetrieveUpdateDestroyAPIView):
    queryset = Encuentro.objects.all()
    serializer_class = EncuentroDetailSerializer
    permission_classes = [IsAuthenticated]

    # Por ahora no se puede editar un encuentro
    def perform_update(self, serializer):
        instancia = serializer.save()
        data = EncuentroSerializer(instancia).data
        notificar_cambio("encuentro", "update", data, object_id=instancia.id)

    def perform_destroy(self, instance):
        data = EncuentroSerializer(instance).data
        object_id = instance.id
        instance.delete()
        notificar_cambio("encuentro", "delete", data, object_id=object_id)

    def get(self, request, campana_id, pk):
        encuentro = get_object_or_404(
            Encuentro.objects.prefetch_related(
                "participantes__personaje", "participantes__enemigo"
            ),
            id=pk,
            campana__id=campana_id,
        )
        serializer = EncuentroDetailSerializer(encuentro, context={"request": request})
        return Response(serializer.data)


class EncuentroComenzar(APIView):
    def post(self, request, campana_id, pk):
        encuentro = get_object_or_404(Encuentro, pk=pk)
        encuentro.estado = "en_curso"

        participantes = encuentro.participantes.order_by("-iniciativa")

        if not participantes.exists():
            return Response(
                {"detail": "No hay participantes vivos."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Limpiar todos los turnos primero
        participantes.update(turno=False)

        # Marcar el primero
        primero = participantes.first()
        primero.turno = True
        primero.save()

        # Cambiar estado del encuentro si hace falta
        encuentro.estado = "en_curso"
        encuentro.save()

        serializer = EncuentroDetailSerializer(encuentro)

        notificar_cambio(
            modelo="encuentro",
            tipo_accion="updated",
            objeto_serializado=EncuentroSerializer(encuentro).data,
            object_id=encuentro.id,
        )

        encuentro.save()
        return Response(
            {"detail": "Encuentro comenzado.", "id": encuentro.id}, status=200
        )


class EncuentroProgramar(APIView):
    def post(self, request, campana_id, pk):
        encuentro = get_object_or_404(Encuentro, pk=pk)
        encuentro.estado = "programado"

        participantes = encuentro.participantes.order_by("-iniciativa")
        encuentro.save()

        notificar_cambio(
            modelo="encuentro",
            tipo_accion="updated",
            objeto_serializado=EncuentroSerializer(encuentro).data,
            object_id=encuentro.id,
        )

        return Response({"detail": "Encuentro programado."}, status=200)


class EncuentroFinalizar(APIView):
    def post(self, request, campana_id, pk):
        encuentro = get_object_or_404(Encuentro, pk=pk)
        encuentro.estado = "finalizado"

        participantes = encuentro.participantes.order_by("-iniciativa")

        # Limpiar todos los turnos
        participantes.update(turno=False)

        encuentro.save()

        notificar_cambio(
            modelo="encuentro",
            tipo_accion="updated",
            objeto_serializado=EncuentroSerializer(encuentro).data,
            object_id=encuentro.id,
        )

        return Response({"detail": "Encuentro finalizado."}, status=200)


# Cambiar turno del participante de un encuentro
# Se le pasa el número del participante de la lista ordenada al que se quiere cambiar, empezando por 0
class EncuentroCambiarTurno(APIView):
    def post(self, request, campana_id, pk, turno):
        encuentro = get_object_or_404(Encuentro, pk=pk, campana__id=campana_id)
        participantes = list(encuentro.participantes.order_by("-iniciativa"))

        if not participantes:
            return Response({"detail": "No hay participantes vivos."}, status=400)

        # Limpiar todos los turnos
        ParticipanteEncuentro.objects.filter(encuentro=encuentro).update(turno=False)

        # Controlar índice inválido
        if turno < 0 or turno >= len(participantes):
            return Response({"detail": "Índice de turno fuera de rango."}, status=400)

        participante = participantes[turno]
        participante.turno = True
        participante.save()

        # Retornar el encuentro actualizado
        serializer = EncuentroDetailSerializer(encuentro)

        notificar_cambio(
            modelo="encuentro",
            tipo_accion="updated",
            objeto_serializado=EncuentroDetailSerializer(encuentro).data,
            object_id=encuentro.id,
        )

        return Response(serializer.data, status=200)


class EncuentrosActivosView(APIView):
    def get(self, request, campana_id):
        try:
            encuentros_activos = Encuentro.objects.filter(
                campana_id=campana_id, estado="en_curso"
            )

            serializer = EncuentroSerializer(encuentros_activos, many=True)
            return Response(serializer.data)
        except Exception as e:
            return Response(
                {"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class EncuentroParticipanteActualizar(RetrieveUpdateAPIView):
    queryset = ParticipanteEncuentro.objects.all()
    serializer_class = ParticipanteEncuentroSerializer
    permission_classes = [IsAuthenticated]

    def patch(self, request, campana_id, pk, participante_pk):
        participante = get_object_or_404(ParticipanteEncuentro, pk=participante_pk)
        serializer = self.get_serializer(participante, data=request.data)

        if serializer.is_valid():
            serializer.save()
            notificar_cambio(
                modelo="participanteencuentro",
                tipo_accion="updated",
                objeto_serializado=serializer.data,
                object_id=participante.id,
            )
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CrearEncuentroView(generics.CreateAPIView):
    queryset = Encuentro.objects.all()
    serializer_class = EncuentroSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        campana_id = self.kwargs["campana_id"]
        campana = Campana.objects.get(pk=campana_id)
        serializer.save(campana=campana)

# Al crear, se asignan los participantes al encuentro, pasándole como tipo si es un personaje o un enemigo
class CrearParticipanteEncuentroView(generics.CreateAPIView):
    queryset = ParticipanteEncuentro.objects.all()
    serializer_class = ParticipanteEncuentroSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        encuentro_id = self.kwargs["encuentro_id"]
        encuentro = Encuentro.objects.get(pk=encuentro_id)
        tipo = self.request.data.get("tipo")
        iniciativa = self.request.data.get("iniciativa")

        if tipo == "personaje":
            personaje_id = self.request.data.get("personaje_id")
            personaje = Personaje.objects.get(pk=personaje_id)
            serializer.save(
                encuentro=encuentro, personaje=personaje, iniciativa=iniciativa
            )
        elif tipo == "enemigo":
            enemigo_id = self.request.data.get("enemigo_id")
            enemigo = Enemigo.objects.get(pk=enemigo_id)
            serializer.save(
                encuentro=encuentro,
                enemigo=enemigo,
                iniciativa=iniciativa,
                vitalidad_actual_enemigo=enemigo.vitalidad_maxima,
            )
        else:
            raise serializers.ValidationError("Tipo de participante inválido")


#? No usado en v1.0.
# * Misiones
class MisionListView(APIView):
    def get(self, request, campana_id):
        misiones = Mision.objects.filter(campana_id=campana_id)
        serializer = MisionSerializer(misiones, many=True)
        return Response(serializer.data)

# * Usado en websockets para el useModeloWebSocket

# Websocket para actualizar vistas de lista o detalle de un modelo entre clientes si ambos estan viendo el mismo componente
def notificar_cambio(modelo, tipo_accion, objeto_serializado, object_id=None):
    channel_layer = get_channel_layer()

    # Notificar detalle
    if object_id:
        async_to_sync(channel_layer.group_send)(
            f"modelo_{modelo}_{object_id}",
            {
                "type": "send_update",
                "model": modelo,
                "action": tipo_accion,
                "data": objeto_serializado,
            },
        )

    # Notificar lista
    async_to_sync(channel_layer.group_send)(
        f"modelo_{modelo}_list",
        {
            "type": "send_update",
            "model": modelo,
            "action": tipo_accion,
            "data": objeto_serializado,
        },
    )

# * Enemigos

class EnemigoListView(APIView):
    def get(self, request):
        enemigos = Enemigo.objects.all()
        serializer = EnemigoResumidoSerializer(enemigos, many=True)
        return Response(serializer.data)


class CrearEnemigoView(generics.CreateAPIView):
    queryset = Enemigo.objects.all()
    serializer_class = EnemigoSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        perfil = self.request.user.perfil
        serializer.save(creador=perfil)


class EnemigoDetailView(RetrieveUpdateDestroyAPIView):
    queryset = Enemigo.objects.all()
    serializer_class = EnemigoSerializer

    def patch(self, request, *args, **kwargs):
        instance = self.get_object()
        partial = True  # Permite actualizaciones parciales
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(serializer.data)

# * Información adicional de un perfil

class InfoPerfilView(RetrieveAPIView):
    def get(self, request, *args, **kwargs):
        user_id = self.kwargs["pk"]

        # Obtener el perfil del usuario autenticado
        user = get_object_or_404(CustomUser, pk=user_id)
        perfil = get_object_or_404(Perfil, user=user)

        # Campañas creadas por el usuario
        creadas = Campana.objects.filter(dungeon_master=perfil)

        # Campañas en las que participa (a través de ParticipanteCampana)
        participaciones = ParticipanteCampana.objects.filter(
            perfil=perfil
        ).select_related("campana")
        en_party = [p.campana for p in participaciones]

        # Personajes creados por el usuario
        personajes = Personaje.objects.filter(creador=perfil)

        return Response(
            {
                "creadas": CampanaSerializer(creadas, many=True).data,
                "en_party": CampanaSerializer(en_party, many=True).data,
                "personajes": PersonajeSerializer(personajes, many=True).data,
            }
        )
