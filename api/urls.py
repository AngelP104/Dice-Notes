from django.urls import path, re_path
from .views import *
from django.urls import include, path
from rest_framework import routers
from . import views

from django.conf import settings
from django.conf.urls.static import static

from rest_framework.routers import DefaultRouter
from .views import NotaViewSet

# Cruds Rapidos gestionados por Django Rest Framework
router = DefaultRouter()
router.register(r'notas', NotaViewSet, basename='nota')

urlpatterns = [
    path('', index, name='index'),
    
    # Inicio de sesión y registro Firebase
    path("logout/", logout_view, name="logout"),

    # PERFIL
    path('obtener-perfil/', obtener_perfil, name='obtener-perfil'), # Del navbar y para el useContext: usePerfil
    path('perfil/<uuid:pk>/', PerfilDetailView.as_view(), name='perfil-detail'),
    path('perfil/<uuid:pk>/info/', InfoPerfilView.as_view(), name="perfil-info"),
    
    
    # CAMPAÑAS
    # El primer enlace es de prueba general de campañas
    path('campanas/', CampanaListView.as_view(), name='campana-list'),
    path('mis-campanas/<uuid:pk>/', MisCampanasView.as_view(), name="mis-campanas"),
    path('mis-campanas/crear/', CrearCampanaView.as_view(), name='crear-campana'),
    
    
    # * Enlaces dentro de campañas
    # GENERAL
    path('campanas/<int:pk>/', CampanaDetailView.as_view(), name='campana-detail'), 
    path('campanas/<int:pk>/party/', PartyListView.as_view(), name='party-list'), 
    path('campanas/<int:pk>/party/<uuid:jug>/delete/', PartyMemberDeleteView.as_view(), name='party-member-delete'), 
    
    # SESIONES
    path('campanas/<int:campana_id>/sesiones/', SesionesPorCampanaView.as_view(), name='sesiones-por-campana'),
    path('campanas/<int:campana_id>/sesiones/<int:pk>/', SesionDetailView.as_view(), name='sesion-detail'),
    path('campanas/<int:campana_id>/sesiones/crear/', SesionCreateView.as_view(), name='sesion-create'),

    path('campanas/<int:campana_id>/sesiones/<int:pk>/comenzar/', SesionComenzar.as_view(), name='sesion-comenzar'),
    path('campanas/<int:campana_id>/sesiones/<int:pk>/programar/', SesionProgramar.as_view(), name='sesion-programar'),
    path('campanas/<int:campana_id>/sesiones/<int:pk>/finalizar/', SesionFinalizar.as_view(), name='sesion-finalizar'),
    
    # INVITACIONES
    path("campanas/<int:campana_id>/invitacion/", CrearInvitacionView.as_view(), name="crear-invitacion"),
    path("unirse/<uuid:codigo>/", UnirseCampanaView.as_view(), name="unirse-campana"),

    # NOTAS (WEBSOCKETS)
    path('', include(router.urls)),
    
    # ENCUENTROS
    path('campanas/<int:campana_id>/encuentros/', EncuentroListView.as_view(), name='encuentros-por-campana'),
    path('campanas/<int:campana_id>/encuentros/crear/', CrearEncuentroView.as_view(), name='crear-encuentro'),
    path("campanas/<int:campana_id>/encuentros/<int:encuentro_id>/participantes/crear/", CrearParticipanteEncuentroView.as_view(), name="crear-participante"),
    path("campanas/<int:campana_id>/encuentros/<int:pk>/", EncuentroDetailView.as_view(), name="encuentro-detail"),
    path("campanas/<int:campana_id>/encuentros/<int:pk>/comenzar/", EncuentroComenzar.as_view(), name="encuentro-comenzar"),
    path("campanas/<int:campana_id>/encuentros/<int:pk>/programar/", EncuentroProgramar.as_view(), name="encuentro-programar"),
    path("campanas/<int:campana_id>/encuentros/<int:pk>/finalizar/", EncuentroFinalizar.as_view(), name="encuentro-finalizar"),
    path("campanas/<int:campana_id>/encuentros/<int:pk>/turno/<int:turno>/", EncuentroCambiarTurno.as_view(), name="encuentro-finalizar"),
    path('campanas/<int:campana_id>/encuentros/activos/', EncuentrosActivosView.as_view(), name='encuentros-activos'),
    path('campanas/<int:campana_id>/encuentros/<int:pk>/participantes/<int:participante_pk>/', EncuentroParticipanteActualizar.as_view(), name="participante-actualizar"),
    
    # MISIONES
    path('campanas/<int:campana_id>/misiones/', MisionListView.as_view(), name='misiones-por-campana'),
    
    # * Fin enlaces dentro de campañas
    
    # PERSONAJES
    path('mis-personajes/<uuid:pk>/', MisPersonajesView.as_view(), name='mis-personajes'),
    #path('mis-personajes/', PersonajeViewSet.as_view(), name='personaje-viewset'),
    path('personajes/<int:pk>/', PersonajeDetailView.as_view(), name='personaje-detail'),

    path("personajes/<int:personaje_id>/inventario/", InventarioPorTipoView.as_view(), name="inventario-por-tipo"),
    path('mis-personajes/crear/', CrearPersonajeView.as_view(), name='crear-personaje'),

    # ENEMIGOS
    path('enemigos/', EnemigoListView.as_view(), name="enemigo-list"),
    path('enemigos/<int:pk>/', EnemigoDetailView.as_view(), name="enemigo-detail"),
    path('enemigos/crear/', CrearEnemigoView.as_view(), name="enemigos-list"),
    
    # OTROS
    path('idiomas/', IdiomaList.as_view(), name="idioma-list"),
]

