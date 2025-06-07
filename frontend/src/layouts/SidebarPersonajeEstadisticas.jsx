import { useState, useRef, useEffect } from "react";
import { LoadingComponent } from "../components/LoadingComponent";
import { PerfilCardSmall } from "../components/PerfilCardSmall";
import { useNavigate } from "react-router-dom";
import { usePerfil } from "../context/PerfilContext";
import { Link } from "react-router-dom";
import { VitalidadPersonaje } from "../components/VitalidadPersonaje";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;


const habilidades = [
    { nombre: "Acrobacias", stat: "destreza" },
    { nombre: "Arcanos", stat: "inteligencia" },
    { nombre: "Atletismo", stat: "fuerza" },
    { nombre: "Engaño", stat: "carisma" },
    { nombre: "Historia", stat: "inteligencia" },
    { nombre: "Interpretación", stat: "carisma" },
    { nombre: "Intimidación", stat: "carisma" },
    { nombre: "Investigación", stat: "inteligencia" },
    { nombre: "Juego de Manos", stat: "destreza" },
    { nombre: "Medicina", stat: "sabiduria" },
    { nombre: "Naturaleza", stat: "inteligencia" },
    { nombre: "Percepción", stat: "sabiduria" },
    { nombre: "Perspicacia", stat: "sabiduria" },
    { nombre: "Persuasión", stat: "carisma" },
    { nombre: "Religión", stat: "inteligencia" },
    { nombre: "Sigilo", stat: "destreza" },
    { nombre: "Supervivencia", stat: "sabiduria" },
    { nombre: "Trato con Animales", stat: "sabiduria" },
];


function calcularModificador(valor) {
    const mod = Math.floor((valor - 10) / 2);
    return mod >= 0 ? `+${mod}` : mod;
}

export const SidebarPersonajeEstadisticas = ({ personaje, setPersonaje, dungeonMaster }) => {
    const { perfil } = usePerfil();
    const esCreador = perfil.id === personaje?.creador.user;
    if (!personaje) return <LoadingComponent />;

    return (
        <div className="max-w-[250px] text-md">
            <div>
                <p>Creado por</p>
                <div className="w-fit mb-4"><PerfilCardSmall perfil={personaje.creador} /></div>
            </div>
            <div className="mb-2">
                <Link
                    className="text-emerald-400 underline hover:text-emerald-200 text-md"
                    to={`/personajes/${personaje.id}`}
                >
                    Ver ficha completa
                </Link>
            </div>
            {/* Imagen y nombre */}
            <div className="flex justify-start items-start mb-2">

                <img
                    src={personaje.imagen}
                    className="w-16 h-16 object-cover rounded-lg border-4 bg-gray-200 mb-1"
                    style={{ borderColor: personaje.color_token }}
                />
                <div className="ml-2">
                    <h2 className="text-lg font-bold text-white w-full">{personaje.nombre}</h2>
                    <p className="italic text-gray-300 w-full">
                        {personaje.clase}{personaje.subclase ? ` / ${personaje.subclase}` : ""}
                    </p>
                    
                </div>
            </div>

            {/* Raza, alineamiento, creador */}
            <div className="flex flex-wrap items-center">
                <p className="text-gray-300 w-full">
                        Nivel {personaje.nivel}
                    </p>
                <p className="text-gray-300">Raza: <span className="text-white">{personaje.raza}</span></p>
                {personaje.alineamiento && (
                    <p className="text-gray-300">| <span className="text-white">{personaje.alineamiento}</span></p>
                )}
            </div>

            {/* Experiencia, armadura, bono competencia */}
            <div className="mb-2 flex flex-col gap-0.5">
                {personaje.xp !== undefined && (
                    <span className="text-gray-300">XP: <span className="text-white">{personaje.xp}</span></span>
                )}
                {personaje.armadura_base !== undefined && (
                    <span className="text-gray-300">Armadura: <span className="text-white">{personaje.armadura_base}</span></span>
                )}
                {personaje.bono_competencia !== undefined && (
                    <span className="text-gray-300">Bono competencia: <span className="text-yellow-400 font-semibold">{personaje.bono_competencia}</span></span>
                )}
            </div>

            {/* Vitalidad editable */}
            <div className="mb-2">
                <VitalidadPersonaje dungeonMaster={dungeonMaster} esCreador={esCreador} personaje={personaje} setPersonaje={setPersonaje} />
            </div>
            {/* Estadísticas */}
            <div className="mb-2">
                <span className="text-white font-semibold underline">Estadísticas:</span>
                <ul className="grid grid-cols-2 gap-x-2 gap-y-0.5 mt-1">
                    <li>FUE: <span className="text-white">{personaje.fuerza} ({calcularModificador(personaje.fuerza)})</span></li>
                    <li>DES: <span className="text-white">{personaje.destreza} ({calcularModificador(personaje.destreza)})</span></li>
                    <li>CON: <span className="text-white">{personaje.constitucion} ({calcularModificador(personaje.constitucion)})</span></li>
                    <li>INT: <span className="text-white">{personaje.inteligencia} ({calcularModificador(personaje.inteligencia)})</span></li>
                    <li>SAB: <span className="text-white">{personaje.sabiduria} ({calcularModificador(personaje.sabiduria)})</span></li>
                    <li>CAR: <span className="text-white">{personaje.carisma} ({calcularModificador(personaje.carisma)})</span></li>
                </ul>
            </div>

            {/* Habilidades derivadas */}
            <div className="mb-2">
                <span className="text-white font-semibold underline">Habilidades:</span>
                <ul className="flex flex-col mt-1">
                    {habilidades.map((hab) => {
                        // Se calcula el valor simplificado final
                        const statValue = personaje[hab.stat];
                        const mod = Math.floor((statValue - 10) / 2);
                        const tieneCompetencia = personaje.competencias && personaje.competencias.includes(hab.nombre);
                        const bonoCompetencia = tieneCompetencia ? (personaje.bono_competencia || 0) : 0;
                        const total = mod + bonoCompetencia;
                        return (
                            <li key={hab.nombre} className="flex items-center justify-between gap-1 border-b border-gray-500">
                                <span className="text-white">{hab.nombre}</span>
                                <span className="text-emerald-400 font-semibold">{tieneCompetencia ? <b className="text-yellow-400 font-normal">*</b> : null}{total >= 0 ? "+" : ""}{total}</span>
                            </li>
                        );
                    })}
                </ul>
                <span className="text-gray-400 text-xs"><span className="text-yellow-400">*</span> Competencia añadida</span>
            </div>

            {/* Competencias */}
            {personaje.competencias && personaje.competencias.length > 0 && (
                <div className="mb-2">
                    <span className="text-white font-semibold underline">Competencias:</span>
                    <ul className="flex flex-wrap gap-1 mt-1">
                        {personaje.competencias.map((comp) => (
                            <li key={comp} className="bg-rose-700/80 px-2 py-0.5 rounded text-white text-xs">{comp}</li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Idiomas */}
            {personaje.idiomas && personaje.idiomas.length > 0 && (
                <div className="mb-2">
                    <span className="text-white font-semibold underline">Idiomas:</span>
                    <ul className="flex flex-wrap gap-1 mt-1">
                        {personaje.idiomas.map((idioma) => (
                            <li key={idioma.id} className="bg-emerald-700/80 px-2 py-0.5 rounded text-white text-xs">{idioma.nombre}</li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};