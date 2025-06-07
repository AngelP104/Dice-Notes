import json
from channels.generic.websocket import AsyncWebsocketConsumer, AsyncJsonWebsocketConsumer
from asgiref.sync import sync_to_async

from dndapp.models import Encuentro
from dndapp.services.encuentro_service import serialize_encuentro, iniciar_encuentro, avanzar_turno, terminar_encuentro

# Lógica de los consumidores de WebSocket para las notas y encuentros

#* NotaConsumer: Este consumidor maneja la lógica de las notas, como la creación y actualización de notas en tiempo real.
class NotaConsumer(AsyncWebsocketConsumer):
    #connect: Cuando un cliente se conecta a este WebSocket, se une a un grupo específico basado en el modelo y el ID del objeto.
    async def connect(self):
        self.user = self.scope["user"]
        if self.user.is_anonymous:
            await self.close()
            return
        self.model = self.scope['url_route']['kwargs']['model']
        self.object_id = self.scope['url_route']['kwargs']['object_id']
        self.group_name = f"notas_{self.model}_{self.object_id}"

        await self.channel_layer.group_add(
            self.group_name,
            self.channel_name
        )

        await self.accept()

    #disconnect: Cuando el cliente se desconecta, se sale del grupo.
    async def disconnect(self, close_code):
        if hasattr(self, "group_name"):
            await self.channel_layer.group_discard(
                self.group_name,
                self.channel_name
            )
        
    #receive: Cuando se recibe un mensaje, se intenta decodificarlo como JSON. Si es válido, se envía a todos los miembros del grupo.
    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
            await self.channel_layer.group_send(
                self.group_name,
                {
                    'type': 'send_update',
                    'model': data['model'],
                    'action': data['action'],
                    'data': data['data'],
                }
            )
        except json.JSONDecodeError:
            await self.send(text_data=json.dumps({'error': 'Invalid JSON'}))

    #send_update: Envía un mensaje a todos los miembros del grupo con el modelo, la acción y los datos.
    async def send_update(self, event):
        await self.send(text_data=json.dumps({
            'model': event['model'],
            'action': event['action'],
            'data': event['data'],
        }))

class ModeloConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = self.scope["user"]
        if self.user.is_anonymous:
            await self.close()
            return
        
        print("WebSocket modelo conectado:", self.user)
        
        self.model = self.scope["url_route"]["kwargs"]["model"]
        self.object_id = self.scope["url_route"]["kwargs"].get("object_id")
        self.group_name = f"modelo_{self.model}_{self.object_id or 'list'}"

        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        if hasattr(self, "group_name"):
            await self.channel_layer.group_discard(
                self.group_name,
                self.channel_name
            )
        

    async def receive(self, text_data):
        pass

    async def send_update(self, event):
        print("Enviando update a cliente:", event)
        await self.send(text_data=json.dumps({
            'model': event['model'],
            'action': event['action'],
            'data': event['data'],
        }))



#* EncuentroConsumer: Este consumidor maneja la lógica de los encuentros, como crear un encuentro, avanzar el turno y terminar un encuentro.
class EncuentroConsumer(AsyncJsonWebsocketConsumer):
    
    # connect: Cuando un cliente se conecta a este WebSocket, se une a un grupo específico basado en el ID del encuentro.
    # ! NO! TODOS LOS DE LA CAMPAÑA PUEDEN VER EL ENCUENTRO, NO SOLO LOS DEL ENCUENTRO
    async def connect(self):
        self.encuentro_id = self.scope["url_route"]["kwargs"]["encuentro_id"]
        self.group_name = f"encuentro_{self.encuentro_id}"

        await self.channel_layer.group_add(
            self.group_name,
            self.channel_name
        )

        await self.accept()
        
    # receive_json: Cuando se recibe un mensaje JSON, se maneja según la acción especificada (crear encuentro, siguiente turno o terminar encuentro).
    async def receive_json(self, content):
        action = content.get("action")
        data = content.get("data", {})

        if action == "crear_encuentro":
            await self.crear_encuentro(data)
        elif action == "siguiente_turno":
            await self.siguiente_turno(data)
        elif action == "terminar_encuentro":
            await self.terminar_encuentro(data)

    # crear_encuentro: Inicia un encuentro y envía el estado actualizado a todos los miembros del grupo.
    async def crear_encuentro(self, data):
        encuentro_id = data["encuentro_id"]
        encuentro = await sync_to_async(Encuentro.objects.get)(id=encuentro_id)
        await sync_to_async(iniciar_encuentro)(encuentro)
        await self.channel_layer.group_send(
            self.group_name,
            {
                "type": "broadcast_estado",
                "encuentro_id": encuentro.id,
            }
        )

    # siguiente_turno: Avanza el turno del encuentro y envía el estado actualizado a todos los miembros del grupo.
    async def siguiente_turno(self, data):
        encuentro = await sync_to_async(Encuentro.objects.get)(id=data["encuentro_id"])
        await sync_to_async(avanzar_turno)(encuentro)
        await self.channel_layer.group_send(
            self.group_name,
            {"type": "broadcast_estado", "encuentro_id": encuentro.id}
        )

    # terminar_encuentro: Termina el encuentro y envía el estado actualizado a todos los miembros del grupo.
    async def terminar_encuentro(self, data):
        encuentro = await sync_to_async(Encuentro.objects.get)(id=data["encuentro_id"])
        await sync_to_async(terminar_encuentro)(encuentro)
        await self.channel_layer.group_send(
            self.group_name,
            {"type": "broadcast_estado", "encuentro_id": encuentro.id}
        )

    # broadcast_estado: Envía el estado actualizado del encuentro a todos los miembros del grupo.
    async def broadcast_estado(self, event):
        encuentro_id = event["encuentro_id"]
        encuentro = await sync_to_async(Encuentro.objects.prefetch_related("participantes").get)(id=encuentro_id)
        
        # Serializa el encuentro
        await self.send_json({
            "type": "estado_actualizado",
            "encuentro": serialize_encuentro(encuentro)
        })