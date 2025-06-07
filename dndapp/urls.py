from django.urls import include, path
from rest_framework import routers
from . import views

from django.conf import settings
from django.conf.urls.static import static


urlpatterns = [

    path("", views.index, name="index"),
    
    # Campaña
    path("campanas/", views.CampanaListView.as_view(), name="campana-list"),
    path("campanas/new/", views.formularioCampana, name="formularioCampana"),
    path("campanas/<uuid:pk>/", views.CampanaDetailView.as_view(), name="campana-detail"),
    path("campanas/edit/<uuid:pk>/", views.CampanaUpdate.as_view(), name="modificarCampana"),
    path("campanas/delete/<uuid:pk>/", views.CampanaDelete.as_view(), name="eliminarCampana"),
    
    # Encuentro
    path("campanas/<uuid:pk>/encuentros/new/", views.formularioEncuentro,  name="formularioEncuentro"),
    
    # Perfil
    path("perfiles/<int:pk>/", views.perfilDetalle, name="perfil-detail"),
    path("perfiles/<int:pk>/edit/", views.PerfilUpdate.as_view(), name="modificarPerfil"),
    path("perfiles/<int:pk>/personajes/", views.PersonajeListView.as_view(), name="personaje-list"),
    path("perfiles/<int:pk1>/personajes/<int:pk2>", views.PersonajeDetailView.as_view(), name="personaje-detail"),
    
    # Personaje
    path("perfiles/<int:pk>/personajes/new/", views.formularioPersonaje, name="formularioPersonaje"),
]
