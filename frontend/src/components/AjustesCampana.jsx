import { useState, useEffect } from "react";
import { usePerfil } from "../context/PerfilContext";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { LoadingComponent } from "./LoadingComponent";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Apartado de ajustes de uan campaña. Sólo se muestra si el perfil con sesión iniciada es el dungeon master de campaña
export const AjustesCampana = ({ campanaId, onUpdateInfo }) => {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        nombre: "",
        descripcion_corta: "",
        descripcion_larga: "",
        imagen: null,
    });
    const { user } = usePerfil();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [imagenPreview, setImagenPreview] = useState(null);

    useEffect(() => {
        async function fetchCampana() {
            try {
                const token = await user.getIdToken();
                const res = await fetch(`${API_BASE_URL}/api/campanas/${campanaId}/`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!res.ok) throw new Error("Error al cargar la campaña");
                const data = await res.json();
                setForm({
                    nombre: data.nombre || "",
                    descripcion_corta: data.descripcion_corta || "",
                    descripcion_larga: data.descripcion_larga || "",
                    imagen: null,
                });
                if (data.imagen) {
                    setImagenPreview(data.imagen);
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        fetchCampana();
    }, [campanaId]);

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

    const handleDelete = async () => {
        const result = await Swal.fire({
            title: "¿Estás seguro?",
            text: "Esta acción eliminará la campaña PERMANENTEMENTE y toda su informacion asociada.",
            icon: "warning",
            iconColor: "#d33",
            showCancelButton: true,
            confirmButtonText: "Sí, ELIMINAR",
            cancelButtonText: "Cancelar",
            confirmButtonColor: "#d33",
            cancelButtonColor: "#555",
            theme: "dark",
        });

        if (result.isConfirmed) {
            try {
                const token = await user.getIdToken();
                const res = await fetch(`${API_BASE_URL}/api/campanas/${campanaId}/`, {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (res.ok) {
                    Swal.fire({
                        icon: "success",
                        title: "Eliminada",
                        text: "La campaña ha sido eliminada.",
                        timer: 2000,
                        showConfirmButton: false,
                        theme: "dark",
                        timerProgressBar: true,
                    });
                    navigate("/mis-campanas/");
                } else {
                    throw new Error("No se pudo eliminar la campaña");
                }
            } catch (error) {
                Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: "Hubo un problema al eliminar la campaña",
                });
            }
        }
    };


    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validación de la imagen
        if (form.imagen) {
            const file = form.imagen;
            const validTypes = ["image/jpeg", "image/png", "image/jpg"];

            if (!validTypes.includes(file.type)) {
                Swal.fire({
                    text: "Solo se admiten archivos JPG, JPEG o PNG.",
                    theme: "dark",
                    showConfirmButton: false,
                    icon: "error",
                });
                return;
            }

            if (file.name.length > 100) {
                Swal.fire({
                    text: "El nombre del archivo es demasiado largo (máx. 100 caracteres).",
                    theme: "dark",
                    showConfirmButton: false,
                    icon: "error",
                });
                return;
            }
        }

        const formData = new FormData();
        formData.append("nombre", form.nombre);
        formData.append("descripcion_corta", form.descripcion_corta);
        formData.append("descripcion_larga", form.descripcion_larga);
        if (form.imagen) {
            formData.append("imagen", form.imagen);
        }

        try {
                const token = await user.getIdToken();
            const res = await fetch(`${API_BASE_URL}/api/campanas/${campanaId}/`, {
                method: "PATCH",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            });
            if (res.ok) {
                const data = await res.json();
                onUpdateInfo(data);
            }
            Swal.fire({
                icon: "success",
                title: "Cambios guardados",
                text: "Campaña actualizada correctamente",
                theme: "dark",
                showConfirmButton: false,
                timer: 2000,
                timerProgressBar: true,
            });
        } catch (err) {
            setError(err.message);
        }
    };

    if (loading) return <LoadingComponent />;

    return (<>

        <div className="text-white mb-4">
            <p className="text-2xl font-semibold underline mb-4">Ajustes</p>
            <div>
                <h1 className="text-xl font-semibold">Modificar Campaña</h1>

                <form onSubmit={handleSubmit} className="space-y-4 lg:w-1/2" encType="multipart/form-data">
                    {/* mismos campos que antes */}
                    <div>
                        <label className="block text-sm font-medium">Nombre</label>
                        <input
                            type="text"
                            name="nombre"
                            value={form.nombre}
                            onChange={handleChange}
                            className="mt-1 w-full px-3 py-2 border rounded bg-gray-800"
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
                            className="mt-1 w-full px-3 py-2 border rounded resize-none bg-gray-800"
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
                            className="mt-1 w-full px-3 py-2 border rounded resize-none bg-gray-800"
                            rows={4}
                            maxLength="2000"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Imagen de portada</label>
                        <input
                            type="file"
                            name="imagen"
                            accept="image/png, image/jpeg, image/jpg"
                            onChange={handleFileChange}
                            className="mt-1 block w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:text-sm file:font-semibold file:bg-emerald-600 file:border-2 file:text-white hover:file:bg-emerald-700 file:cursor-pointer transition"
                        />
                        {imagenPreview && (
                            <img
                                src={imagenPreview}
                                alt="Vista previa"
                                className="mt-2 max-h-48 rounded-xl border-2 "
                            />
                        )}
                    </div>

                    {error && <p className="text-emerald-500 text-sm">{error}</p>}

                    <button
                        type="submit"
                        className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 w-full transition border-2 hover:ring cursor-pointer"
                    >
                        Guardar cambios
                    </button>
                </form>
                {/* Botón para eliminar la campaña */}
                <div className="mt-6">
                    <button
                        type="button"
                        className="bg-red-800 text-white font-bold px-4 py-2 mt-16 rounded-lg hover:bg-red-900 w-fit transition border-2 hover:ring cursor-pointer"
                        onClick={handleDelete}
                    >
                        <i className="fa-solid fa-trash-can"></i>{" "}Eliminar campaña
                    </button>
                </div>


            </div>
        </div>
    </>
    );
};
