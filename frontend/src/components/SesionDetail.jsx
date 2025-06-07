import { useState, useEffect } from "react"
import { usePerfil } from "../context/PerfilContext"
import { LoadingComponent } from "../components/LoadingComponent"
import '@fortawesome/fontawesome-free/css/all.min.css'
import { useParams } from "react-router-dom"
import { Link } from "react-router-dom"
import { NotaList } from "../components/NotaList"
import { EncuentroPanel } from "./EncuentroPanel"
import Swal from "sweetalert2"
import { SesionCreateEdit } from "../modals/SesionCreateEdit"
import { useModeloWebSocket } from "../hooks/useModeloWebSocket";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;


export const SesionDetail = ({ sesionId, campanaId, dungeonMaster, party, cerrarDetalle }) => {
    const [sesion, setSesion] = useState(null);
    const { user, perfil } = usePerfil();
    const [loading, setLoading] = useState(true);
    const [mostrarModalEditarSesion, setMostrarModalEditarSesion] = useState(false);

    // Detectar si el jugador está en la party
    const jugadorEstaEnCampana = party.some((entry) => entry.perfil.user === perfil.id) || dungeonMaster.user === perfil.id;

    const fetchSesion = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/campanas/${campanaId}/sesiones/${sesionId}/`, {
                headers: {
                    Authorization: `Bearer ${user.accessToken}`,
                },
            })
            if (!response.ok) throw new Error("No se pudo cargar la sesión")
            const data = await response.json()
            setSesion(data)
        } catch (error) {
            cerrarDetalle(null)
            console.error(error.message)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchSesion()
    }
        , [sesionId])

    // Manejo de los botones de estado
    const marcarComoEnCurso = async () => {
        Swal.fire({
            title: '¿Comenzar sesión?',
            text: "Esta acción marcará la sesión como en curso.",
            icon: 'warning',

            theme: 'dark',
            showCancelButton: true,
            confirmButtonColor: '#22c55e',
            cancelButtonColor: '#555',
            confirmButtonText: 'Sí, empezar sesión',
            cancelButtonText: 'Cancelar'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const response = await fetch(`${API_BASE_URL}/api/campanas/${campanaId}/sesiones/${sesionId}/comenzar/`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${user.accessToken}`,
                        },
                    })
                    if (!response.ok) throw new Error("No se pudo empezar la sesión")
                    const data = await response.json()
                    setSesion(data)
                    fetchSesion()

                    Swal.fire({
                        title: 'Sesión iniciada',
                        text: "La sesión ha comenzado.",
                        showConfirmButton: false,
                        icon: 'success',
                        theme: 'dark',
                        timer: 2000,
                        timerProgressBar: true,
                    })
                } catch (error) {
                    console.error(error.message)
                }
            }
        });
    }

    const marcarComoFinalizada = async () => {
        Swal.fire({
            title: '¿Finalizar sesión?',
            text: "Esta acción marcará la sesión como finalizada.",
            icon: 'warning',
            theme: 'dark',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#555',
            confirmButtonText: 'Sí, finalizar sesión',
            cancelButtonText: 'Cancelar'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const response = await fetch(`${API_BASE_URL}/api/campanas/${campanaId}/sesiones/${sesionId}/finalizar/`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${user.accessToken}`,
                        },
                    })
                    if (!response.ok) throw new Error("No se pudo terminar la sesión")
                    const data = await response.json()
                    setSesion(data)
                    fetchSesion()
                    Swal.fire({
                        title: 'Sesión finalizada',
                        text: "La sesión ha sido marcada como finalizada.",
                        showConfirmButton: false,
                        icon: 'success',
                        theme: 'dark',
                        timer: 2000,
                        timerProgressBar: true,
                    })
                } catch (error) {
                    console.error(error.message)
                }
            }
        });
    }
    const marcarComoProgramada = async () => {
        Swal.fire({
            title: '¿Programar sesión?',
            text: "Esta acción marcará la sesión como programada.",
            icon: 'warning',
            theme: 'dark',
            showCancelButton: true,
            confirmButtonColor: '#f97316',
            cancelButtonColor: '#555',
            confirmButtonText: 'Sí, marcar como programada',
            cancelButtonText: 'Cancelar'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const response = await fetch(`${API_BASE_URL}/api/campanas/${campanaId}/sesiones/${sesionId}/programar/`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${user.accessToken}`,
                        },
                    })
                    if (!response.ok) throw new Error("No se pudo marcar la sesión como programada")
                    const data = await response.json()
                    setSesion(data)
                    fetchSesion()
                } catch (error) {
                    console.error(error.message)
                }
            }
        });
    }

    const eliminarSesion = async () => {
        Swal.fire({
            title: '¿Eliminar sesión?',
            text: "Esta acción eliminará la sesión permanentemente.",
            icon: 'warning',
            theme: 'dark',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#555',
            confirmButtonText: 'Sí, eliminar sesión',
            cancelButtonText: 'Cancelar'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    if (cerrarDetalle) cerrarDetalle();
                    const response = await fetch(`${API_BASE_URL}/api/campanas/${campanaId}/sesiones/${sesionId}/`, {
                        method: "DELETE",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${user.accessToken}`,
                        },
                    })
                    if (!response.ok) throw new Error("No se pudo eliminar la sesión")
                    const data = await response.json()

                    Swal.fire({
                        title: 'Sesión eliminada',
                        text: "La sesión ha sido eliminada.",
                        showConfirmButton: false,
                        icon: 'success',
                        theme: 'dark',
                        timer: 2000,
                        timerProgressBar: true,
                    })
                } catch (error) {
                    console.error(error.message)
                }
            }
        });
    }


    const renderBotonesSegunEstado = () => {
        if (perfil.id !== dungeonMaster.user) return null;

        switch (sesion.estado) {
            case "en_curso":
                return (
                    <>
                        <button onClick={marcarComoFinalizada} className="bg-red-500 hover:bg-red-600 transition cursor-pointer rounded-lg p-2">
                            <i className="fas fa-stop mr-1"></i> Terminar sesión
                        </button>
                    </>
                );
            case "programada":
                return (
                    <>
                        <button onClick={marcarComoEnCurso} className="bg-green-500 hover:bg-green-600 transition cursor-pointer rounded-lg p-2">
                            <i className="fas fa-play mr-1"></i> Empezar sesión
                        </button>
                        <button onClick={marcarComoFinalizada} className="bg-gray-500 hover:bg-gray-600 transition cursor-pointer rounded-lg p-2">
                            <i className="fas fa-check mr-1"></i> Marcar como finalizada
                        </button>
                        <button className="bg-blue-500 hover:bg-blue-600 transition cursor-pointer rounded-lg p-2"
                            onClick={() => setMostrarModalEditarSesion(true)}
                        >
                            <i className="fas fa-edit mr-1"></i> Editar
                        </button>
                        <button className="bg-red-600 hover:bg-red-700 transition cursor-pointer rounded-lg p-2"
                            onClick={eliminarSesion}
                        >
                            <i className="fas fa-trash mr-1"></i> Eliminar
                        </button>
                    </>
                );
            case "finalizada":
                return (
                    <>
                        <button onClick={marcarComoEnCurso} className="bg-green-500 hover:bg-green-600 transition cursor-pointer rounded-lg p-2">
                            <i className="fas fa-play mr-1"></i> Reabrir sesión
                        </button>
                        <button onClick={marcarComoProgramada} className="bg-orange-500 hover:bg-orange-600 transition cursor-pointer rounded-lg p-2">
                            <i className="fas fa-redo mr-1"></i> Marcar como programada
                        </button>
                        <button className="bg-red-600 hover:bg-red-700 transition cursor-pointer rounded-lg p-2"
                            onClick={eliminarSesion}
                        >
                            <i className="fas fa-trash mr-1"></i> Eliminar
                        </button>
                    </>
                );
            default:
                return null;
        }
    };

    // WebSocket para recibir actualizaciones en tiempo real
    useModeloWebSocket({
        modelo: "sesion",
        objectId: sesionId,
        onMensaje: (mensaje) => {
            if (!mensaje) return;
            if 
                (mensaje.action === "delete" && mensaje.data && mensaje.data.id === sesionId)
             {
                if (cerrarDetalle) cerrarDetalle();
                setSesion(null);
                return;
            }
            // Si viene con data, es un mensaje de actualización
            if (mensaje.data) {
                setSesion(mensaje.data);
            } else {
                setSesion(mensaje);
            }
        }
    });


    if (loading) return <LoadingComponent />
    if (!perfil) return;
    if (!sesion) return null;

    return (
        <>
            {mostrarModalEditarSesion && (
                <SesionCreateEdit
                    sesionId={sesionId}
                    campanaId={campanaId}
                    onClose={() => setMostrarModalEditarSesion(false)}
                    onSubmitted={() => {
                        fetchSesion()
                        setMostrarModalEditarSesion(false)
                    }}
                    modo="edit"
                />
            )}
            {!loading ? (
                (sesion.estado === "programada" && perfil.id !== dungeonMaster.user) ? (
                    <p className="text-center text-red-400">El Dungeon Master esta programando esta sesión.</p>
                ) : (
                    <div>
                        <p className="text-xl font-semibold">Detalles de la sesión</p>
                        <div className="sm:flex justify-between items-center mb-4">
                            <p className="text-4xl font-semibold text-white font-serif truncate">{sesion.nombre}</p>
                            {sesion.estado === "en_curso" ? (
                                <div className="bg-green-500 ring-3 ring-green-300/40 w-fit text-sm md:text-lg rounded-full px-4 py-1 my-2 text-center select-none">
                                    En curso
                                </div>
                            ) : sesion.estado === "programada" ? (
                                <div className="bg-orange-500 w-fit text-sm md:text-lg rounded-full px-4 py-1 my-2 text-center select-none">
                                    Programada
                                </div>
                            ) : sesion.estado === "finalizada" ? (
                                <div className="bg-gray-500 w-fit text-sm md:text-lg rounded-full px-4 py-1 my-2 text-center select-none">
                                    Finalizada
                                </div>
                            ) : null}
                        </div>


                        <div className="flex flex-col grid-cols-2 sm:flex-row gap-2">
                            {renderBotonesSegunEstado()}
                        </div>

                        <div className="grid grid-cols-1 my-4 gap-4 w-fit">
                            <div className="bg-gray-800 p-4 rounded-lg shadow-md">
                                <div className="flex text-sm text-gray-200 md:mt-0 gap-4">
                                    <p>
                                        <i className="fa-solid fa-calendar-days mr-1"></i>
                                        {new Date(sesion.fecha_inicio).toLocaleDateString()}
                                    </p>
                                    <p>
                                        <i className="fa-solid fa-clock mr-1 text-xs"></i>
                                        {new Date(sesion.fecha_inicio).toLocaleTimeString()}
                                    </p>
                                    <p>
                                        <i className="fa-solid fa-location-dot mr-1"></i>
                                        {sesion.ubicacion}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Encuentros */}
                        <div>
                            <EncuentroPanel campanaId={campanaId} dungeonMaster={dungeonMaster} party={party} />
                        </div>

                        {/* Notas */}
                        {jugadorEstaEnCampana && (
                            <div>
                                <h2 className="text-lg font-semibold underline my-3">Notas de la sesión</h2>
                                <NotaList model="sesion" objectId={sesionId} />
                            </div>
                        )}

                    </div>
                )
            ) : null}
        </>
    )
}
