import { useEffect, useState } from "react";
import { usePerfil } from "../context/PerfilContext";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Sin implementar. Misiones de una campaña.
export const MisionList = ({ campanaId, dungeonMaster }) => {
    const { user, perfil } = usePerfil();
    const [misiones, setMisiones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCrear, setShowCrear] = useState(false); // control de modal

    useEffect(() => {
        const fetchMisiones = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/api/campanas/${campanaId}/misiones/`, {
                    headers: {
                        Authorization: `Bearer ${user.accessToken}`,
                    },
                });
                if (!res.ok) throw new Error("Error al cargar misiones");
                const data = await res.json();
                const ordenadas = [...data].sort((a, b) => {
                    const orden = { principal: 0, secundaria: 1, opcional: 2 };
                    return orden[a.tipo] - orden[b.tipo];
                });
                setMisiones(ordenadas);
            } catch (error) {
                console.error("Error:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchMisiones();
    }, [campanaId]);

    const tipoColor = {
        principal: "bg-red-700 border-red-400",
        secundaria: "bg-yellow-700 border-yellow-400",
        opcional: "bg-gray-700 border-gray-400",
    };

    if (loading) return <p className="text-center text-white">Cargando misiones...</p>;

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold underline">Misiones</h2>
                {perfil.id === dungeonMaster.user && (
                    <button
                        className="bg-indigo-600 border-2 border-white hover:ring hover:bg-indigo-500 text-lg rounded-lg px-3 p-2 mr-3 font-semibold text-white cursor-pointer transition"
                        onClick={() => setShowCrear(true)}
                    >
                        <i className="fa-solid fa-plus"></i>{" "}Nueva misión
                    </button>
                )}
            </div>

            {misiones.length === 0 && <p className="text-white/60 italic">No hay misiones disponibles.</p>}

            {misiones.map((mision) => (
                <div
                    key={mision.id}
                    className={`border-l-8 p-4 rounded-xl shadow-md text-white transition-all ${tipoColor[mision.tipo]}`}
                >
                    <div className="flex justify-between items-center mb-1">
                        <h3 className="text-xl font-bold">
                            {mision.tipo === "principal" && <i className="fas fa-star text-yellow-300 mr-2" />}
                            {mision.tipo === "secundaria" && <i className="fas fa-scroll mr-2" />}
                            {mision.tipo === "opcional" && <i className="fas fa-feather mr-2" />}
                            {mision.nombre}
                        </h3>
                        <span className={`text-sm font-semibold ${mision.completada ? "text-green-300" : "text-red-300"}`}>
                            {mision.completada ? "Completada" : "Sin completar"}
                        </span>
                    </div>
                    <p className="text-sm text-white/90">{mision.descripcion}</p>
                </div>
            ))}

            {/* Aquí podrías incluir el modal de creación */}
            {showCrear && (
                <div className="bg-black/70 fixed inset-0 z-40 flex items-center justify-center">
                    <div className="bg-[#4e1832] p-6 rounded-xl text-white shadow-lg w-full max-w-md">
                        <h3 className="text-xl font-bold mb-4">Crear nueva misión</h3>
                        <p className="text-white/60 italic">Aquí irá un formulario o modal funcional.</p>
                        <button
                            className="mt-4 bg-red-500 hover:bg-red-600 px-4 py-2 rounded font-semibold"
                            onClick={() => setShowCrear(false)}
                        >
                            Cancelar
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
