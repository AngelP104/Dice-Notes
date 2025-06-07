import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePerfil } from "../context/PerfilContext";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Pantalal de creación de campaña
export const CampanaCreate = () => {
    const [form, setForm] = useState({
        nombre: "",
        descripcion_corta: "",
        descripcion_larga: "",
        imagen: null,
    });
    const { user } = usePerfil();
    const [error, setError] = useState(null);
    const [imagenPreview, setImagenPreview] = useState(null);
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setForm((prev) => ({ ...prev, imagen: file }));
            setImagenPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const formDataToSubmit = new FormData();
        formDataToSubmit.append("nombre", form.nombre);
        formDataToSubmit.append("descripcion_corta", form.descripcion_corta);
        formDataToSubmit.append("descripcion_larga", form.descripcion_larga);

        if (form.imagen) {
            formDataToSubmit.append("imagen", form.imagen);
        }

        try {
            const res = await fetch(`${API_BASE_URL}/api/mis-campanas/crear/`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${user.accessToken}`,
                },
                body: formDataToSubmit,
            });

            if (!res.ok) throw new Error("Error al crear la campaña");

            const data = await res.json();
            navigate(`/campanas/${data.id}`);
        } catch (err) {
            setError(err.message);
        }
    };


    return (
        <main className="flex flex-col mx-auto justify-center m-6 max-w-2xl p-4 text-white bg-gray-800 rounded-lg shadow-lg border-2 border-gray-700">
            <h1 className="text-2xl font-bold mb-4">Crear Campaña</h1>

            <form onSubmit={handleSubmit} className="space-y-4" encType="multipart/form-data">
                <div>
                    <label className="block text-sm font-medium">Nombre</label>
                    <input
                        type="text"
                        name="nombre"
                        value={form.nombre}
                        onChange={handleChange}
                        className="mt-1 w-full px-3 py-2 border rounded"
                        required
                        maxLength="50"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium">Descripción corta</label>
                    <textarea
                        name="descripcion_corta"
                        value={form.descripcion_corta}
                        onChange={handleChange}
                        className="mt-1 w-full px-3 py-2 border rounded resize-none"
                        rows={2}
                        maxLength="100"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium">Descripción larga</label>
                    <textarea
                        name="descripcion_larga"
                        value={form.descripcion_larga}
                        onChange={handleChange}
                        className="mt-1 w-full px-3 py-2 border rounded resize-none"
                        rows={4}
                        maxLength="2000"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium">Imagen de portada</label>
                    <input
                        type="file"
                        name="imagen"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="mt-1 block w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:text-sm file:font-semibold file:bg-emerald-600 file:border-2 file:text-white hover:file:bg-emerald-700 file:cursor-pointer transition"
                    />
                    {imagenPreview && (
                        <img
                            src={imagenPreview}
                            alt="Vista previa"
                            className="mt-2 max-h-32 rounded-xl border-2 "
                        />
                    )}
                </div>

                {error && <p className="text-red-500 text-sm">{error}</p>}

                <button
                    type="submit"
                    className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 w-full transition border-2 hover:ring cursor-pointer"
                >
                    Crear Campaña
                </button>
            </form>
        </main>
    );
};
