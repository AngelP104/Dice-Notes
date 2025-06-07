import React, { useEffect, useState } from "react";
import { SeleccionarEncuentro } from "../modals/SeleccionarEncuentro";
import { usePerfil } from "../context/PerfilContext";
import { useModeloWebSocket } from "../hooks/useModeloWebSocket";
import { EncuentroDetail } from "./EncuentroDetail";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Panel de encuentros dentro de sesión de campaña
export const EncuentroPanel = ({ dungeonMaster, campanaId, encuentroId, party }) => {
    const [encuentrosActivos, setEncuentrosActivos] = useState([]);
    const [mostrarModal, setMostrarModal] = useState(false);
    const [encuentroPendiente, setEncuentroPendiente] = useState(null);
    const { user, perfil } = usePerfil();

    // Obtener encuentros activos
    const fetchEncuentrosActivos = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/campanas/${campanaId}/encuentros/activos/`, {
                headers: {
                    Authorization: `Bearer ${user.accessToken}`,
                },
            });

            if (res.status === 204) {
                setEncuentrosActivos(null); // No hay activo
                return;
            }

            if (!res.ok) throw new Error("Error al obtener el encuentro activo");

            const data = await res.json();
            setEncuentrosActivos(data);
            console.log("Encuentros activos:", data);
        } catch (err) {
            console.error("Error al cargar encuentro activo:", err);
            setEncuentrosActivos([]); // Manejo de error, podrías mostrar un mensaje al usuario
        }
    };

    useEffect(() => {
        fetchEncuentrosActivos();
    }, [campanaId, user?.accessToken]);


    // Cuando el usuario selecciona un encuentro
    const handleSeleccionarEncuentro = async (encuentroId) => {
        console.log("campanaId:", campanaId);
        console.log("encuentroId:", encuentroId);
        try {
            const response = await fetch(`${API_BASE_URL}/api/campanas/${campanaId}/encuentros/${encuentroId}/comenzar/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${user.accessToken}`,
                },
            });
            if (!response.ok) throw new Error("Error al iniciar encuentro");
            const data = await response.json();
            setEncuentrosActivos(data);
            fetchEncuentrosActivos(); // Refrescar la lista de encuentros activos
            console.log("Encuentro iniciado:", data);
            setMostrarModal(false);
        } catch (err) {
            console.error("No se pudo iniciar el encuentro:", err);
        }
    };

    // Websockets para cambiar los encuentros
    useModeloWebSocket({
        modelo: "encuentro",
        objectId: encuentroId,
        onMensaje: (mensaje) => {
                fetchEncuentrosActivos();
            
        },
    });


    return (
        <div className="p-1 space-y-4 bg-gray-800/50 rounded-lg shadow-md">
            {perfil.id === dungeonMaster.user && (
                <button
                    onClick={() => setMostrarModal(true)}
                    className="bg-red-700 text-white px-4 py-2 rounded-lg hover:bg-red-800 transition border-2 border-white hover:ring cursor-pointer"
                >
                    <i className="fa-sharp fa-swords mr-2"></i>
                    Reproducir encuentro
                </button>
            )}

            {encuentrosActivos.length > 0 ? (
                <div className="space-y-4">
                    {encuentrosActivos.map((encuentro) => (
                        <EncuentroDetail
                        party={party}
                            key={encuentro.id}
                            encuentroId={encuentro.id}
                            campanaId={campanaId}
                            dungeonMaster={dungeonMaster}
                        />
                    ))}
                </div>
            ) : (
                <p className="text-gray-300">No hay encuentros activos en esta campaña.</p>
            )}

            {mostrarModal && (
                <SeleccionarEncuentro
                    campanaId={campanaId}
                    onSeleccionar={handleSeleccionarEncuentro}
                    encuentroId
                    onCerrar={() => setMostrarModal(false)}
                />
            )}
        </div>
    );
};
