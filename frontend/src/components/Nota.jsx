import { useState, useEffect, useRef } from 'react';
import { usePerfil } from '../context/PerfilContext';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;


export const Nota = ({
    nota, actualizarTipo, actualizarContenido, eliminarNota,
    onDragStart, onDragOver, onDragEnd, onDrop, isDragging, autoFocus, dungeonMaster
}) => {
    const TIEMPO_ACTUALIZACION = 1000; // 1 segundo

    const [tipo, setTipo] = useState(nota.tipo);
    const [contenido, setContenido] = useState(nota.contenido);
    const contenidoPrevioRef = useRef(nota.contenido);
    const hayCambiosRef = useRef(false);
    const intervaloRef = useRef(null);
    const { perfil } = usePerfil();
    const [actualizada, setActualizada] = useState(false);

    const inputRef = useRef(null);

    useEffect(()=> {
        if (autoFocus && inputRef.current) {
            inputRef.current.focus();
        }
    },[autoFocus])

    useEffect(() => {
        setTipo(nota.tipo);
        setContenido(nota.contenido);
        contenidoPrevioRef.current = nota.contenido;
    }, [nota]);


    useEffect(() => {
        // Iniciar el intervalo al montar
        intervaloRef.current = setInterval(() => {
            if (hayCambiosRef.current && contenidoPrevioRef.current !== contenido) {
                actualizarContenido(nota.id, contenido);
                contenidoPrevioRef.current = contenido;
                hayCambiosRef.current = false;

                if (nota.creador.user === perfil.id) {
                    setActualizada(true);
                    setTimeout(() => setActualizada(false), 600);
                }
            }
        }, TIEMPO_ACTUALIZACION);

        // Limpiar el intervalo al desmontar
        return () => clearInterval(intervaloRef.current);
    }, [contenido]);

    const manejarCambioTipo = (e) => {
        const nuevoTipo = e.target.value;
        setTipo(nuevoTipo);
        actualizarTipo(nota.id, nuevoTipo);
    };

    const manejarCambioContenido = (e) => {
        const nuevoContenido = e.target.value;
        setContenido(nuevoContenido);
        hayCambiosRef.current = true;
    };

    // Ocultar nota si es privada y el usuario no es el creador
    if (nota.tipo === 'privada' && nota.creador.user !== perfil.id) return null;


    return (
        <div className={`nota-container bg-gray-700 rounded-lg border-gray-600 border-2 flex flex-col
        `}
            style={{ opacity: isDragging ? 0.5 : 1 }}
            onDragOver={onDragOver}
            onDrop={onDrop}
            onDragEnd={onDragEnd}>
            {/* Fila superior */}
            <div className="flex justify-between items-center"
                draggable
                onDragStart={onDragStart}
                style={{ cursor: 'grab' }}>
                <div className="flex items-center gap-3">

                    {nota.creador.user === perfil.id ? (
                        <select
                            value={tipo}
                            onChange={manejarCambioTipo}
                            className="bg-gray-600 text-white p-2 rounded-tl-md"
                        >
                            <option value="privada">Privada</option>
                            <option value="publica">Pública</option>
                            {/*<option value="dm">DM y Jugador</option>*/}
                        </select>
                    ) : (
                        <div className={`bg-gray-600 text-white p-2 rounded-tl-md ${tipo === 'privada' ? 'bg-red-500' : ''}`}>
                            {tipo === 'privada' ? 'Privada' : tipo === 'publica' ? 'Pública' : 'DM y Jugador'}
                        </div>
                    )}
                    <p className="flex items-center text-sm text-gray-400 mr-3  text-ellipsis select-none">
                        <img src={nota.creador.avatar} className="w-6 h-6 rounded-full mr-1 border-1 border-white bg-gray-300 object-cover"
                            draggable="false"
                        />

                        {nota.creador.apodo}
                    </p>

                </div>
                {(nota.creador.user === perfil.id || dungeonMaster?.user === perfil.id) && (
                    <button
                        onClick={() => eliminarNota(nota.id)}
                        className="text-red-500 hover:text-red-400 px-3 cursor-pointer rounded-full"
                    >
                        <i className="fas fa-times"></i>
                    </button>
                )}
            </div>

            {/* Textarea abajo */}
            <textarea
            ref={inputRef}
                className="text-white bg-gray-800 p-2 rounded-b resize min-w-full min-h-40"
                value={contenido}
                onChange={manejarCambioContenido}

            />
        </div>
    );

};
