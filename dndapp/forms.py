from django import forms
from django.forms import ModelForm
from .models import Encuentro, Campana, Personaje
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _

# Parte de la aplicación de prueba con Django Templates
class CampanaForm(forms.ModelForm):
    class Meta:
        model = Campana
        fields = "__all__"
        
class EncuentroForm(forms.ModelForm):
    class Meta:
        model = Encuentro
        fields = "__all__"
                
class PersonajeForm(forms.ModelForm):
    class Meta:
        model = Personaje
        fields = "__all__"