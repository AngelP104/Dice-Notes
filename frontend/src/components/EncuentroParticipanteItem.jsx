import { useState, useEffect, useRef } from 'react';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;


// Se controla cada participante del  encuentro
export const EncuentroParticipanteItem = ({ p, esPersonaje, nombre, perfil, dungeonMaster, encuentro, actualizarParticipante, actualizarVidaPersonaje }) => {
    const [inputValor, setInputValor] = useState(
        esPersonaje ? p.personaje.vitalidad_actual : p.vitalidad_actual_enemigo
    );
    const aplicandoRef = useRef(false);

    useEffect(() => {
        setInputValor(esPersonaje ? p.personaje.vitalidad_actual : p.vitalidad_actual_enemigo);
    }, [esPersonaje, p.personaje?.vitalidad_actual, p.vitalidad_actual_enemigo]);

    // Regex que solo permite los signos más y menos y números.
    // Si +X : se suma X más el valor anterior.
    // Si -x : se resta X del valor anterior.
    const handleInputChange = (e) => {
        const val = e.target.value;
        if (/^[-+]?\d*$/.test(val)) {
            setInputValor(val);
        }
    };

    // Se aplica el cambio de vida, dependiendo de su vida máxima, 0 como mínimo y si se suma o se resta a la actual.
    // La vida actual del enemigo se cambia desde el participante y la vida del personaje se cambia directamente sobre el personaje referenciado en el participante.
    const aplicarCambio = () => {
        if (aplicandoRef.current) return;
        aplicandoRef.current = true;
        setTimeout(() => { aplicandoRef.current = false; }, 100); //Libera la bandera tras un corto tiempo.

        let nuevoValor = inputValor;
        let actual = esPersonaje ? p.personaje.vitalidad_actual : p.vitalidad_actual_enemigo;
        let maximo = esPersonaje ? p.personaje.vitalidad_maxima : p.enemigo.vitalidad_maxima;

        if (typeof nuevoValor === "string" && nuevoValor.trim() !== "") {
            if (nuevoValor.startsWith('-')) {
                nuevoValor = Math.max(0, actual + parseInt(nuevoValor, 10));
            } else if (nuevoValor.startsWith('+')) {
                nuevoValor = Math.min(maximo, actual + parseInt(nuevoValor, 10));
            } else {
                nuevoValor = Math.max(0, Math.min(maximo, parseInt(nuevoValor, 10) || 0));
            }
        } else {
            nuevoValor = actual;
        }

        if (nuevoValor !== inputValor) {
            setInputValor(nuevoValor);
        }
        //Antes de dockerizar
        // setInputValor(nuevoValor);

        if (esPersonaje) {
            actualizarParticipante(p.id, {
                personaje: {
                    ...p.personaje,
                    vitalidad_actual: nuevoValor,
                }
            });
            actualizarVidaPersonaje(p.personaje.id, nuevoValor);
        } else {
            actualizarParticipante(p.id, {
                vitalidad_actual_enemigo: nuevoValor,
            });
        }
    };

    // Introduce los cambios con tecla "intro" o al desenfocar
    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            aplicarCambio();
            e.target.blur();
        }
    };


    const calcularModificador = (stat) => Math.floor((stat - 10) / 2);

    return (
        <div>
            <div
                key={p.id}
                className={`flex justify-between w-full items-center p-2 border-2 transition duration-200 ${esPersonaje
                    ? "bg-cyan-700/40 border-cyan-400 hover:bg-cyan-700/60"
                    : "bg-red-700/40 border-red-400 hover:bg-red-700/60"
                    }
                    ${p.turno ? "border-yellow-400 border-3 ring-yellow-200 scale-101" : ""} shadow-md`}
            >
                <div>
                    <div className="flex items-center">
                        <div className="flex flex-col justify-between items-center text-yellow-300 font-semibold text-center mr-1">
                            {p.turno ? (
                                <p className="text-yellow-300 font-bold text-2xl not-sm:text-xl">
                                    <i className="fa-solid fa-hourglass-half animate-pulse" />
                                </p>
                            ) : (
                                <i className="fa-solid fa-bolt text-2xl not-sm:text-xl"></i>
                            )}
                            <p className="text-2xl not-sm:text-xl w-8 not-sm:w-6 ">
                                {p.iniciativa}
                            </p>

                        </div>
                        <div className="mr-2 flex flex-col items-center justify-between">
                            <img
                                src={`${(esPersonaje ? p.personaje.imagen : p.enemigo.imagen).startsWith("http")
                                        ? (esPersonaje ? p.personaje.imagen : p.enemigo.imagen)
                                        : `${API_BASE_URL}${esPersonaje ? p.personaje.imagen : p.enemigo.imagen}`
                                    }`}
                                className="w-18 h-18 rounded-lg border-4 shadow-lg shadow-black/40 not-sm:w-12 not-sm:h-12 not-sm:rounded-md not-sm:border-3 not-sm:shadow-md bg-gray-200 object-cover"
                                style={{
                                    borderColor: esPersonaje ? p.personaje.color_token || "gray" : "#ff2222"
                                }}
                            />

                            {encuentro.estado !== "finalizado" && (
                                esPersonaje ? (
                                    <div className="bg-green-600 mt-1 rounded-2xl text-white w-full">
                                        <p className="flex justify-center font-bold">
                                            {/* Permiso para poder modificar la vitalidad */}
                                            {perfil.id === p.personaje.creador.user || perfil.id === dungeonMaster.user ? (
                                                <input
                                                    type="text"
                                                    className="w-8 text-center"
                                                    value={inputValor}
                                                    onClick={select => select.target.select()}
                                                    onChange={handleInputChange}
                                                    onBlur={aplicarCambio}
                                                    onKeyDown={handleKeyDown}
                                                />

                                            ) : (
                                                <input
                                                    type="text"
                                                    className="w-8 text-center"
                                                    disabled
                                                    value={inputValor}
                                                    onClick={select => select.target.select()}
                                                    onChange={handleInputChange}
                                                    onBlur={aplicarCambio}
                                                    onKeyDown={handleKeyDown}
                                                />

                                            )}
                                            /
                                            <input
                                                type="text"
                                                disabled // No se puede editar la vitalidad máxima
                                                className="w-8 text-center"
                                                value={p.personaje.vitalidad_maxima}
                                            />
                                        </p>
                                    </div>
                                ) : (
                                    perfil.id === dungeonMaster.user && (
                                        <div className="bg-red-600 mt-1 rounded-2xl text-white w-full">
                                            <p className="flex justify-center font-bold">
                                                <input
                                                    type="text"
                                                    className="w-8 text-center"
                                                    value={inputValor}
                                                    onClick={select => select.target.select()}
                                                    onChange={handleInputChange}
                                                    onBlur={aplicarCambio}
                                                    onKeyDown={handleKeyDown}
                                                />
                                                /
                                                <input
                                                    type="text"
                                                    disabled // No se puede editar la vitalidad máxima
                                                    className="w-8 text-center"
                                                    value={p.enemigo.vitalidad_maxima}
                                                />
                                            </p>
                                        </div>
                                    )
                                )
                            )}

                        </div>

                        <div>
                            {!esPersonaje && perfil.id === dungeonMaster.user ? (
                                <a
                                    href={`/enemigos/${p.enemigo.id}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xl font-bold font-serif text-white hover:underline cursor-pointer"
                                >
                                    {nombre}
                                </a>
                            ) : (
                                <h4 className="text-xl font-bold font-serif text-white">{nombre}</h4>
                            )}
                            <p className="text-sm not-sm:text-xs text-gray-300 italic">
                                {esPersonaje
                                    ? (p.personaje.clase || p.personaje.subclase)
                                        ? [
                                            p.personaje.clase || "",
                                            p.personaje.subclase || ""
                                        ].filter(Boolean).join(" / ")
                                        : ""
                                    : (p.enemigo.raza ? p.enemigo.raza : "")
                                }
                            </p>

                            {/* Armadura */}
                            {esPersonaje && p.personaje.armadura_base ? (
                                <p className="text-gray-300">
                                    <i className="fa-solid fa-shield-halved"></i>
                                    <span className="font-semibold ml-1">{p.personaje.armadura_base}</span>
                                </p>
                            ) : !esPersonaje && perfil.id === dungeonMaster.user && p.enemigo.armadura ? (
                                <p className="text-gray-300">
                                    <i className="fa-solid fa-shield-halved"></i>
                                    <span className="font-semibold ml-1">{p.enemigo.armadura}</span>
                                </p>
                            ) : null}

                            <p className="text-sm text-gray-300 pt-1 font-light">
                                {perfil.id !== dungeonMaster.user ? (
                                    <span className="text-white font-semibold">
                                        {p.estado === "vivo" ? "Vivo" : p.estado === "inconsciente" ? "Inconsciente" : p.estado === "muerto" ? "Muerto" : p.estado}
                                    </span>
                                ) : (
                                    <select className="bg-gray-700/50 text-white rounded-md p-1"
                                        onChange={(e) => actualizarParticipante(p.id, { estado: e.target.value })}
                                        value={p.estado}
                                    >
                                        <option value="vivo">Vivo</option>
                                        <option value="inconsciente">Inconsciente</option>
                                        <option value="muerto">Muerto</option>
                                        <option value="otro">Otro</option>
                                    </select>
                                )}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="flex justify-between items-center">
                    {/* Información visible para todos (Personajes) */}
                    {p.personaje && (
                        <div className='not-sm:text-xs grid grid-cols-2 gap-1 mt-2'>
                            <div className='font-light flex flex-col gap-1'>
                                <p>FUE: <span className='font-semibold'>{p.personaje.fuerza} ({calcularModificador(p.personaje.fuerza) >= 0 ? "+" : " "}{calcularModificador(p.personaje.fuerza)})</span></p>
                                <p>DES: <span className='font-semibold'>{p.personaje.destreza} ({calcularModificador(p.personaje.destreza) >= 0 ? "+" : " "}{calcularModificador(p.personaje.destreza)})</span></p>
                                <p>CON: <span className='font-semibold'>{p.personaje.constitucion} ({calcularModificador(p.personaje.constitucion) >= 0 ? "+" : " "}{calcularModificador(p.personaje.constitucion)})</span></p>
                            </div>
                            <div className='font-light flex flex-col gap-1'>
                                <p>INT: <span className='font-semibold'>{p.personaje.inteligencia} ({calcularModificador(p.personaje.inteligencia) >= 0 ? "+" : " "}{calcularModificador(p.personaje.inteligencia)})</span></p>
                                <p>SAB: <span className='font-semibold'>{p.personaje.sabiduria} ({calcularModificador(p.personaje.sabiduria) >= 0 ? "+" : " "}{calcularModificador(p.personaje.sabiduria)})</span></p>
                                <p>CAR: <span className='font-semibold'>{p.personaje.carisma} ({calcularModificador(p.personaje.carisma) >= 0 ? "+" : " "}{calcularModificador(p.personaje.carisma)})</span></p>
                            </div>
                        </div>
                    )}

                    {/* Información visible solo para el Dungeon Master (Enemigos) */}
                    {p.enemigo && perfil.id === dungeonMaster.user && (
                        <div className='not-sm:text-xs grid grid-cols-2 gap-1 mt-2'>
                            <div className='font-light flex flex-col gap-1'>
                                <p>FUE: <span className='font-semibold'>{p.enemigo.fuerza} ({calcularModificador(p.enemigo.fuerza) >= 0 ? "+" : " "}{calcularModificador(p.enemigo.fuerza)})</span></p>
                                <p>DES: <span className='font-semibold'>{p.enemigo.destreza} ({calcularModificador(p.enemigo.destreza) >= 0 ? "+" : " "}{calcularModificador(p.enemigo.destreza)})</span></p>
                                <p>CON: <span className='font-semibold'>{p.enemigo.constitucion} ({calcularModificador(p.enemigo.constitucion) >= 0 ? "+" : " "}{calcularModificador(p.enemigo.constitucion)})</span></p>
                            </div>
                            <div className='font-light flex flex-col gap-1'>
                                <p>INT: <span className='font-semibold'>{p.enemigo.inteligencia} ({calcularModificador(p.enemigo.inteligencia) >= 0 ? "+" : " "}{calcularModificador(p.enemigo.inteligencia)})</span></p>
                                <p>SAB: <span className='font-semibold'>{p.enemigo.sabiduria} ({calcularModificador(p.enemigo.sabiduria) >= 0 ? "+" : " "}{calcularModificador(p.enemigo.sabiduria)})</span></p>
                                <p>CAR: <span className='font-semibold'>{p.enemigo.carisma} ({calcularModificador(p.enemigo.carisma) >= 0 ? "+" : " "}{calcularModificador(p.enemigo.carisma)})</span></p>
                            </div>
                        </div>
                    )}
                </div>
                <div className="flex items-center">


                </div>
            </div>
        </div>
    )
}
