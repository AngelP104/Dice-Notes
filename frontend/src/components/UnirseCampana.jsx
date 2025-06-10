import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { usePerfil } from "../context/PerfilContext";
import { LoadingComponent } from "./LoadingComponent";
import { PerfilCardSmall } from "./PerfilCardSmall";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;


// Componente mostrado tras usar un enlace de invitación a una campaña.
export const UnirseCampana = () => {
    const { codigo } = useParams();
    const { user, perfil } = usePerfil();
    const navigate = useNavigate();
    const [campana, setCampana] = useState(null);
    const [personajes, setPersonajes] = useState([]); // Personajes del perfil detectado
    const [personajeSeleccionado, setPersonajeSeleccionado] = useState(null);
    const [error, setError] = useState(null);
    const [mensaje, setMensaje] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!perfil?.id || !user?.accessToken) return;
        const fetchDatos = async () => {
            try {
                const token = await user.getIdToken();
                const response = await fetch(`${API_BASE_URL}/api/unirse/${codigo}/`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                if (!response.ok) throw new Error((await response.json()).detail || "Error al cargar la invitación");
                const data = await response.json();
                console.log("perfil", perfil)
                setCampana(data.campana);
                setPersonajes(data.personajes);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchDatos();
    }, [codigo, perfil]);

    const handleUnirse = async () => {
        if (!personajeSeleccionado) {
            setError("Selecciona un personaje primero.");
            return;
        }

        try {
                const token = await user.getIdToken();
            const response = await fetch(`${API_BASE_URL}/api/unirse/${codigo}/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ personaje_id: personajeSeleccionado }),
            });

            if (!response.ok) throw new Error((await response.json()).detail || "Error al unirse");

            setMensaje("¡Te has unido a la campaña! Redirigiendo...");
            navigate(`/campanas/${campana.id}`);
        } catch (err) {
            setError(err.message);
        }
    };

    if (loading) return <LoadingComponent />;
    if (error) return <p className="text-red-400 text-center mt-10">{error}</p>;

    return (
        <div className="max-w-3xl mx-auto mt-10 p-6 bg-[#4e1832] rounded-lg shadow-lg text-white">
            <h1 className="text-2xl font-bold mb-4 text-center font-serif   ">{campana.nombre}</h1>
            <p className="mb-6 text-center">{campana.descripcion_corta}</p>
            <p>Dungeon Master: <PerfilCardSmall perfil={campana.dungeon_master} /></p>

            <div className="mb-6">
                <h2 className="text-lg font-semibold mb-2">Selecciona un personaje:</h2>
                {personajes.length === 0 ? (
                    <p className="text-gray-300">No has creado ningun personaje. Crea uno antes de unirte a esta campaña.</p>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {personajes.map((pj) => (
                            <div
                                key={pj.id}
                                className={`p-4 border rounded cursor-pointer transition ${personajeSeleccionado === pj.id
                                        ? "border-green-400 bg-green-800/30"
                                        : "border-white/20 hover:bg-white/10"
                                    }`}
                                onClick={() => setPersonajeSeleccionado(pj.id)}
                            >
                                <p className="font-bold text-lg">{pj.nombre}</p>
                                <p className="text-sm text-white/70">
                                    {pj.raza} - {pj.clase} (Nivel {pj.nivel})
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="text-center">
                {personajes.length === 0 ? (
                    <button
                    className="bg-gray-400 text-black px-6 py-2 rounded font-bold cursor-not-allowed transition"
                    disabled
                >Unirse a la campaña
                </button>
                ): (

                    <button
                    className="bg-cyan-400 hover:bg-cyan-300 text-black px-6 py-2 rounded font-bold cursor-pointer transition"
                    onClick={handleUnirse}
                    >
                    Unirse a la campaña
                </button>
                )}
                {mensaje && <p className="text-green-400 mt-4">{mensaje}</p>}
            </div>

        </div>
    );
};
