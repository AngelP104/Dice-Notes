import { useState, useEffect } from "react";
import { usePerfil } from "../context/PerfilContext";
import { LoadingComponent } from "../components/LoadingComponent";
import '@fortawesome/fontawesome-free/css/all.min.css';
import { SesionDetail } from "./SesionDetail";
import { ScrollToTop } from "./ScrollToTop";
import { SesionCardEnCurso } from "../components/SesionCardEnCurso";
import { SesionCardProgramada } from "../components/SesionCardProgramada";
import { SesionCardFinalizada } from "../components/SesionCardFinalizada";
import { SesionCreateEdit } from "../modals/SesionCreateEdit";
import { useModeloWebSocket } from "../hooks/useModeloWebSocket";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;



export const SesionList = ({ campanaId, dungeonMaster, party }) => {

    const [sesiones, setSesiones] = useState([]);
    const { user, perfil } = usePerfil();
    const [loading, setLoading] = useState(true);
    const [sesionActual, setSesionActual] = useState(null);
    const [mostrarModalCrearSesion, setMostrarModalCrearSesion] = useState(false);

    const fetchSesiones = async () => {
        try {
                const token = await user.getIdToken();
            const response = await fetch(`${API_BASE_URL}/api/campanas/${campanaId}/sesiones/`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (!response.ok) throw new Error("No se pudieron cargar las sesiones");
            const data = await response.json();
            setSesiones(data);
        } catch (error) {
            console.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSesiones();
    }, [campanaId, sesionActual]);

    const sesionesEnCurso = sesiones.filter(s => s.estado === "en_curso");
    const sesionesProgramadas = sesiones.filter(s => s.estado === "programada");
    const sesionesFinalizadas = sesiones.filter(s => s.estado === "finalizada");

    const handleSesionClick = (sesionId) => {
        setSesionActual(sesionId);
        window.scrollTo({ top: 0, behavior: 'instant' });
    };

    const handleCrearSesion = () => {
        setMostrarModalCrearSesion(true);
    };

    // WebSocket para recibir actualizaciones en tiempo real
    useModeloWebSocket({
        modelo: "sesion",
        onMensaje: (mensaje) => {
            setSesiones(prev =>
                prev.some(s => s.id === mensaje.id)
                    ? prev.map(s => s.id === mensaje.id ? mensaje : s)
                    : [...prev, mensaje]
            );
        }
    });

const recargarListaSesiones = ()=> {
        setSesionActual(null)
        fetchSesiones()
    }


    if (loading) return <LoadingComponent />;

    return (
        <>
            {sesionActual ? (
                <>
                    <p className="hover:underline cursor-pointer text-lg w-fit mb-2" onClick={() => setSesionActual(null)}><i className="fa-solid fa-arrow-left" ></i>{" "}Volver a la lista de sesiones</p>
                    <SesionDetail sesionId={sesionActual} campanaId={campanaId} dungeonMaster={dungeonMaster} party={party} cerrarDetalle={() => recargarListaSesiones()} />
                </>
            ) : (

                <>
                    {!loading && (
                        <div className="">
                            <div className="flex justify-between items-center mb-4">
                                <p className="text-2xl font-semibold underline">Sesiones</p>
                                {perfil.id === dungeonMaster.user && (
                                    <button className="bg-emerald-600 hover:bg-emerald-700 text-lg rounded-lg px-3 p-2 mr-3 font-semibold text-text cursor-pointer transition border-2 border-white hover:ring"
                                        onClick={handleCrearSesion}

                                    >
                                        <i className="fa-solid fa-plus"></i>
                                        {" "}Nueva sesión</button>
                                )}
                            </div>

                            {/* Sesion en curso (se intentara que solo se pueda una) */}
                            {sesionesEnCurso.length > 0 && (
                                <>
                                    <div className="grid grid-cols-1 gap-4">
                                        <div>
                                            <p className="text-2xl font-semibold"><i className="fa-solid fa-circle animate-pulse text-2xl text-red-500"></i>{" "}EN CURSO</p>
                                        </div>
                                        {sesionesEnCurso.map((sesion) => (
                                            <SesionCardEnCurso key={sesion.id} sesion={sesion} onClick={handleSesionClick} />
                                        ))}
                                    </div>
                                </>
                            )}
                            {/* Sesiones programadas (solo lo puede ver el DM) */}
                            {perfil.id === dungeonMaster.user && (
                                <>
                                    <p className="text-2xl font-semibold">Programadas (sólo DM)</p>
                                    {sesionesProgramadas.length > 0 ? (
                                        sesionesProgramadas.map((sesion) => (

                                            <SesionCardProgramada key={sesion.id} sesion={sesion} onClick={handleSesionClick} />

                                        ))
                                    ) : (
                                        <p className="text-gray-400 mt-1">No hay sesiones programadas.</p>
                                    )}
                                </>
                            )}

                            {/* Sesiones pasadas */}
                            <p className="text-2xl font-semibold mt-4">Anteriores</p>
                            {sesionesFinalizadas.length > 0 ? (
                                sesionesFinalizadas.map((sesion) => (
                                    <SesionCardFinalizada key={sesion.id} sesion={sesion} onClick={handleSesionClick} />
                                ))
                            ) : (
                                <p className="text-gray-400 mt-1">No hay sesiones finalizadas.</p>
                            )}
                        </div>
                    )}
                    {mostrarModalCrearSesion && (
                        <SesionCreateEdit
                            sesionId={""}
                            campanaId={campanaId}
                            onClose={() => setMostrarModalCrearSesion(false)}
                            onSubmitted={() => {
                                fetchSesiones()
                                setMostrarModalCrearSesion(false)
                            }}
                            modo="create"
                        />
                    )}
                </>
            )}
        </>
    );
};
