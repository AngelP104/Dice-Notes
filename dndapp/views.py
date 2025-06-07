from django.shortcuts import render, redirect,  get_object_or_404
from django.urls import reverse_lazy
from .models import *
from .forms import EncuentroForm, CampanaForm, PersonajeForm
from  django.contrib import messages
from django.views import generic
from django.views.generic.edit import CreateView, UpdateView, DeleteView


# Create your views here.
#! Antiguas vistas de prueba con Django templates. Las vistas de la aplicación están en la carpeta "api/"
def index(request):
    text ="hola mundo"
    
    return render(
        request,
        "index.html",
        context={
            "text": text,
        },
    )
    
class CampanaListView(generic.ListView):
    model = Campana
    template_name = "campana-list.html"

class CampanaDetailView(generic.DetailView):
    model = Campana
    template_name = "campana-detail.html"    
    
class CampanaUpdate(UpdateView):
    model = Campana
    fields = ["titulo","info","home_info","imagen"]
    template_name = "formulario/campana_modificar.html"
    success_url = reverse_lazy('campana-list')
    
class CampanaDelete(DeleteView):
    model = Campana
    template_name = "formulario/campana_eliminar.html"
    success_url = reverse_lazy('campana-list')

def formularioEncuentro(request):
    if request.method == 'POST':
        form = EncuentroForm(request.POST)
        if form.is_valid():  # Al enviar el formulario
            encuentro = form.save(commit=False)
            # Si es necesario, puedes asociar el encuentro con una campaña específica
            encuentro.campana = request.user.perfil.campanas_creadas.first()  # Suponiendo que un usuario tiene una campaña
            encuentro.save()
            messages.success(request, "El encuentro fue creado correctamente")
            return redirect('formularioEncuentro')
    else:
        form = EncuentroForm()

    return render(request, 'encuentro_formulario.html', {
        'form': form,
    })

def formularioCampana(request):
    if request.method == 'POST':
        form = CampanaForm(request.POST)

        if form.is_valid():
            campana = form.save(commit=False)  # No guardar aún
            campana.dungeon_master = request.user.perfil  # Asegurar un perfil válido
            campana.save()  # Ahora sí guardar
            form.save_m2m()  # Guardar relaciones ManyToMany
            messages.success(request, "La campaña fue creada correctamente")
            return redirect('campana-list')
    else:
        form = CampanaForm()

    return render(request, 'formulario/campana_formulario.html', {'form': form})
    
def perfilDetalle(request,pk):
    perfil = get_object_or_404(Perfil, pk=pk)
    
    return render(
        request,
        "perfil-detail.html",
        context={"perfil":perfil}
    )
    
class PerfilUpdate(UpdateView):
    model = Perfil
    fields = "__all__"
    template_name = "formulario/perfil_modificar.html"
    success_url = reverse_lazy('perfil-detail')
    

def formularioPersonaje(request):
    if request.method == 'POST':
        form = PersonajeForm(request.POST)
        if form.is_valid():
            personaje = form.save(commit=False)
            personaje.perfil = request.user.perfil  # Asociar el personaje con el perfil del usuario logueado
            personaje.save()
            messages.success(request, "El personaje fue creado correctamente")
            return redirect('perfilDetalle', pk=request.user.perfil.pk)
    else:
        form = PersonajeForm()

    return render(request, 'personaje_formulario.html', {'form': form})
    
class PersonajeListView(generic.ListView):
    model = Personaje
    template_name = "personaje-list.html"

class PersonajeDetailView(generic.DetailView):
    model = Personaje
    template_name = "personaje-detail.html"    
