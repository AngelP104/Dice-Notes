import { useEffect, useState, useRef } from 'react';
import { Nota } from './Nota';
import { usePerfil } from '../context/PerfilContext';
import { LoadingComponent } from './LoadingComponent';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const WS_BASE_URL = import.meta.env.VITE_WS_BASE_URL;


export const NotaList = ({ model, objectId, dungeonMaster = null }) => {
    const socketRef = useRef(null);
    const [notas, setNotas] = useState([]);
    const { user, perfil } = usePerfil();
    const [draggedIndex, setDraggedIndex] = useState(null);
    const [loading, setLoading] = useState(true);
    const [ultimaNotaCreada, setUltimaNotaCreada] = useState();

    // Handlers para el drag and drop de las notas
    const handleDragStart = (index) => {
        setDraggedIndex(index);
    };

    const handleDragEnd = () => {
        setDraggedIndex(null);
    };
    const handleDragOver = (e) => {
        e.preventDefault();
    };

    const handleDrop = (index) => {
        if (draggedIndex === null || draggedIndex === index) return;
        setNotas((prevNotas) => {
            const notasCopy = [...prevNotas];
            const [moved] = notasCopy.splice(draggedIndex, 1);
            notasCopy.splice(index, 0, moved);
            return notasCopy;
        });
        setDraggedIndex(null);
    };

    const fetchNotas = async () => {
        try {
                const token = await user.getIdToken();
            const response = await fetch(`${API_BASE_URL}/api/notas/?content_type=${model}&object_id=${objectId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error(`Error al obtener notas: ${response.status}`);
            }

            const data = await response.json();
            setNotas(data);
            setLoading(false);
        } catch (err) {
            console.error("Error al obtener notas:", err);
        }
    };

    useEffect(() => {
        if (!objectId) return; // no hagas nada si objectId es falsy

        //console.log("objectId recibido:", objectId);

        fetchNotas();

        socketRef.current = new WebSocket(`${WS_BASE_URL}/notas/${model}/${objectId}/?token=${user.accessToken}`);

        socketRef.current.onopen = () => {
            //console.log('Conectado al WebSocket de notas.');
        };

        socketRef.current.onmessage = (e) => {
            try {
                const data = JSON.parse(e.data);
                setNotas((prevNotas) => {
                    if (data.action === 'add') {
                        return [...prevNotas, data.data];
                    } else if (data.action === 'update') {
                        const existe = prevNotas.some((nota) => nota.id === data.data.id);
                        if (existe) {
                            // Se actualiza la nota existente
                            return prevNotas.map((nota) =>
                                nota.id === data.data.id ? data.data : nota
                            );
                        } else if (data.data.tipo !== 'privada') {
                            // Si la nota no existía y ahora es pública, se añade
                            return [...prevNotas, data.data];
                        }
                        return prevNotas;
                    } else if (data.action === 'delete') {
                        return prevNotas.filter((nota) => nota.id !== data.data.id);
                    }
                    return prevNotas;
                });
            } catch (error) {
                console.error('Error al procesar mensaje WebSocket:', error);
            }
        };

        socketRef.current.onerror = (err) => {
            console.error('WebSocket error:', err);
        };

        socketRef.current.onclose = () => {
            //console.log('WebSocket cerrado.');
        };

        return () => {
            socketRef.current?.close();
        };
    }, [objectId, model, user.accessToken]);



    const agregarNota = async () => {
        try {
                const token = await user.getIdToken();
            const response = await fetch(`${API_BASE_URL}/api/notas/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    contenido: '',
                    tipo: 'privada',
                    content_type: model,
                    object_id: objectId,
                    creador: perfil.id,
                }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Error ${response.status}: ${errorText}`);
            }

            const data = await response.json();
            //Set para hacer autofocus
            setUltimaNotaCreada(data.id);
            //console.log('Nota guardada en la base de datos:', data);

            socketRef.current?.send(JSON.stringify({
                model,
                action: 'add',
                data,
            }));

        } catch (err) {
            console.error('Error al crear nota:', err);
        }
    };



    const eliminarNota = async (id) => {
        try {
                const token = await user.getIdToken();
            const response = await fetch(`${API_BASE_URL}/api/notas/${id}/`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.ok) {
                socketRef.current?.send(JSON.stringify({
                    model,
                    action: 'delete',
                    data: { id },
                }));
                //console.log('Nota eliminada');
            } else {
                const errorText = await response.text();
                console.warn(`Error al eliminar nota: ${response.status} - ${errorText}`);
            }
        } catch (err) {
            console.error('Error al eliminar nota:', err);
        }
    };

    const actualizarTipoNota = async (id, tipo) => {
        try {
                const token = await user.getIdToken();
            const response = await fetch(`${API_BASE_URL}/api/notas/${id}/`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ tipo }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Error ${response.status}: ${errorText}`);
            }

            const data = await response.json();
            //console.log('Nota actualizada en la base de datos:', data);

            socketRef.current?.send(JSON.stringify({
                model,
                action: 'update',
                data,
            }));

        } catch (err) {
            console.error('Error al actualizar nota:', err);
        }
    };

    const actualizarContenidoNota = async (id, contenido) => {
        try {
                const token = await user.getIdToken();
            const response = await fetch(`${API_BASE_URL}/api/notas/${id}/`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ contenido }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Error ${response.status}: ${errorText}`);
            }

            const data = await response.json();

            socketRef.current?.send(JSON.stringify({
                model,
                action: 'update',
                data,
            }));

            //console.log('Contenido actualizado:', data);
        } catch (err) {
            console.error('Error al actualizar contenido:', err);
        }
    };

    return (
        <div className="nota-list-container mt-4 border-2 bg-white/5 border-gray-300 p-3 rounded-lg">
            <div className='flex gap-2'>

                <button
                    onClick={agregarNota}
                    className="bg-slate-800 text-gray-200 p-2 rounded-lg hover:bg-slate-700 cursor-pointer mb-2 transition"
                >
                    <i className='fa-solid fa-plus'></i>{" "}Nueva nota
                </button>

            </div>

            {loading ? (
                <LoadingComponent />
            ) : (

                <div className="nota-list flex flex-wrap items-start gap-4">
                    {notas
                        .filter((nota) => nota.tipo !== 'privada' || nota.creador.user === perfil.id)
                        .map((nota, idx) => (
                            <div
                                key={nota.id}

                            >
                                <Nota
                                    nota={nota}
                                    perfil={perfil}
                                    actualizarTipo={actualizarTipoNota}
                                    actualizarContenido={actualizarContenidoNota}
                                    eliminarNota={eliminarNota}
                                    onDragStart={() => handleDragStart(idx)}
                                    onDragOver={handleDragOver}
                                    onDragEnd={handleDragEnd}
                                    onDrop={() => handleDrop(idx)}
                                    isDragging={draggedIndex === idx}
                                    autoFocus={nota.id === ultimaNotaCreada}
                                    dungeonMaster={dungeonMaster}
                                />
                            </div>
                        ))}
                </div>
            )}
        </div>
    );
};
