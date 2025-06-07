""" from django.db.models.signals import post_save
from django.dispatch import receiver
from django.conf import settings
from dndapp.models import Perfil

print("Señales cargadas correctamente")

@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        base_apodo = instance.email.split("@")[0] if instance.email else "usuario"
        apodo = base_apodo
        counter = 1
        while Perfil.objects.filter(apodo=apodo).exists():
            apodo = f"{base_apodo}{counter}"
            counter += 1
        Perfil.objects.create(user=instance, apodo=apodo) """