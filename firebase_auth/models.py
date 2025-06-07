from django.db import models
import uuid
from django.contrib.auth.models import AbstractUser

# Create your models here.

# Modelo de usuario asociado directamente al UID de Firebase
class CustomUser(AbstractUser):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    firebase_uid = models.CharField(max_length=128, unique=True)

    def __str__(self):
        return self.username if self.username else self.email