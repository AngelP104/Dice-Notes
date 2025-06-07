import { useState, useEffect } from "react";
import { usePerfil } from "../context/PerfilContext";
import { LoadingComponent } from "../components/LoadingComponent";
import '@fortawesome/fontawesome-free/css/all.min.css';
import { EncuentroDetail } from "./EncuentroDetail";
import { ScrollToTop } from "./ScrollToTop";
import { useModeloWebSocket } from "../hooks/useModeloWebSocket";
import { Link } from "react-router-dom";
import { Navigate } from "react-router-dom";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Lista de encuentros dentro de campaña
export const EncuentroList = ({ campanaId, dungeonMaster, party }) => {
    const [encuentros, setEncuentros] = useState([]);
    const { user, perfil } = usePerfil();
    const [loading, setLoading] = useState(true);
    const [encuentroActual, setEncuentroActual] = useState(null);

    useEffect(() => {
        const fetchEncuentros = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/api/campanas/${campanaId}/encuentros/`, {
                    headers: {
                        Authorization: `Bearer ${user.accessToken}`,
                    },
                });
                if (!response.ok) throw new Error("No se pudieron cargar los encuentros");
                const data = await response.json();
                setEncuentros(data);
            } catch (error) {
                console.error(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchEncuentros();
    }, [campanaId, encuentroActual]);

    const encuentrosEnCurso = encuentros.filter(e => e.estado === "en_curso");
    const encuentrosProgramados = encuentros.filter(e => e.estado === "programado");
    const encuentrosFinalizados = encuentros.filter(e => e.estado === "finalizado");

    const handleEncuentroClick = (encuentroId) => {
        setEncuentroActual(encuentroId);
        window.scrollTo({ top: 0, behavior: 'instant' });
    };



    // WebSocket para recibir actualizaciones en tiempo real
    useModeloWebSocket({
        modelo: "encuentro",
        onMensaje: (encuentroActualizado) => {
            setEncuentros(prev =>
                prev.some(e => e.id === encuentroActualizado.id)
                    ? prev.map(e => e.id === encuentroActualizado.id ? encuentroActualizado : e)
                    : [...prev, encuentroActualizado] // se agrega nueva si no estaba
            );
        }
    });

    if (loading) return <LoadingComponent />;

    return (
        <>
            {encuentroActual ? (
                <>
                    <p className="hover:underline cursor-pointer text-lg w-fit mb-2" onClick={() => setEncuentroActual(null)}>
                        <i className="fa-solid fa-arrow-left" ></i>{" "}Volver a la lista de encuentros
                    </p>
                    <EncuentroDetail party={party} encuentroId={encuentroActual} campanaId={campanaId} dungeonMaster={dungeonMaster} cerrarDetalle={() => setEncuentroActual(null)} />
                </>
            ) : (
                <>
                    {!loading && (
                        <div>
                            <div className="flex justify-between items-center mb-4">
                                <p className="text-2xl font-semibold underline">Encuentros</p>
                                {perfil.id === dungeonMaster.user && (
                                    <Link to={`/campanas/${campanaId}/encuentros/crear/`}
                                        className="bg-red-500 border-2 border-white hover:ring hover:bg-red-700 text-lg rounded-lg px-3 p-2 mr-3 font-semibold text-white cursor-pointer transition"

                                    >
                                        <i className="fa-solid fa-plus"></i>{" "}Crear encuentro
                                    </Link>
                                )}
                            </div>

                            {/* Encuentro en curso */}
                            {encuentrosEnCurso.length > 0 && (
                                <>
                                    <div className="grid grid-cols-1 gap-4">
                                        <div>
                                            <p className="text-2xl font-semibold">
                                                <i className="fa-solid fa-circle animate-pulse text-2xl text-red-500"></i>{" "}EN CURSO
                                            </p>
                                        </div>
                                        {encuentrosEnCurso.map((encuentro) => (
                                            <div
                                                key={encuentro.id}
                                                className="flex flex-col md:flex-row justify-between items-start md:items-center bg-red-600/40 hover:bg-red-500/50 border-red-400 border-2 p-4 rounded-lg transition duration-200 space-y-4 md:space-y-0 md:space-x-6 mb-4 cursor-pointer"
                                                onClick={() => handleEncuentroClick(encuentro.id)}
                                            >
                                                <div className="flex flex-col md:flex-row md:items-center md:space-x-6 w-full">
                                                    <div className="flex-1">
                                                        <h3 className="text-2xl md:text-3xl font-semibold font-serif">{encuentro.nombre}</h3>

                                                    </div>

                                                </div>
                                                <div className="flex justify-between items-center w-full md:w-45 md:justify-end md:space-x-4">
                                                    <div className="bg-green-500 text-sm md:text-lg rounded-full px-4 py-1 text-center select-none">
                                                        En curso
                                                    </div>
                                                    <div className="text-3xl md:text-4xl text-white">
                                                        <i className="fa-solid fa-chevron-right"></i>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}

                            {/* Encuentros programados */}
                            {perfil.id === dungeonMaster.user && (
                                <>
                                    <p className="text-2xl font-semibold">Programados (sólo DM)</p>
                                    {encuentrosProgramados.length > 0 ? (
                                        encuentrosProgramados.map((encuentro) => (
                                            <div
                                                key={encuentro.id}
                                                className="flex flex-col md:flex-row justify-between items-start md:items-center bg-[#833961] hover:bg-[#92416e] border-white border-2 p-4 rounded-lg transition duration-200 space-y-4 md:space-y-0 md:space-x-6 mb-4 cursor-pointer"
                                                onClick={() => handleEncuentroClick(encuentro.id)}
                                            >
                                                <div className="flex flex-col md:flex-row md:items-center md:space-x-6 w-full">
                                                    <div className="flex-1">
                                                        <h3 className="text-2xl md:text-3xl font-semibold font-serif">{encuentro.nombre}</h3>
                                                    </div>

                                                </div>
                                                <div className="flex justify-between items-center w-full md:w-auto md:justify-end md:space-x-4">
                                                    <div className="bg-orange-500 text-sm md:text-lg rounded-full px-4 py-1 text-center select-none">
                                                        Programado
                                                    </div>
                                                    <div className="text-3xl md:text-4xl text-white">
                                                        <i className="fa-solid fa-chevron-right"></i>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-gray-400 mt-1">No hay encuentros programados.</p>
                                    )}
                                </>
                            )}

                            {/* Encuentros pasados */}
                            <p className="text-2xl font-semibold mt-4">Anteriores</p>
                            {encuentrosFinalizados.length > 0 ? (
                                encuentrosFinalizados.map((encuentro) => (
                                    <div
                                        key={encuentro.id}
                                        className="flex flex-col md:flex-row justify-between items-start md:items-center bg-gray-700/70 hover:bg-gray-600/70 border-gray-400 border-2 p-4 rounded-lg transition duration-200 space-y-4 md:space-y-0 md:space-x-6 mb-4 cursor-pointer"
                                        onClick={() => handleEncuentroClick(encuentro.id)}
                                    >
                                        <div className="flex flex-col md:flex-row md:items-center md:space-x-6 w-full">
                                            <div className="flex-1">
                                                <h3 className="text-2xl md:text-3xl font-semibold font-serif">{encuentro.nombre}</h3>
                                            </div>

                                        </div>
                                        <div className="flex justify-between items-center w-full md:w-auto md:justify-end md:space-x-4">
                                            <div className="bg-gray-500 text-sm md:text-lg rounded-full px-4 py-1 text-center select-none">
                                                Finalizado
                                            </div>
                                            <div className="text-3xl md:text-4xl text-white">
                                                <i className="fa-solid fa-chevron-right"></i>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-400 mt-1">No hay encuentros finalizados.</p>
                            )}
                        </div>
                    )}
                </>
            )}
        </>
    );
};
