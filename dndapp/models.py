from django.db import models
from django.contrib.auth.models import User, AbstractUser, Permission
from colorfield.fields import ColorField
import uuid
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType
from django.dispatch import receiver
from django.db.models.signals import post_save, post_delete
from django.utils.timezone import now
from django.contrib.auth import get_user_model
from django.conf import settings

# * Gracias a la libreria random, podemos tirar dados *#

import random

# * Se merece su propio espacio *#

#from firebase_auth.models import CustomUser

#* MODELOS DE DICE & NOTES

CustomUser = get_user_model()

class Perfil(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, primary_key=True
    )
    apodo = models.CharField(max_length=100)
    biografia = models.TextField(max_length=500, blank=True, null=True)
    avatar = models.ImageField(
        upload_to="avatares/",
        null=True,
        blank=True,
        default="avatares/default_avatar.jpg",
    )

    def __str__(self):
        return self.apodo


# Señal para crear automáticamente un perfil cuando se crea un usuario
# @receiver(post_save, sender=CustomUser)
# def crear_perfil_automatico(sender, instance, created, **kwargs):
#     if created:
#         # Obtener la parte del email antes del "@"
#         base_apodo = instance.email.split("@")[0] if instance.email else "usuario"
#         apodo = base_apodo
#         counter = 1

#         # Buscar un apodo único
#         while Perfil.objects.filter(apodo=apodo).exists():
#             apodo = f"{base_apodo}{counter}"
#             counter += 1

#         Perfil.objects.create(user=instance, apodo=apodo)

#? No usado en v1.0
# Imagen: puede usarse tanto en el interior de las sesiones de una campaña como en un apartado propio de las campañas. Pensado para poner imagenes de NPCs y mapas a modo de informacion. No usado en v1.0.
class ImagenCampana(models.Model):
    nombre = models.CharField(max_length=50)
    imagen = models.ImageField(upload_to="img_campanas/")
    descripcion = models.CharField(max_length=100, blank=True, null=True)
    fecha_subida = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.titulo


# Campaña
class Campana(models.Model):
    nombre = models.CharField(max_length=50)
    dungeon_master = models.ForeignKey(
        Perfil,
        on_delete=models.CASCADE,
        related_name="campanas_creadas",
        null=True,
        blank=True,
    )
    descripcion_corta = models.TextField(max_length=100, null=True, blank=True)
    imagen = models.ImageField(
        upload_to="campanas/",
        null=True,
        blank=True,
        default="campanas/default_campana.jpg",  # Imagen predeterminada
    )
    descripcion_larga = models.TextField(null=True, blank=True)
    imagenes = models.ManyToManyField(ImagenCampana, blank=True)

    def __str__(self):
        return self.nombre

    @staticmethod
    def crear_permisos():
        content_type = ContentType.objects.get_for_model(Campana)
        permisos = [
            ("gestionar_sesiones", "Puede gestionar sesiones"),
            ("gestionar_misiones", "Puede gestionar misiones"),
            ("gestionar_encuentros", "Puede gestionar encuentros"),
            ("gestionar_personajes", "Puede gestionar personajes"),
            ("crear_invitaciones", "Puede crear invitaciones")
            ]

#? No usado en v1.0
# Asignación de roles a nivel de aplicación, aplicables a cada jugador de cada campaña
class RolCampana(models.Model):
    nombre = models.CharField(max_length=50, unique=True)
    permisos = models.ManyToManyField(Permission, blank=True)
    
    def __str__(self):
        return self.nombre

# Modelo de control de roles y perfiles con personajes por campañas
class ParticipanteCampana(models.Model):
    perfil = models.ForeignKey(Perfil, on_delete=models.CASCADE)
    campana = models.ForeignKey(Campana, on_delete=models.CASCADE)
    rol = models.ForeignKey(RolCampana, on_delete=models.SET_NULL, null=True)
    personaje = models.ForeignKey('Personaje', on_delete=models.CASCADE, null=True, blank=True)
    
    class Meta:
        unique_together = ("perfil", "campana") # Un usuario solo tiene 1 rol por campaña
        
    def __str__(self):
        return f"{self.perfil} en {self.campana} como {self.rol}"

class Invitacion(models.Model):
    campana = models.ForeignKey(Campana, on_delete=models.CASCADE, related_name="invitaciones")
    codigo = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    creador = models.ForeignKey(Perfil, on_delete=models.CASCADE)
    creado_en = models.DateTimeField(default=now)
    expiracion = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"Invitación a {self.campana.nombre} - Código: {self.codigo}"

# Una sesión es una parte de la campaña. Aquí se podrán añadir notas y reproducir encuentros.
class Sesion(models.Model):
    campana = models.ForeignKey(
        Campana, on_delete=models.CASCADE, related_name="sesiones"
    )
    nombre = models.CharField(max_length=100)
    fecha_inicio = models.DateTimeField(blank=True, null=True)
    ubicacion = models.CharField(max_length=250, blank=True, null=True)
    imagenes = models.ManyToManyField(ImagenCampana, blank=True)
    ESTADO_SESION = [
        ("programada", "Programada"),
        ("en_curso", "En curso"),
        ("finalizada", "Finalizada"),
    ]
    estado = models.CharField(
        max_length=50, choices=ESTADO_SESION, default="programada"
    )

    def __str__(self):
        return f"Sesión '{self.nombre}', de '{self.campana.nombre}"


# Una nota puede estar en sesiones, personajes, items, hechizos, etc.
# Se relaciona con el modelo de contenido genérico de Django
class Nota(models.Model):
    creador = models.ForeignKey(Perfil, on_delete=models.CASCADE)
    fecha_modificacion = models.DateTimeField(auto_now=True)
    contenido = models.TextField(max_length=10000, null=True, blank=True)

    TIPO_NOTA = (
        ("privada", "Privada"),
        ("publica", "Pública"),
        ("dm", "DM y Jugador"),
    )
    tipo = models.CharField(max_length=10, choices=TIPO_NOTA)

    # Relación genérica para asociar la nota a cualquier modelo
    content_type = models.ForeignKey(
        ContentType, on_delete=models.CASCADE, null=True, blank=True
    )
    object_id = models.PositiveIntegerField(
        null=True, blank=True
    )  # Era UUID, no podia reconocer los demas modelos
    content_object = GenericForeignKey("content_type", "object_id")

    def __str__(self):
        return f"Nota de {self.creador.apodo} en {self.content_object} ({self.get_tipo_display()})"


#? No usado en v1.0
# Etiquetas para clasificar items y hechizos
class Tag(models.Model):
    nombre = models.CharField(max_length=50, unique=True)
    color_fondo = ColorField(default="#f25f29")
    color_texto = ColorField(default="#FFFFFF")

    def __str__(self):
        return f"{self.nombre} - Fondo: {self.color_fondo}, Texto: {self.color_texto}"


#? No usado en v1.0.
class Item(models.Model):
    nombre = models.CharField(max_length=100)
    peso = models.FloatField(null=True, blank=True)  # Peso en libras
    valor = models.PositiveIntegerField(null=True, blank=True)  # Monedas de oro
    efecto = models.CharField(
        max_length=100, blank=True, null=True
    )  # Efecto del ítem si tiene
    informacion = models.TextField(
        max_length=2000, blank=True, null=True
    )  # Descripción adicional
    tags = models.ManyToManyField("Tag", blank=True)  # Relación con etiquetas
    imagen = models.ImageField(upload_to="items/", null=True, blank=True)
    
    def tipo_real(self):
        if hasattr(self, 'arma'):
            return 'Arma'
        elif hasattr(self, 'equipamiento'):
            return 'Equipamiento'
        elif hasattr(self, 'consumible'):
            return 'Consumible'
        elif hasattr(self, 'tesoro'):
            return 'Tesoro'
        return 'Item'

    def __str__(self):
        return f"{self.nombre} ({self.tipo_real()})"

#? No usado en v1.0.
class Arma(models.Model):
    item = models.OneToOneField(Item, on_delete=models.CASCADE, related_name='arma')
    puntaje_fijo = models.IntegerField(blank=True, null=True)  # Daño fijo (Ej: 5)
    puntaje_dados = models.CharField(
        max_length=10, blank=True, null=True
    )  # Daño con dados (Ej: 2d6)
    alcance = models.CharField(
        max_length=50, blank=True, null=True
    )  # Ej: "Cuerpo a cuerpo"


    def __str__(self):
        if self.puntaje_fijo is not None:
            return f"{self.item.nombre} (Arma - {self.puntaje_fijo} daño fijo)"
        elif self.puntaje_dados:
            return f"{self.item.nombre} (Arma - {self.puntaje_dados} daño)"
        return f"{self.item.nombre} (Arma)"


#? No usado en v1.0.
class Equipamiento(models.Model):
    EQUIPAMIENTO_TIPOS = [
        ("ropa", "Ropa"),
        ("accesorio", "Accesorio"),
        ("ligera", "Armadura ligera"),
        ("media", "Armadura media"),
        ("pesada", "Armadura pesada"),
        ("otro", "Otro"),
    ]
    item = models.OneToOneField(Item, on_delete=models.CASCADE, related_name='equipamiento')
    tipo = models.CharField(max_length=50, choices=EQUIPAMIENTO_TIPOS)
    puntaje_fijo = models.IntegerField(blank=True, null=True)  # +HP fija (Ej: 5)

    def __str__(self):
        return f"{self.item.nombre} ({self.tipo})"


#? No usado en v1.0.
class Consumible(models.Model):
    item = models.OneToOneField(Item, on_delete=models.CASCADE, related_name='consumible')
    duracion = models.CharField(max_length=50, blank=True, null=True)  # Ej: "1 hora, 2 minutosm 3 turnos"
    usos = models.PositiveIntegerField(
        default=1, blank=True, null=True
    )  # Cuántas veces se puede usar

    def __str__(self):
        return f"{self.item.nombre} (Consumible - {self.usos} usos)"


#? No usado en v1.0.
class Tesoro(models.Model):
    RAREZAS = [
        ("comun", "Común"),
        ("poco_comun", "Poco común"),
        ("raro", "Raro"),
        ("muy_raro", "Muy raro"),
        ("legendario", "Legendario"),
        ("artefacto", "Artefacto"),
    ]
    item = models.OneToOneField(Item, on_delete=models.CASCADE, related_name='tesoro')
    rareza = models.CharField(max_length=50, choices=RAREZAS, blank=True, null=True)

    def __str__(self):
        return f"Tesoro: {self.item.nombre} ({self.rareza})"


#? No usado en v1.0.
class Hechizo(models.Model):
    nombre = models.CharField(max_length=100)
    nivel = models.PositiveIntegerField(null=True, blank=True)

    ESCUELAS_MAGIA = [
        ("abjuracion", "Abjuración (Protección y disipación)"),
        ("adivinacion", "Adivinación (Conocimiento y visión)"),
        ("conjuracion", "Conjuración (Invocación y teletransporte)"),
        ("encantamiento", "Encantamiento (Control mental y persuasión)"),
        ("evocacion", "Evocación (Daño elemental y energía)"),
        ("ilusion", "Ilusión (Engaño y manipulación de la realidad)"),
        ("nigromancia", "Nigromancia (Muerte y manipulación de almas)"),
        ("transmutacion", "Transmutación (Cambio de formas y materiales)"),
    ]
    escuela = models.CharField(max_length=100, choices=ESCUELAS_MAGIA)
    informacion = models.TextField(max_length=2000, null=True, blank=True)
    alcance = models.CharField(max_length=50, null=True, blank=True)
    duracion = models.CharField(max_length=50, null=True, blank=True)
    tiempo_lanzamiento = models.CharField(
        max_length=50, null=True, blank=True
    )  # Algunos hechizos pueden tomar más de un minuto en lanzarse o algunos turnos
    efecto = models.CharField(max_length=50, blank=True, null=True)
    usos = models.PositiveIntegerField(blank=True, null=True)
    valor = models.PositiveIntegerField(null=True, blank=True)  # Monedas de oro

    puntaje_fijo = models.IntegerField(
        blank=True, null=True
    )  # Puntaje de daño fijo: Ej, daño 2
    puntaje_dados = models.CharField(
        max_length=10, blank=True, null=True
    )  # Puntaje de daño con dados: Ej, 2d6

    tags = models.ManyToManyField(Tag, blank=True)  # Relacion con etiquetas

    def __str__(self):
        return f"{self.nombre} ({self.get_escuela_display()})"


#? No usado en v1.0.
class InventarioPersonaje(models.Model):
    personaje = models.ForeignKey(
        "Personaje", on_delete=models.CASCADE, related_name="inventario"
    )
    item = models.ForeignKey(Item, on_delete=models.CASCADE)
    cantidad = models.PositiveIntegerField(default=1)
    equipado = models.BooleanField(default=False)

    # Monedas directamente en el inventario
    oro = models.PositiveIntegerField(default=0)
    plata = models.PositiveIntegerField(default=0)
    cobre = models.PositiveIntegerField(default=0)
    electrum = models.PositiveIntegerField(default=0)
    platino = models.PositiveIntegerField(default=0)

    def __str__(self):
        return f"x{self.cantidad} {self.item.nombre} de {self.personaje.nombre}"


#? No usado en v1.0.
class InventarioParty(models.Model):
    campana = models.ForeignKey(
        Campana, on_delete=models.CASCADE, related_name="inventario"
    )
    item = models.ForeignKey(Item, on_delete=models.CASCADE)
    cantidad = models.PositiveIntegerField(default=1)

    # Monedas en inventario de campaña
    oro = models.PositiveIntegerField(default=0)
    plata = models.PositiveIntegerField(default=0)
    cobre = models.PositiveIntegerField(default=0)
    electrum = models.PositiveIntegerField(default=0)
    platino = models.PositiveIntegerField(default=0)

    def __str__(self):
        return f"x{self.cantidad} {self.item.nombre} en {self.campana.nombre}"
    
# Idiomas que pueden haber en la aplicación
class Idioma(models.Model):
    nombre = models.CharField(max_length=50, unique=True)

    def __str__(self):
        return self.nombre

    #!AÑADIR A MANO TODOS LOS IDIOMAS
    """ 
    IDIOMAS = (
        ('comun', 'Común'),
        ('infracomun', 'Infracomún'),
        ('enano', 'Enano'),
        ('elfico', 'Élfico'),
        ('gigante', 'Gigante'),
        ('gnomo', 'Gnomo'),
        ('goblin', 'Goblin'),
        ('mediano', 'Mediano'),
        ('draconido', 'Dracónido'),
        ('druidico', 'Druídico'),
        ('orco', 'Orco'),
        ('troll', 'Troll'),
        ('vampiro', 'Vampiro'),
        ('brujo', 'Brujo'),
    )
    """

#? No usado en v1.0.
# Alineamiento de personajes y enemigos
class Alineamiento(models.Model):
    nombre = models.CharField(max_length=50, unique=True)

    def __str__(self):
        return self.nombre

    #!AÑADIR A MANO TODOS LOS ALINEAMIENTOS
    """
    ALINEAMIENTOS = (
        ('legal_bueno', 'Legal bueno'),
        ('neutral_bueno', 'Neutral bueno'),
        ('caotico_bueno', 'Caótico bueno'),
        ('legal_neutral', 'Legal neutral'),
        ('neutral', 'Neutral'),
        ('caotico_neutral', 'Caótico neutral'),
        ('legal_malvado', 'Legal malvado'),
        ('neutral_malvado', 'Neutral malvado'),
        ('caotico_malvado', 'Caótico malvado'),
    )
    """


class Personaje(models.Model):
    creador = models.ForeignKey(
        Perfil, on_delete=models.CASCADE, related_name="personajes"
    )
    imagen = models.ImageField(upload_to="pjs/", blank=True, null=True, default="pjs/default_pj.jpg")
    nombre = models.CharField(max_length=100)
    raza = models.CharField(max_length=50)
    subraza = models.CharField(max_length=50, blank=True, null=True)
    clase = models.CharField(max_length=50)
    subclase = models.CharField(max_length=50, blank=True, null=True)
    nivel = models.PositiveIntegerField()
    xp = models.PositiveBigIntegerField(null=True, blank=True)
    #alineamiento = models.ForeignKey(Alineamiento, on_delete=models.SET_NULL, null=True, blank=True)
    inspiracion = models.BooleanField(default=False)

    vitalidad_maxima = models.IntegerField()
    vitalidad_actual = models.IntegerField()

    # Atributos
    fuerza = models.IntegerField()
    destreza = models.IntegerField()
    constitucion = models.IntegerField()
    inteligencia = models.IntegerField()
    sabiduria = models.IntegerField()
    carisma = models.IntegerField()
    
    # Bono competencia
    bono_competencia = models.PositiveIntegerField(null=True, blank=True)
    competencias = models.JSONField(default=list, blank=True, null=True)


    armadura_base = models.PositiveIntegerField(default=0)
    idiomas = models.ManyToManyField(Idioma, related_name="personajes")
    color_token = ColorField(default="#FFFFFF")

    def __str__(self):
        return f"{self.nombre}. {self.raza} - {self.clase}: {self.subclase}. (Nivel {self.nivel})"

#? No usado en v1.0.
class PersonajeNoJugable(models.Model):
    campana = models.ForeignKey(Campana, on_delete=models.CASCADE, related_name="pnjs")
    nombre = models.CharField(max_length=100)
    imagen = models.ImageField(upload_to="pnjs/", blank=True, null=True)

    def __str__(self):
        return self.nombre


class Enemigo(models.Model):
    nombre = models.CharField(max_length=255)
    creador = models.ForeignKey(
        Perfil, on_delete=models.CASCADE, related_name="enemigos", null=True
    )
    tamano = models.CharField(max_length=50, blank=True, null=True)
    raza = models.CharField(max_length=100, blank=True, null=True)

    vitalidad_maxima = models.IntegerField(blank=True, null=True)

    #alineamiento = models.ForeignKey(Alineamiento, on_delete=models.SET_NULL, null=True, blank=True)
    armadura = models.IntegerField(blank=True, null=True)
    puntaje = models.CharField(max_length=50, blank=True, null=True)
    velocidad = models.CharField(max_length=50, blank=True, null=True)
    fuerza = models.IntegerField(null=True, blank=True)
    destreza = models.IntegerField(null=True, blank=True)
    constitucion = models.IntegerField(null=True, blank=True)
    inteligencia = models.IntegerField(null=True, blank=True)
    sabiduria = models.IntegerField(null=True, blank=True)
    carisma = models.IntegerField(null=True, blank=True)
    dificultad = models.IntegerField(blank=True, null=True)
    
    # Competencia
    bono_competencia = models.IntegerField(blank=True, null=True)
    competencias = models.JSONField(default=list, blank=True, null=True)
    
    xp = models.IntegerField(blank=True, null=True)
    sentidos = models.CharField(max_length=100, blank=True, null=True)
    idiomas = models.ManyToManyField(Idioma, blank=True)
    imagen = models.ImageField(upload_to="enemigos/", blank=True, null=True, default="enemigos/default_enemigo.jpg",)

    def calcular_puntaje(self):
        if self.puntaje_fijo is not None:
            return self.puntaje_fijo
        elif self.puntaje_dados:
            try:
                cantidad, caras = map(int, self.puntaje_dados.lower().split("d"))
                return sum(random.randint(1, caras) for _ in range(cantidad))
            except ValueError:
                return 0
        return 0

    def __str__(self):
        return self.nombre


# Encuentro que se puede generar dentro de una campaña
class Encuentro(models.Model):
    campana = models.ForeignKey(
        Campana, on_delete=models.CASCADE, related_name="encuentros"
    )
    nombre = models.CharField(max_length=200)
    fecha_fin = models.DateTimeField(null=True, blank=True) # Obsoleto

    ESTADO_ENCUENTRO = [
        ("programado", "Programado"),
        ("en_curso", "En curso"),
        ("finalizado", "Finalizado"),
    ]
    estado = models.CharField(
        max_length=50, choices=ESTADO_ENCUENTRO, default="programado"
    )

    personajes = models.ManyToManyField(
        "Personaje", through="ParticipanteEncuentro", blank=True
    )
    enemigos = models.ManyToManyField(
        "Enemigo", through="ParticipanteEncuentro", blank=True
    )

    def __str__(self):
        return f"Encuentro {self.nombre} - {self.campana.nombre} ({self.estado})"

# Participantes del encuentro
class ParticipanteEncuentro(models.Model):
    encuentro = models.ForeignKey(
        Encuentro, on_delete=models.CASCADE, related_name="participantes"
    )
    personaje = models.ForeignKey(
        Personaje, on_delete=models.CASCADE, null=True, blank=True
    )
    enemigo = models.ForeignKey(
        Enemigo, on_delete=models.CASCADE, null=True, blank=True
    )

    iniciativa = models.IntegerField(
        blank=True, null=True
    )  # Puede ser nulo antes del cálculo
    
    turno = models.BooleanField(default=False)  # Indica si es el turno del participante
    
    # Gestionado estáticamente en el front. Si en algún momento hay que extender la lista, hacer 'GET' a una url nueva
    estado = models.CharField(
        max_length=20,
        choices=[
            ("vivo", "Vivo"),
            ("inconsciente", "Inconsciente"),
            ("muerto", "Muerto"),
            ("otro", "Otro"),
        ],
        default="vivo",
    )
    vitalidad_actual_enemigo = models.IntegerField(
        blank=True, null=True
    )  # Vitalidad actual del enemigo en el encuentro

    def save(self, *args, **kwargs):
        """Genera iniciativa automáticamente si no tiene una asignada."""
        if self.iniciativa is None:
            self.iniciativa = self.tirar_iniciativa()
        super().save(*args, **kwargs)

    def tirar_iniciativa(self):
        """Simula el lanzamiento de un d20 + modificador de Destreza."""
        modificador_destreza = 0
        if self.personaje:
            modificador_destreza = (self.personaje.destreza - 10) // 2  # Fórmula D&D 5e
        elif self.enemigo:
            modificador_destreza = (
                (self.enemigo.destreza - 10) // 2 if self.enemigo.destreza else 0
            )

        return random.randint(1, 20) + modificador_destreza

    def __str__(self):
        if self.personaje:
            return f"{self.personaje.nombre} en '{self.encuentro}' (Iniciativa {self.iniciativa})"
        elif self.enemigo:
            return f"{self.enemigo.nombre} en '{self.encuentro}' (Iniciativa {self.iniciativa})"
        return "Participante sin entidad"

#? No usado en v1.0.
# Misiones dentro de una campaña
class Mision(models.Model):
    campana = models.ForeignKey(
        Campana, on_delete=models.CASCADE, related_name="misiones"
    )
    nombre = models.CharField(max_length=100)
    descripcion = models.TextField(max_length=1000)
    completada = models.BooleanField(default=False)
    tipo = models.CharField(
        max_length=50,
        choices=[
            ("principal", "Principal"),
            ("secundaria", "Secundaria"),
            ("opcional", "Opcional"),
        ],
        default="principal",
    )

    def __str__(self):
        return f"Misión {self.tipo}: '{self.nombre}' en {self.campana.nombre}"