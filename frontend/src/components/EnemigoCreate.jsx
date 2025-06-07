import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { usePerfil } from "../context/PerfilContext";
import Swal from "sweetalert2";
import { LoadingComponent } from "./LoadingComponent";
import imagenDefault from "../assets/enemigos/default_enemigo.jpg"
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;


export const EnemigoCreate = () => {
  const { user, perfil } = usePerfil();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nombre: "",
    raza: "",
    dificultad: 1,
    puntaje: "",
    vitalidad_maxima: 20,
    bono_competencia: 2,
    xp: 0,
    armadura: 0,
    fuerza: 10,
    destreza: 10,
    constitucion: 10,
    inteligencia: 10,
    sabiduria: 10,
    carisma: 10,
    competencias: [],
    idiomas: [],
    imagen: null,
  });
  const [idiomasDisponibles, setIdiomasDisponibles] = useState([]);
  const [habilidades] = useState([
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
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Cargar idiomas disponibles
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
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.nombre || !formData.raza) {
      Swal.fire({ text: "Nombre y raza son obligatorios", icon: "error", theme: "dark" });
      return;
    }
    if (!formData.idiomas || formData.idiomas.length === 0) {
      Swal.fire({ text: "Debes seleccionar al menos un idioma", icon: "error", theme: "dark" });
      return;
    }

    setLoading(true);
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
      const response = await fetch(`${API_BASE_URL}/api/enemigos/crear/`, {
        method: "POST",
        headers: { Authorization: `Bearer ${user.accessToken}` },
        body: form,
      });
      if (!response.ok) {
        let errorMsg = "Error al crear el enemigo";
        try {
          const errorData = await response.json();
          errorMsg = JSON.stringify(errorData, null, 2);
        } catch {
          errorMsg = await response.text();
        }
        throw new Error(errorMsg);
      }
      const data = await response.json();
      Swal.fire({ text: "Enemigo creado correctamente", icon: "success", timer: 1500, showConfirmButton: false, theme: "dark" });
      navigate(`/enemigos/${data.id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!perfil || loading) return <LoadingComponent />;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="min-h-screen bg-[#571f3e] flex justify-center">
      <form onSubmit={handleSubmit} className="bg-[#752a53] text-white p-3 sm:p-6 rounded-b-4xl shadow-lg w-full lg:max-w-2/3">
        <h2 className="text-3xl font-bold mb-4">Crear Enemigo</h2>
        <div className="flex items-center space-x-4">
          <img
            src={
              formData.imagen
                ? URL.createObjectURL(formData.imagen)
                : imagenDefault
            }
            className="w-32 h-32 rounded-xl border-4 bg-gray-200 border-red-500 object-cover"
          />
          <div className="flex items-center space-x-4 mb-4">
            <div>
              <label className="block mb-2">Imagen</label>
              <input
                type="file"
                name="imagen"
                accept="image/*"
                onChange={handleInputChange}
                className="bg-[#291325] p-2 rounded-lg w-full"
              />
            </div>
          </div></div>
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
              <label className="block">Dificultad</label>
              <input
                type="number"
                name="dificultad"
                required
                value={formData.dificultad}
                onChange={handleInputChange}
                className="w-full p-2 bg-[#291325] text-white rounded"
              />
            </div>
            <div className="mb-4">
              <label className="block">Puntaje</label>
              <input
                type="text"
                name="puntaje"
                value={formData.puntaje}
                onChange={handleInputChange}
                className="w-full p-2 bg-[#291325] text-white rounded"
              />
            </div>
          </div>
          <div>
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
              <label className="block">XP obtenida al derrotar</label>
              <input
                type="number"
                name="xp"
                value={formData.xp}
                onChange={handleInputChange}
                className="w-full p-2 bg-[#291325] text-white rounded"
              />
            </div>
            <div className="mb-4">
              <label className="block">Armadura</label>
              <input
                type="number"
                name="armadura"
                required
                value={formData.armadura}
                onChange={handleInputChange}
                className="w-full p-2 bg-[#291325] text-white rounded"
              />
            </div>
          </div>
        </div>
        {/* Estadísticas */}
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
                    min="1"
                    value={formData[stat]}
                    onChange={handleInputChange}
                    className="w-full p-2 bg-[#291325] text-white rounded"
                  />
                </div>
              )
            )}
          </div>
          {/* Habilidades y competencias */}
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
        <div className="mt-6 flex justify-end space-x-4">
          <button
            type="submit"
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg cursor-pointer transition border-2 hover:ring"
          >
            Crear Enemigo
          </button>
          <button
            type="button"
            onClick={() => navigate("/enemigos/")}
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg cursor-pointer"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
};