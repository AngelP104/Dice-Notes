import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { usePerfil } from "../context/PerfilContext";
import Swal from "sweetalert2";
import imagenDefault from "../assets/pjs/default_pj.jpg";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;


export const PersonajeCreate = () => {
    const { user } = usePerfil();
    const navigate = useNavigate();

    const [idiomasDisponibles, setIdiomasDisponibles] = useState([]);
    const [formData, setFormData] = useState({
        imagen: null,
        nombre: "",
        raza: "",
        subraza: "",
        clase: "",
        subclase: "",
        nivel: 1,
        xp: 0,
        inspiracion: false,
        vitalidad_maxima: 20,
        vitalidad_actual: 20,
        fuerza: 10,
        destreza: 10,
        constitucion: 10,
        inteligencia: 10,
        sabiduria: 10,
        carisma: 10,
        bono_competencia: 2,
        competencias: [],
        armadura_base: 0,
        idiomas: [],
        color_token: "#2da621",
    });
    const [error, setError] = useState(null);

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

    useEffect(() => {
        const fetchIdiomas = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/api/idiomas/`, {
                    headers: { Authorization: `Bearer ${user.accessToken}` },
                });
                if (!response.ok) throw new Error("No se pudieron obtener los idiomas");
                const data = await response.json();
                setIdiomasDisponibles(data);
            } catch (err) {
                setError(err.message);
            }
        };
        fetchIdiomas();
    }, [user]);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        if (type === "checkbox") {
            if (name === "competencias") {
                setFormData((prev) => {
                    const competencias = prev.competencias.includes(value)
                        ? prev.competencias.filter((comp) => comp !== value)
                        : [...prev.competencias, value];
                    return { ...prev, competencias };
                });
            } else if (name === "idiomas") {
                const id = parseInt(value);
                setFormData((prev) => {
                    const idiomas = prev.idiomas.includes(id)
                        ? prev.idiomas.filter((idioma) => idioma !== id)
                        : [...prev.idiomas, id];
                    return { ...prev, idiomas };
                });
            }
        } else if (type === "file") {
            setFormData((prev) => ({ ...prev, imagen: e.target.files[0] }));
        } else if (
            [
                "nivel",
                "xp",
                "vitalidad_maxima",
                "vitalidad_actual",
                "fuerza",
                "destreza",
                "constitucion",
                "inteligencia",
                "sabiduria",
                "carisma",
                "bono_competencia",
                "armadura_base",
            ].includes(name)
        ) {
            setFormData((prev) => ({ ...prev, [name]: Number(value) }));
        } else if (name === "inspiracion") {
            setFormData((prev) => ({ ...prev, inspiracion: value === "true" }));
        } else {
            setFormData((prev) => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.nombre || !formData.raza || !formData.clase) {
            setError("Nombre, raza y clase son obligatorios.");
            return;
        }
        if (!formData.idiomas || formData.idiomas.length === 0) {
            Swal.fire({
                text: "Debes seleccionar al menos un idioma",
                theme: "dark",
                showConfirmButton: false,
                icon: "error"
            });
            return;
        }
        if (formData.vitalidad_maxima < formData.vitalidad_actual) {
            Swal.fire({
                text: "La vida actual no puede ser mayor que la máxima",
                theme: "dark",
                showConfirmButton: false,
                icon: "error"
            });
            return;
        }

        const form = new FormData();
        for (const key in formData) {
            if (key === "imagen" && formData.imagen instanceof File) {
                form.append("imagen", formData.imagen);
            } else if (key === "idiomas") {
                formData.idiomas.forEach(idiomaId => form.append("idiomas_ids", idiomaId));
            } else if (key === "competencias") {
                form.append("competencias", JSON.stringify(formData[key]));
            } else if (formData[key] !== null && formData[key] !== undefined) {
                form.append(key, formData[key]);
            }
        }

        try {
            const response = await fetch(`${API_BASE_URL}/api/mis-personajes/crear/`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${user.accessToken}`,
                },
                body: form,
            });
            if (!response.ok) {
                let errorMsg = "Error al crear el personaje";
                try {
                    const errorData = await response.json();
                    errorMsg = JSON.stringify(errorData, null, 2);
                } catch {
                    errorMsg = await response.text();
                }
                throw new Error(errorMsg);
            }
            const data = await response.json();
            navigate(`/personajes/${data.id}`);
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="min-h-screen bg-[#571f3e] flex justify-center">
            <div className="bg-[#752a53] text-white p-3 sm:p-6 rounded-b-4xl shadow-lg w-full lg:max-w-2/3">
                <h2 className="text-3xl font-bold mb-6">Crear Personaje</h2>
                {error && <p className="text-red-400 mb-4">{error}</p>}
                <form onSubmit={handleSubmit}>
                    <div className="flex items-center space-x-4">
                        <img
                            src={
                                formData.imagen
                                    ? URL.createObjectURL(formData.imagen)
                                    : imagenDefault
                            }
                            className="w-32 h-32 rounded-xl border-4 bg-gray-200"
                            style={{ borderColor: formData.color_token }}
                        />
                        <div>
                            <label className="block mb-2">Imagen</label>
                            <input
                                type="file"
                                name="imagen"
                                accept="image/*"
                                onChange={handleInputChange}
                                className="bg-[#291325] p-2 rounded-lg w-full"
                            />
                            <label className="block mt-4">Color del Token</label>
                            <input
                                type="color"
                                name="color_token"
                                required
                                value={formData.color_token}
                                onChange={handleInputChange}
                                className="w-16 h-8 p-1 rounded"
                            />
                        </div>
                    </div>
                    {/* Campos adicionales */}
                    <div className="mt-6 grid md:grid-cols-2 gap-6">
                        <div>
                            <div className="mb-4">
                                <label className="block">Nombre</label>
                                <input
                                    type="text"
                                    name="nombre"
                                    maxLength="100"
                                    required
                                    value={formData.nombre}
                                    onChange={handleInputChange}
                                    className="w-full p-2 bg-[#291325] text-white rounded"
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block">Raza</label>
                                <input
                                    type="text"
                                    name="raza"
                                    maxLength="50"
                                    required
                                    value={formData.raza}
                                    onChange={handleInputChange}
                                    className="w-full p-2 bg-[#291325] text-white rounded"
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block">Subraza</label>
                                <input
                                    type="text"
                                    name="subraza"
                                    maxLength="50"
                                    value={formData.subraza}
                                    onChange={handleInputChange}
                                    className="w-full p-2 bg-[#291325] text-white rounded"
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block">Clase</label>
                                <input
                                    type="text"
                                    name="clase"
                                    maxLength="50"
                                    required
                                    value={formData.clase}
                                    onChange={handleInputChange}
                                    className="w-full p-2 bg-[#291325] text-white rounded"
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block">Subclase</label>
                                <input
                                    type="text"
                                    name="subclase"
                                    maxLength="50"
                                    value={formData.subclase}
                                    onChange={handleInputChange}
                                    className="w-full p-2 bg-[#291325] text-white rounded"
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block">Nivel</label>
                                <input
                                    type="number"
                                    name="nivel"
                                    required
                                    value={formData.nivel}
                                    onChange={handleInputChange}
                                    className="w-full p-2 bg-[#291325] text-white rounded"
                                />
                            </div>
                        </div>
                        <div>
                            <div className="mb-4">
                                <label className="block">Vitalidad Actual</label>
                                <input
                                    type="number"
                                    name="vitalidad_actual"
                                    value={formData.vitalidad_actual}
                                    required
                                    onChange={handleInputChange}
                                    className="w-full p-2 bg-[#291325] text-white rounded"
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block">Vitalidad Máxima</label>
                                <input
                                    type="number"
                                    name="vitalidad_maxima"
                                    required
                                    value={formData.vitalidad_maxima}
                                    onChange={handleInputChange}
                                    className="w-full p-2 bg-[#291325] text-white rounded"
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block">Bono de competencia</label>
                                <input
                                    type="number"
                                    name="bono_competencia"
                                    value={formData.bono_competencia}
                                    onChange={handleInputChange}
                                    className="w-full p-2 bg-[#291325] text-white rounded"
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block">XP</label>
                                <input
                                    type="number"
                                    name="xp"
                                    value={formData.xp}
                                    onChange={handleInputChange}
                                    className="w-full p-2 bg-[#291325] text-white rounded"
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block">Armadura Base</label>
                                <input
                                    type="number"
                                    name="armadura_base"
                                    required
                                    value={formData.armadura_base}
                                    onChange={handleInputChange}
                                    className="w-full p-2 bg-[#291325] text-white rounded"
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block">Inspiración</label>
                                <select
                                    name="inspiracion"
                                    value={formData.inspiracion}
                                    onChange={handleInputChange}
                                    className="w-full p-2 bg-[#291325] text-white rounded"
                                >
                                    <option value={true}>Sí</option>
                                    <option value={false}>No</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    {/* Sección de estadísticas y habilidades */}
                    <div className="mt-6 grid md:grid-cols-2 gap-6">
                        <div>
                            <h3 className="text-2xl font-semibold mb-4">Estadísticas</h3>
                            {["fuerza", "destreza", "constitucion", "inteligencia", "sabiduria", "carisma"].map(
                                (stat) => (
                                    <div key={stat} className="mb-4">
                                        <label className="block capitalize">{stat}</label>
                                        <input
                                            type="number"
                                            name={stat}
                                            required
                                            min="8"
                                            value={formData[stat]}
                                            onChange={handleInputChange}
                                            className="w-full p-2 bg-[#291325] text-white rounded"
                                        />
                                    </div>
                                )
                            )}
                        </div>
                        <div>
                            <h3 className="text-2xl font-semibold mb-4">Habilidades y Competencias</h3>
                            <div className="grid grid-cols-2 gap-2">
                                {habilidades.map((hab) => (
                                    <label key={hab.nombre} className="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            name="competencias"
                                            value={hab.nombre}
                                            checked={formData.competencias.includes(hab.nombre)}
                                            onChange={handleInputChange}
                                        />
                                        <span>
                                            {hab.nombre} ({hab.stat.slice(0, 3).toUpperCase()})
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>
                    {/* Idiomas */}
                    <div className="mt-6">
                        <h3 className="text-xl font-semibold mb-2">Idiomas</h3>
                        <div className="grid grid-cols-3 gap-2">
                            {idiomasDisponibles.map((idioma) => (
                                <label key={idioma.id} className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        name="idiomas"
                                        value={idioma.id}
                                        checked={formData.idiomas.includes(idioma.id)}
                                        onChange={handleInputChange}
                                    />
                                    <span>{idioma.nombre}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                    {/* Botones */}
                    <div className="mt-6 flex space-x-4">
                        <button
                            type="submit"
                            className="bg-rose-600 hover:bg-rose-700 border-2 hover:ring cursor-pointer transition text-white px-4 py-2 rounded-lg"
                        >
                            Crear Personaje
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg cursor-pointer"
                        >
                            Cancelar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};