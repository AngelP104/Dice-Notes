from rest_framework import serializers
from dndapp.models import *

# Serializadores de modelos

class CustomUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ["username", "email"]


class PerfilSerializer(serializers.ModelSerializer):
    user = serializers.CharField(source="user.id", read_only=True)

    class Meta:
        model = Perfil
        fields = ["user", "apodo", "biografia", "avatar"]


class CampanaSerializer(serializers.ModelSerializer):
    dungeon_master = PerfilSerializer(read_only=True)

    class Meta:
        model = Campana
        fields = "__all__"


class IdiomaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Idioma
        fields = "__all__"


class AlineamientoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Alineamiento
        fields = "__all__"


class PersonajeSerializer(serializers.ModelSerializer):

    creador = PerfilSerializer(read_only=True)
    idiomas = IdiomaSerializer(many=True, read_only=True)
    idiomas_ids = serializers.PrimaryKeyRelatedField(
        queryset=Idioma.objects.all(), many=True, write_only=True, source="idiomas"
    )
    # alineamiento = serializers.PrimaryKeyRelatedField(queryset=Alineamiento.objects.all(), allow_null=True, required=False)

    class Meta:
        model = Personaje
        fields = "__all__"


class ParticipanteCampanaSerializer(serializers.ModelSerializer):
    perfil = PerfilSerializer()
    personaje = PersonajeSerializer()

    class Meta:
        model = ParticipanteCampana
        fields = "__all__"


class ItemSerializer(serializers.ModelSerializer):
    tipo = serializers.SerializerMethodField()

    class Meta:
        model = Item
        fields = ["id", "nombre", "imagen", "tipo"]

    def get_tipo(self, obj):
        return obj.tipo_real()


class InventarioPersonajeSerializer(serializers.ModelSerializer):
    item = ItemSerializer()

    class Meta:
        model = InventarioPersonaje
        fields = ["id", "item", "cantidad", "equipado"]


class SesionSerializer(serializers.ModelSerializer):

    class Meta:
        model = Sesion
        fields = "__all__"
        read_only_fields = ["campana", "estado"]


class EnemigoSerializer(serializers.ModelSerializer):
    idiomas = IdiomaSerializer(many=True, read_only=True)
    idiomas_ids = serializers.PrimaryKeyRelatedField(
        queryset=Idioma.objects.all(), many=True, write_only=True, source="idiomas"
    )
    creador = PerfilSerializer(read_only=True)

    class Meta:
        model = Enemigo
        fields = "__all__"


class PersonajeResumidoSerializer(serializers.ModelSerializer):
    creador = PerfilSerializer(read_only=True)

    class Meta:
        model = Personaje
        fields = [
            "id",
            "creador",
            "imagen",
            "color_token",
            "nombre",
            "clase",
            "subclase",
            "vitalidad_actual",
            "vitalidad_maxima",
            "fuerza",
            "destreza",
            "constitucion",
            "inteligencia",
            "sabiduria",
            "carisma",
            "armadura_base",
            "nivel",
            "raza",
        ]


class EnemigoResumidoSerializer(serializers.ModelSerializer):
    creador = PerfilSerializer(read_only=True)

    class Meta:
        model = Enemigo
        fields = [
            "id",
            "creador",
            "nombre",
            "raza",
            "vitalidad_maxima",
            "fuerza",
            "destreza",
            "constitucion",
            "inteligencia",
            "sabiduria",
            "carisma",
            "armadura",
            "imagen",
            "dificultad",
        ]


class ParticipanteEncuentroSerializer(serializers.ModelSerializer):
    personaje = PersonajeResumidoSerializer(read_only=True)
    enemigo = EnemigoResumidoSerializer(read_only=True)

    class Meta:
        model = ParticipanteEncuentro
        fields = [
            "id",
            "iniciativa",
            "turno",
            "estado",
            "vitalidad_actual_enemigo",  # solo cuando es enemigo
            "personaje",
            "enemigo",
        ]

    def validate(self, data):
        encuentro = data.get("encuentro")
        personaje = data.get("personaje")

        # Validar que el personaje no esté ya en la lista de participantes
        if personaje:
            if ParticipanteEncuentro.objects.filter(
                encuentro=encuentro, personaje=personaje
            ).exists():
                raise serializers.ValidationError(
                    "Este personaje ya está participando en este encuentro."
                )

        # * No se valida enemigos, ya que pueden ser varios del mismo tipoen un encuentro

        return data


class EncuentroSerializer(serializers.ModelSerializer):
    personajes = PersonajeResumidoSerializer(many=True, read_only=True)
    enemigos = EnemigoResumidoSerializer(many=True, read_only=True)

    class Meta:
        model = Encuentro
        fields = ["id", "nombre", "campana", "personajes", "enemigos", "estado"]

    def get_personajes(self, obj):
        participantes = obj.participantes.filter(personaje__isnull=False)
        personajes = [p.personaje for p in participantes]
        return PersonajeSerializer(personajes, many=True).data

    def get_enemigos(self, obj):
        participantes = obj.participantes.filter(enemigo__isnull=False)
        enemigos = [p.enemigo for p in participantes]
        return EnemigoSerializer(enemigos, many=True).data


class EncuentroDetailSerializer(serializers.ModelSerializer):
    participantes = serializers.SerializerMethodField()

    class Meta:
        model = Encuentro
        fields = "__all__"

    def get_participantes(self, obj):
        participantes = obj.participantes.order_by("-iniciativa")
        return ParticipanteEncuentroSerializer(participantes, many=True).data


class NotaSerializer(serializers.ModelSerializer):
    content_type = serializers.CharField(write_only=True)
    creador = PerfilSerializer(read_only=True)
    object_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = Nota
        fields = ["id", "contenido", "tipo", "creador", "content_type", "object_id"]

    def create(self, validated_data):
        content_type_str = validated_data.pop("content_type")
        object_id = validated_data.pop("object_id")

        try:
            content_type = ContentType.objects.get(model=content_type_str.lower())
        except ContentType.DoesNotExist:
            raise serializers.ValidationError({"content_type": "Modelo no válido."})

        validated_data["content_type"] = content_type
        validated_data["object_id"] = object_id

        return super().create(validated_data)


class MisionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Mision
        fields = "__all__"
        extra_kwargs = {
            "campana": {"required": False},
        }


# Obtiene las campañas en las que participa, las que hostea y los personajes creados por un perfil
class InfoPerfilSerializer(serializers.ModelSerializer):
    personajes = PersonajeResumidoSerializer(many=True, read_only=True)
    campanas = CampanaSerializer(many=True, read_only=True)
