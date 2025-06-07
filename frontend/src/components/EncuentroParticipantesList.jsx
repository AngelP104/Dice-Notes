import { usePerfil } from "../context/PerfilContext"
import { LoadingComponent } from "../components/LoadingComponent";
import { useState, useEffect, use } from "react";
import { useModeloWebSocket } from "../hooks/useModeloWebSocket";
import "@fortawesome/free-solid-svg-icons";
import { useForm } from "../hooks/useForm";
import { EncuentroParticipanteItem} from "./EncuentroParticipanteItem";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;


// Decidí que no fuese necesario actualizar el participante con un patch en cada parte del componente en tiempo real, sobrecargaría las peticiones al servidor.
// En su lugar, se actualiza completamente al cambiar el turno del encuentro, lo cual es más eficiente y evita problemas de sincronización.

// Lista los participantes de un encuentro, mostrando su estado, iniciativa y otras estadísticas.
export const EncuentroParticipantesList = ({ campanaId, dungeonMaster, listaParticipantes, encuentroId, actualizarParticipante, actualizarVidaPersonaje, encuentro }) => {

    const { perfil, user } = usePerfil();

    // Para manejar la vitalidad de los participantes


    // WebSocket para recibir actualizaciones en tiempo real de los participantes
    useModeloWebSocket({
        modelo: "participanteencuentro",
        objectId: encuentroId,
        // Antes de dockerizar
        // onMensaje: (participantesActualizados) => {
        //     actualizarParticipante(participantesActualizados.id);
        // },
        onMensaje: (msg) => {
            if (msg.type === "estado_actualizado" && msg.encuentro) {
                msg.encuentro.participantes.forEach((p) => {
                    actualizarParticipante(p.id, p);
                });
            }
        },
    });



    return (
        <>
            {listaParticipantes.length === 0 ? (
                <p className="text-gray-400">No hay participantes registrados.</p>
            ) : (
                <div className="grid grid-cols-1">
                    {listaParticipantes.map((p) => {
                        const esPersonaje = !!p.personaje;
                        const nombre = esPersonaje ? p.personaje.nombre : p.enemigo?.nombre || "Desconocido";

                        

                        return (
                            <EncuentroParticipanteItem
                                key={p.id}
                                p={p}
                                esPersonaje={esPersonaje}
                                nombre={nombre}
                                perfil={perfil}
                                dungeonMaster={dungeonMaster}
                                encuentro={encuentro}
                                actualizarParticipante={actualizarParticipante}
                                actualizarVidaPersonaje={actualizarVidaPersonaje}
                            />
                        );
                    })}
                </div>
            )}
        </>
    )
}
