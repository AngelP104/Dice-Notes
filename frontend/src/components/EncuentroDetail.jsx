import { useEffect, useState } from "react";
import { usePerfil } from "../context/PerfilContext";
import { LoadingComponent } from "../components/LoadingComponent";
import Swal from "sweetalert2";
import { EncuentroParticipantesList } from "./EncuentroParticipantesList";
import { NotaList } from "./NotaList";
import { useModeloWebSocket } from "../hooks/useModeloWebSocket";
import { redirect } from "react-router-dom";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Detalle del encuentro
export const EncuentroDetail = ({ encuentroId, campanaId, dungeonMaster, cerrarDetalle, party }) => {
    const { perfil, user } = usePerfil();
    const [encuentro, setEncuentro] = useState(null);
    const [participantes, setParticipantes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [turno, setTurno] = useState(0);

    // Detectar si el jugador está en la party
    const jugadorEstaEnCampana = party.some((entry) => entry.perfil.user === perfil.id) || dungeonMaster.user === perfil.id;

    const fetchEncuentro = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/campanas/${campanaId}/encuentros/${encuentroId}/`, {
                headers: {
                    Authorization: `Bearer ${user.accessToken}`,
                },
            });
            if (!response.ok) throw new Error("Error al obtener el encuentro");
            const data = await response.json();
            console.log(data)
            setEncuentro(data);
            setParticipantes(data.participantes);

            // Se busca el índice del participante con el turno actual
            // La utilidad de esto es para volver al encuentro empezado por donde se dejó
            const idParticipanteTurno = data.participantes.findIndex(p => p.turno == true);
            if (idParticipanteTurno !== false) {
                setTurno(idParticipanteTurno)
            } else {
                setTurno(0);
            }
        } catch (error) {
            cerrarDetalle(null)
            console.log("Error al obtener el encuentro" + error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEncuentro();
    }, [encuentroId]);

    // Manejo de los botones de estado
    const marcarComoEnCurso = async () => {
        Swal.fire({
            title: '¿Comenzar encuentro?',
            text: "Esta acción marcará el encuentro como en curso.",
            icon: 'warning',

            theme: 'dark',
            showCancelButton: true,
            confirmButtonColor: '#22c55e',
            cancelButtonColor: '#555',
            confirmButtonText: 'Sí, reproducir encuentro',
            cancelButtonText: 'Cancelar'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const response = await fetch(`${API_BASE_URL}/api/campanas/${campanaId}/encuentros/${encuentroId}/comenzar/`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${user.accessToken}`,
                        },
                    })
                    if (!response.ok) throw new Error("No se pudo empezar el encuentro")
                    const data = await response.json()
                    setEncuentro(data)
                    fetchEncuentro()

                    Swal.fire({
                        title: 'Encuentro iniciado',
                        text: "La encuentro ha comenzado.",
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

    const marcarComoFinalizado = async () => {
        Swal.fire({
            title: '¿Finalizar encuentro?',
            text: "Esta acción marcará el encuentro como finalizado.",
            icon: 'warning',
            theme: 'dark',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#555',
            confirmButtonText: 'Sí, finalizar encuentro',
            cancelButtonText: 'Cancelar'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const response = await fetch(`${API_BASE_URL}/api/campanas/${campanaId}/encuentros/${encuentroId}/finalizar/`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${user.accessToken}`,
                        },
                    })
                    if (!response.ok) throw new Error("No se pudo terminar el encuentro")
                    const data = await response.json()
                    setEncuentro(data)
                    fetchEncuentro()
                    Swal.fire({
                        title: 'Encuentro finalizado',
                        text: "La encuentro ha sido marcado como finalizado.",
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
    const marcarComoProgramado = async () => {
        Swal.fire({
            title: '¿Programar encuentro?',
            text: "Esta acción marcará el encuentro como programado.",
            icon: 'warning',
            theme: 'dark',
            showCancelButton: true,
            confirmButtonColor: '#f97316',
            cancelButtonColor: '#555',
            confirmButtonText: 'Sí, marcar como programado',
            cancelButtonText: 'Cancelar'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const response = await fetch(`${API_BASE_URL}/api/campanas/${campanaId}/encuentros/${encuentroId}/programar/`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${user.accessToken}`,
                        },
                    })
                    if (!response.ok) throw new Error("No se pudo marcar el encuentro como programado")
                    const data = await response.json()
                    setEncuentro(data)
                    fetchEncuentro()
                } catch (error) {
                    console.error(error.message)
                }
            }
        });
    }

    const eliminarEncuentro = async () => {
        Swal.fire({
            title: '¿Eliminar encuentro?',
            text: "Esta acción eliminará el encuentro permanentemente.",
            icon: 'warning',
            theme: 'dark',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#555',
            confirmButtonText: 'Sí, eliminar encuentro',
            cancelButtonText: 'Cancelar'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    if (cerrarDetalle) cerrarDetalle();

                    const response = await fetch(`${API_BASE_URL}/api/campanas/${campanaId}/encuentros/${encuentroId}/`, {
                        method: "DELETE",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${user.accessToken}`,
                        },
                    })
                    if (!response.ok) throw new Error("No se pudo eliminar el encuentro")
                    const data = await response.json()
                    Swal.fire({
                        title: 'Encuentro eliminado',
                        text: "El encuentro ha sido eliminado.",
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

    //* Actualizar el turno
    //? numTurno>participantes.length = 0
    //? numTurno<0 = participantes.length - 1

    const handleActualizarTurno = (numTurno) => async () => {
        const nuevoTurno = (turno + numTurno) % participantes.length;
        if (nuevoTurno < 0) {
            setTurno(participantes.length - 1);
            cambiarTurno(participantes.length - 1);
        } else {
            setTurno(nuevoTurno);
            cambiarTurno(nuevoTurno);
        }
    }

    const cambiarTurno = async (numTurno) => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/campanas/${campanaId}/encuentros/${encuentroId}/turno/${numTurno}/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${user.accessToken}`,
                },
            })
            if (!response.ok) throw new Error("No se pudo pasar el turno")
            const data = await response.json()
            //setEncuentro(data)
            //fetchEncuentro()
        } catch (error) {
            console.error(error.message)
        }
    }

    const renderBotonesSegunEstado = () => {
        if (perfil.id !== dungeonMaster.user) return null;

        switch (encuentro.estado) {
            case "en_curso":
                return (
                    <>
                        <button onClick={marcarComoFinalizado} className="bg-red-500 hover:bg-red-600 transition cursor-pointer rounded-lg p-2">
                            <i className="fas fa-stop mr-1"></i> Finalizar encuentro
                        </button>
                        <div className="flex justify-between items-center gap-2 z-10 fixed bottom-6 left-0 right-2 w-fit max-w-600 m-auto "
                        >
                            <button onClick={handleActualizarTurno(-1)} className="bg-indigo-500 border-2 hover:border-yellow-400 hover:ring-2 hover:ring-yellow-300 hover:bg-indigo-600 transition cursor-pointer rounded-lg py-2 px-4 w-full hover:text-yellow-300">
                                <i className="fas fa-arrow-left px-8 text-xl"></i>
                            </button>

                            <button onClick={handleActualizarTurno(1)} className="bg-indigo-500 border-2 hover:border-yellow-400 hover:ring-2 hover:ring-yellow-300 hover:bg-indigo-600 transition cursor-pointer rounded-lg py-2 px-4 w-full hover:text-yellow-300">
                                <i className="fas fa-arrow-right px-8 text-xl"></i>
                            </button>
                        </div>
                    </>
                );
            case "programado":
                return (
                    <>
                        <button onClick={marcarComoEnCurso} className="bg-green-500 hover:bg-green-600 transition cursor-pointer rounded-lg p-2">
                            <i className="fas fa-play mr-1"></i> Reproducir encuentro
                        </button>
                        <button onClick={marcarComoFinalizado} className="bg-gray-500 hover:bg-gray-600 transition cursor-pointer rounded-lg p-2">
                            <i className="fas fa-check mr-1"></i> Marcar como finalizado
                        </button>

                        <button className="bg-red-600 hover:bg-red-700 transition cursor-pointer rounded-lg p-2"
                            onClick={eliminarEncuentro}
                        >
                            <i className="fas fa-trash mr-1"></i> Eliminar
                        </button>
                    </>
                );
            case "finalizado":
                return (
                    <>

                        <button onClick={marcarComoProgramado} className="bg-orange-500 hover:bg-orange-600 transition cursor-pointer rounded-lg p-2">
                            <i className="fas fa-redo mr-1"></i> Marcar como programado
                        </button>
                        <button className="bg-red-600 hover:bg-red-700 transition cursor-pointer rounded-lg p-2"
                            onClick={eliminarEncuentro}
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
        modelo: "encuentro",
        objectId: encuentroId,
        onMensaje: (encuentroUpdate) => {
            if (participantes.length === 0) fetchEncuentro(); // Evitar actualizaciones si no hay participantes
            setEncuentro(encuentroUpdate);
            setParticipantes(encuentroUpdate.participantes || participantes);
        }
    });

    // Actualizar dato estado participante
    const actualizarParticipante = async (participanteId, datosActualizados) => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/campanas/${campanaId}/encuentros/${encuentroId}/participantes/${participanteId}/`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${user.accessToken}`,
                },
                body: JSON.stringify(datosActualizados)
            });

            if (!response.ok) throw new Error("Error al actualizar el participante");

            const data = await response.json();
            setParticipantes((prev) =>
                prev.map((p) => (p.id === participanteId ? data : p))
            );
        } catch (error) {
            console.error("Error al actualizar el participante:", error);
        }
    };

    const actualizarVidaPersonaje = async (personajeId, vitalidad_actual) => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/personajes/${personajeId}/`, {
                method: "PATCH",
                headers: {
                    Authorization: `Bearer ${user.accessToken}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ vitalidad_actual })
            });

            if (!response.ok) throw new Error("Error al actualizar la vida del personaje");

        } catch (error) {
            console.error("Error al actualizar la vida del personaje:", error);
        }
    };

    if (loading) return <LoadingComponent />;
    if (!encuentro) return <p className="text-red-500">Error al cargar el encuentro.</p>;


    return (
        <>
            {!loading ? (
                (encuentro.estado === "programado" && perfil.id !== dungeonMaster.user) ? (
                    <p className="text-center text-red-400">El Dungeon Master esta programando este encuentro.</p>
                ) : (
                    <>
                        <h1 className="font-semibold text-xl">Detalles del encuentro</h1>
                        <div className="py-1 space-y-6">
                            <div className="sm:flex justify-between items-center bg-gray-800/30 p-3 rounded-xl shadow-md border border-gray-600">
                                <h2 className="text-3xl font-bold font-serif">{encuentro.nombre}</h2>
                                <p className="m-1">
                                    {encuentro.estado === "en_curso" ? (
                                        <span className="bg-green-500 ring-3 ring-green-300/40 w-fit text-sm md:text-lg rounded-full px-4 py-1 my-2 text-center select-none">
                                            En curso
                                        </span>
                                    ) : encuentro.estado === "programado" ? (
                                        <span className="bg-orange-500 w-fit text-sm md:text-lg rounded-full px-4 py-1 my-2 text-center select-none">
                                            Programada
                                        </span>
                                    ) : encuentro.estado === "finalizado" ? (
                                        <span className="bg-gray-500 w-fit text-sm md:text-lg rounded-full px-4 py-1 my-2 text-center select-none">
                                            Finalizado
                                        </span>
                                    ) : null}
                                </p>
                            </div>

                            {/* Botones de acción */}
                            <div className="flex flex-col grid-cols-2 sm:flex-row gap-2">
                                {renderBotonesSegunEstado()}
                            </div>

                            <div className="p-1 rounded-xl">
                                <h3 className="text-2xl font-semibold mb-4">
                                    <i className="fa-solid fa-users mr-2"></i>Participantes
                                </h3>

                                {/* Lista de participantes */}
                                {participantes && (
                                    <EncuentroParticipantesList
                                        campanaId={campanaId}
                                        encuentroId={encuentroId}
                                        listaParticipantes={participantes}
                                        dungeonMaster={dungeonMaster}
                                        actualizarParticipante={actualizarParticipante}
                                        actualizarVidaPersonaje={actualizarVidaPersonaje}
                                        encuentro={encuentro} />
                                )}

                            </div>
                            {jugadorEstaEnCampana && (
                                <div>
                                    <h2 className="text-lg font-semibold underline">Notas del encuentro</h2>
                                    <NotaList
                                        model="encuentro"
                                        objectId={encuentroId} />
                                </div>
                            )}
                        </div>
                    </>
                )
            ) : null}
        </>
    );
};
