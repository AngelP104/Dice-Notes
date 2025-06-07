from django.urls import re_path
from api.consumers import NotaConsumer, EncuentroConsumer, ModeloConsumer

websocket_urlpatterns = [
    re_path(r'ws/notas/(?P<model>\w+)/(?P<object_id>\d+)/$', NotaConsumer.as_asgi()),


    re_path(r'ws/modelos/(?P<model>\w+)/$', ModeloConsumer.as_asgi()),  # para listas
    re_path(r'ws/modelos/(?P<model>\w+)/(?P<object_id>\d+)/$', ModeloConsumer.as_asgi()), # para detalles

    re_path(r"ws/encuentro/(?P<encuentro_id>\d+)/$", EncuentroConsumer.as_asgi()),
]

# Encuentroconsumer obsoleto, no hacer caso