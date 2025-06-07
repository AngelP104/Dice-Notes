import React, { useState, useEffect } from "react";
import { usePerfil } from "../context/PerfilContext";
import { useNavigate, useParams } from "react-router-dom";
import { EncuentroCreateCard } from "./EncuentroCreateCard";
import { v4 as uuid } from "uuid";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Pantalla de creación de encuentro
export const EncuentroCreate = () => {
    const navigate = useNavigate();
    const { user } = usePerfil();
    const { campanaId } = useParams();
    const [personajes, setPersonajes] = useState([]);
    const [enemigos, setEnemigos] = useState([]);
    const [personajesSeleccionados, setPersonajesSeleccionados] = useState([]);
    const [enemigosSeleccionados, setEnemigosSeleccionados] = useState([]);
    const [busquedaEnemigos, setBusquedaEnemigos] = useState("");
    const [nombre, setNombre] = useState("");

    useEffect(() => {
        // Se obtienen los personajes y los enemigos a seleccionar
        const fetchParticipantes = async () => {
            const [resPersonajes, resEnemigos] = await Promise.all([
                fetch(`${API_BASE_URL}/api/campanas/${campanaId}/party/`, {
                    headers: { Authorization: `Bearer ${user.accessToken}` },
                }),
                fetch(`${API_BASE_URL}/api/enemigos/`, {
                    headers: { Authorization: `Bearer ${user.accessToken}` },
                }),
            ]);

            const [dataPersonajes, dataEnemigos] = await Promise.all([
                resPersonajes.json(),
                resEnemigos.json(),
            ]);

            setPersonajes(dataPersonajes);
            setEnemigos(dataEnemigos);
        };

        fetchParticipantes();
    }, []);

    const calcularModificador = (stat) => Math.floor((stat - 10) / 2);

    const iniciativaAutomatica = (des) => {
        return ((Math.floor(Math.random() * 20) + 1) + des);
    }

    const handleIniciativaChange = (instanciaId, value) => {
        setEnemigosSeleccionados((prev) =>
            prev.map((e) =>
                e.instanciaId === instanciaId
                    ? { ...e, iniciativa: Number(value) }
                    : e
            )
        );
        setPersonajesSeleccionados((prev) =>
            prev.map((p) =>
                p.id === instanciaId
                    ? { ...p, iniciativa: Number(value) }
                    : p
            )
        );
    };

    // Almacena los participantes en una lista
    const handleSeleccion = (lista, setLista, item, esPersonaje) => {
        if (esPersonaje) {
            if (!lista.some((p) => p.id === item.id)) {
                setLista([...lista, { ...item, instanciaId: uuid() }]);
            }
        } else {
            setLista([
                ...lista,
                {
                    ...item,
                    instanciaId: uuid(),
                    iniciativa: iniciativaAutomatica(calcularModificador(item.destreza)),
                },
            ]);
        }
    };

    const handleEliminar = (lista, setLista, itemId) => {
        setLista(lista.filter((p) => p.id !== itemId));
    };

    const handleEliminarEnemigo = (instanciaId) => {
        setEnemigosSeleccionados(enemigosSeleccionados.filter((e) => e.instanciaId !== instanciaId));
    };

    const handleCrearEncuentro = async (e) => {
        e.preventDefault();
        try {
            // Se crea el encuentro
            const res = await fetch(`${API_BASE_URL}/api/campanas/${campanaId}/encuentros/crear/`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${user.accessToken}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ nombre, campana: campanaId }),
            });


            const encuentro = await res.json();
            console.log(encuentro)

            // Crear participantes y asignarlos
            const participantes = [
                ...personajesSeleccionados.map((p) => ({
                    tipo: "personaje",
                    personaje_id: p.id,
                    iniciativa: p.iniciativa,
                })),
                ...enemigosSeleccionados.map((e) => ({
                    tipo: "enemigo",
                    enemigo_id: e.id,
                    iniciativa: e.iniciativa,
                })),
            ];

            console.log(participantes)

            for (const participante of participantes) {
                const resPart = await fetch(`${API_BASE_URL}/api/campanas/${campanaId}/encuentros/${encuentro.id}/participantes/crear/`, {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${user.accessToken}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(participante),
                });


                if (!resPart.ok) throw new Error("Error al agregar participante");
            }

            // Redirigir
            navigate(`/campanas/${campanaId}/`);
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <form onSubmit={handleCrearEncuentro} className="p-6 bg-[#3b1026] rounded-b-xl shadow-xl text-white space-y-6">
            <div className="flex justify-left items-center gap-4">
                <h2 className="text-2xl font-bold">Nuevo Encuentro</h2>
                <button type="submit"
                    className="bg-red-500 text-white font-semibold text-lg p-2 rounded-lg border-2 border-white hover:bg-red-700 transition cursor-pointer hover:ring">
                    <i className="fa-solid fa-plus mr-1"></i>
                    {" "}CREAR</button>
            </div>
            <div className="flex items-center gap-1 text-xl">
                <p className="bg-rose-500 py-1 px-3 rounded-lg font-bold">{(personajesSeleccionados.length + enemigosSeleccionados.length)}</p>
                <p className="font-semibold">Participantes</p>
            </div>

            <section>
                <div className="flex flex-col">

                    {/* Nombre */}
                    <label>Nombre</label>
                    <input type="text"
                        required
                        maxLength="200"
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}
                        className="w-full mb-4 p-2 rounded bg-gray-700 border-2 border-gray-600 text-white"
                    />
                </div>
                {/* Lista seleccion personajes */}
                <h3 className="text-xl font-semibold mb-2">Seleccionar Personajes</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {personajes.map((p) => (
                        <EncuentroCreateCard
                            key={p.id}
                            entidad={p.personaje}
                            esPersonaje
                            onClick={() => handleSeleccion(personajesSeleccionados, setPersonajesSeleccionados, p.personaje, true)}
                        />
                    ))}
                </div>
                {/* Personajes seleccionados */}
                {personajesSeleccionados.length > 0 && (
                    <div className="mt-4">
                        <h4 className="font-semibold text-white mb-2">Seleccionados:</h4>
                        <div className="gap-3 md:grid md:grid-cols-2 lg:grid-cols-3">
                            {personajesSeleccionados.map((p) => (
                                <div key={p.id} className="mb-1 bg-gray-800 pl-2 rounded-md border-2 border-gray-700 flex justify-between items-center">
                                    <div className="flex items-center">
                                        <i className="fa-solid fa-zap text-yellow-400 mr-1"></i>
                                        <input type="text"
                                            className="w-20 text-yellow-400 font-semibold"
                                            placeholder={`(1D20 ${calcularModificador(p.destreza) >= 0 ? "+ " : " "}${calcularModificador(p.destreza)})`}
                                            value={p.iniciativa ?? ""}
                                            onChange={(ev) => handleIniciativaChange(p.id, ev.target.value)}
                                        />
                                        <p>{p.nombre}</p>
                                    </div>
                                    <button type="button" onClick={() => handleEliminar(personajesSeleccionados, setPersonajesSeleccionados, p.id, false)} className="p-2 text-gray-200 bg-red-500 hover:bg-red-600 rounded-r border-l-2 border-gray-700 cursor-pointer transition">Eliminar</button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </section>
            {/* Lista seleccion enemigos */}
            <section>
                <h3 className="text-xl font-semibold mb-2">Seleccionar Enemigos</h3>
                <input
                    type="text"
                    placeholder="Buscar enemigos..."
                    className="w-full mb-4 p-2 rounded bg-gray-700 border-2 border-gray-600 text-white"
                    value={busquedaEnemigos}
                    onChange={(e) => setBusquedaEnemigos(e.target.value)}
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {enemigos
                        .filter((e) => e.nombre.toLowerCase().includes(busquedaEnemigos.toLowerCase()))
                        .map((e) => (
                            <EncuentroCreateCard
                                key={e.id}
                                entidad={e}
                                esPersonaje={false}
                                onClick={() => handleSeleccion(enemigosSeleccionados, setEnemigosSeleccionados, e)}
                            />
                        ))}
                </div>

                {/* Enemigos seleccionados */}
                {enemigosSeleccionados.length > 0 && (
                    <div className="mt-4">
                        <h4 className="font-semibold text-white mb-2">Seleccionados:</h4>
                        <div className="gap-3 md:grid md:grid-cols-2 lg:grid-cols-3">
                            {enemigosSeleccionados.map((enemigo) => (
                                <div key={enemigo.instanciaId} className="mb-1 bg-gray-800 pl-2 border-2 border-gray-700 rounded-md flex justify-between items-center">
                                    <div className="flex items-center">
                                        <i className="fa-solid fa-zap text-yellow-400 mr-1"></i>
                                        <input type="text"
                                            className="w-20 text-yellow-400 font-semibold"
                                            placeholder={`(1D20 ${calcularModificador(enemigo.destreza) >= 0 ? "+" : " "}${calcularModificador(enemigo.destreza)})`}
                                            defaultValue={iniciativaAutomatica(calcularModificador(enemigo.destreza))}
                                            value={enemigo.iniciativa ?? ""}
                                            required
                                            onChange={(ev) => handleIniciativaChange(enemigo.instanciaId, ev.target.value)}
                                        />
                                        <p>{enemigo.nombre}</p>
                                    </div>
                                    <button type="button" onClick={(e) => handleEliminarEnemigo(enemigo.instanciaId)} className="p-2 text-gray-200 bg-red-500 hover:bg-red-600 rounded-r border-l-2 border-gray-700 cursor-pointer transition">Eliminar</button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </section>
        </form>
    );
};
