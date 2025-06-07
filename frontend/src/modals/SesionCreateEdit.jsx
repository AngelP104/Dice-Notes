import { useEffect, useState } from "react";
import { usePerfil } from "../context/PerfilContext";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Un modal que depende del modo "edit" o cualquier otro ("create") cambia su funcionamiento
export const SesionCreateEdit = ({ campanaId, sesionId, onClose, onSubmitted, modo }) => {
    const [form, setForm] = useState({
        nombre: "",
        fecha_inicio: "",
        ubicacion: ""
    });
    const { user } = usePerfil();
    const [loading, setLoading] = useState(modo === "edit");
    const [error, setError] = useState(null);

    // Si estamos en modo edición, cargamos los datos actuales
    useEffect(() => {
        if (modo === "edit") {
            async function fetchSesion() {
                try {
                    const res = await fetch(`${API_BASE_URL}/api/campanas/${campanaId}/sesiones/${sesionId}/`, {
                        headers: {
                            "Authorization": `Bearer ${user.accessToken}`,
                        }
                    });
                    if (!res.ok) throw new Error("Error al cargar la sesión");
                    const data = await res.json();
                    setForm({
                        nombre: data.nombre || "",
                        fecha_inicio: data.fecha_inicio ? data.fecha_inicio.slice(0, 16) : "",
                        ubicacion: data.ubicacion || "",
                    });
                } catch (err) {
                    setError(err.message);
                } finally {
                    setLoading(false);
                }
            }
            fetchSesion();
        }
    }, [modo, sesionId, campanaId, user.accessToken]);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    // Depende de la condición, se usa un enlace u otro
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        const url = modo === "edit"
            ? `${API_BASE_URL}/api/campanas/${campanaId}/sesiones/${sesionId}/`
            : `${API_BASE_URL}/api/campanas/${campanaId}/sesiones/crear/`;

        const method = modo === "edit" ? "PATCH" : "POST";

        try {
            const res = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${user.accessToken}`,
                },
                body: JSON.stringify(form),
            });

            if (!res.ok) throw new Error(modo === "edit" ? "Error al actualizar la sesión" : "Error al crear la sesión");

            const data = await res.json();
            onSubmitted(true);
            onClose();
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-gray-800 rounded-lg shadow-lg w-full max-w-md p-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-bold">{modo === "edit" ? "Editar Sesión" : "Crear Sesión"}</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-black">
                        <i className="fa-solid fa-xmark"></i>
                    </button>
                </div>

                {loading ? (
                    <p>Cargando...</p>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium">Nombre</label>
                            <input
                                type="text"
                                name="nombre"
                                value={form.nombre}
                                onChange={handleChange}
                                className="mt-1 w-full px-3 py-2 border rounded"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Fecha de inicio</label>
                            <input
                                type="datetime-local"
                                name="fecha_inicio"
                                value={form.fecha_inicio}
                                onChange={handleChange}
                                className="mt-1 w-full px-3 py-2 border rounded"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Ubicación</label>
                            <input
                                type="text"
                                name="ubicacion"
                                value={form.ubicacion}
                                onChange={handleChange}
                                className="mt-1 w-full px-3 py-2 border rounded"
                            />
                        </div>

                        {error && <p className="text-red-500 text-sm">{error}</p>}

                        <div className="">
                            <button
                                type="submit"
                                className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 w-full cursor-pointer transition border-2 hover:ring"
                            >
                                {modo === "edit" ? "Guardar cambios" : "Crear sesión"}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};
