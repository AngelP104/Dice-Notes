# Generated by Django 5.1.2 on 2025-05-16 16:42

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('dndapp', '0003_remove_encuentro_sesion_alter_nota_tipo'),
    ]

    operations = [
        migrations.AddField(
            model_name='participanteencuentro',
            name='turno',
            field=models.BooleanField(default=False),
        ),
    ]
