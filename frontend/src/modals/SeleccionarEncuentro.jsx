import { useEffect, useState } from "react";
import { usePerfil } from "../context/PerfilContext";
import { LoadingComponent } from "../components/LoadingComponent";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Al pulsar en el botón de reproducir encuentro se muestra un modal con los encuentros programados de esa campaña
export const SeleccionarEncuentro = ({ campanaId, onSeleccionar, onCerrar, encuentroId }) => {
    const [encuentros, setEncuentros] = useState([]);
    const { perfil, user } = usePerfil();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchEncuentros() {
            try {
                const response = await fetch(`${API_BASE_URL}/api/campanas/${campanaId}/encuentros/`, {
                    headers: {
                        Authorization: `Bearer ${user.accessToken}`,
                    },
                });
                if (!response.ok) throw new Error("Error al obtener encuentros");
                const data = await response.json();
                const encuentrosFiltrados = data.filter(encuentro => encuentro.estado === "programado");
                setEncuentros(encuentrosFiltrados);
                setLoading(false);
            } catch (error) {
                setEncuentros([]);
            }
        }
        fetchEncuentros();
    }, [campanaId]);

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
            onClick={onCerrar}
        >
            <div
                className="bg-gray-800 rounded-xl shadow-lg w-full max-w-md p-6"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Selecciona un Encuentro</h2>
                    <button
                        onClick={onCerrar}
                        className="text-gray-500 hover:text-gray-300"
                    >
                        <i className="fa-solid fa-xmark"></i>
                    </button>
                </div>

                <div className="space-y-3 max-h-96 overflow-y-auto">
                    {loading ? (
                        <div className="flex justify-center items-center py-10">
                            <LoadingComponent />
                        </div>
                    ) : encuentros.length === 0 ? (
                        <p className="text-gray-500 text-sm">No hay encuentros programados.</p>
                    ) : (
                        encuentros.map((encuentro) => (
                            <div
                                key={encuentro.id}
                                className="flex justify-between items-center bg-gray-500/50 border-2 border-gray-500 hover:border-red-600/40 hover:bg-red-600/30 p-4 rounded-lg transition duration-200"
                                onClick={() => onSeleccionar(encuentro.id)}
                            >
                                <div className="flex items-center select-none">
                                    <i className="fa-sharp fa-swords text-gray-200 mr-2"></i>
                                    <p className="text-lg font-bold text-white font-serif">{encuentro.nombre}</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>

            </div>
        </div>
    );
}
