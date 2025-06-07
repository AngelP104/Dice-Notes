from django.utils import timezone
from dndapp.models import ParticipanteEncuentro

# Funciones de WebSockets.
#! NO USADO

def iniciar_encuentro(encuentro):
    participantes = list(encuentro.participantes.all().order_by("-iniciativa"))

    for i, participante in enumerate(participantes):
        participante.turno = (i == 0)  # El primero tiene el turno
    encuentro.estado = "en_curso"
    encuentro.save()

    ParticipanteEncuentro.objects.bulk_update(participantes, ["turno"])
    return encuentro


def avanzar_turno(encuentro):
    vivos = list(encuentro.participantes.filter(estado="vivo").order_by("-iniciativa"))
    if not vivos:
        return None

    actual_idx = next((i for i, p in enumerate(vivos) if p.turno), -1)

    updates = []
    if actual_idx != -1:
        vivos[actual_idx].turno = False
        updates.append(vivos[actual_idx])

    siguiente_idx = 0 if actual_idx + 1 >= len(vivos) else actual_idx + 1
    vivos[siguiente_idx].turno = True
    updates.append(vivos[siguiente_idx])

    ParticipanteEncuentro.objects.bulk_update(updates, ["turno"])
    return vivos[siguiente_idx]


def terminar_encuentro(encuentro):
    encuentro.estado = "finalizado"
    encuentro.fecha_fin = timezone.now()
    encuentro.save()
    encuentro.participantes.update(turno=False)
    return encuentro


def serialize_encuentro(encuentro):
    def participante_to_dict(p):
        entidad = p.personaje or p.enemigo
        nombre = entidad.nombre if entidad else "Desconocido"
        return {
            "id": p.id,
            "nombre": nombre,
            "iniciativa": p.iniciativa,
            "turno": p.turno,
            "estado": p.estado,
            "tipo": "personaje" if p.personaje else "enemigo",
        }

    return {
        "id": encuentro.id,
        "nombre": encuentro.nombre,
        "estado": encuentro.estado,
        "fecha_fin": encuentro.fecha_fin,
        "participantes": [participante_to_dict(p) for p in encuentro.participantes.all()]
    }
