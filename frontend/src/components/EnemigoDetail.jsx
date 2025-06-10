import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { usePerfil } from "../context/PerfilContext";
import { LoadingComponent } from "./LoadingComponent";
import Swal from "sweetalert2";
import { NotaList } from "./NotaList";
import { ScrollToTop } from "./ScrollToTop";
import { PerfilCardSmall } from "./PerfilCardSmall";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Pantalla de detalle de un enemigo
export const EnemigoDetail = () => {
  const { id } = useParams();
  const { user, perfil } = usePerfil();
  const navigate = useNavigate();

  const [enemigo, setEnemigo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editar, setEditar] = useState(false);
  const [formData, setFormData] = useState(null);
  const [error, setError] = useState(null);
  const [idiomasDisponibles, setIdiomasDisponibles] = useState([]);
  //Alineamientos no usados
  //const [alineamientos, setAlineamientos] = useState([]);


  // Habilidades y sus estadísticas asociadas
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

  // Son estáticos
  /*
  const ALINEAMIENTOS = [
    { value: "legal_bueno", label: "Legal bueno" },
    { value: "neutral_bueno", label: "Neutral bueno" },
    { value: "caotico_bueno", label: "Caótico bueno" },
    { value: "legal_neutral", label: "Legal neutral" },
    { value: "neutral", label: "Neutral" },
    { value: "caotico_neutral", label: "Caótico neutral" },
    { value: "legal_malvado", label: "Legal malvado" },
    { value: "neutral_malvado", label: "Neutral malvado" },
    { value: "caotico_malvado", label: "Caótico malvado" },
  ];*/


  // Función para calcular el modificador de una estadística
  const calcularModificador = (valor) => Math.floor((valor - 10) / 2);

  // Obtenemos los idiomas disponibles en la base de datos
  const fetchIdiomas = async () => {
    try {
                const token = await user.getIdToken();
      const response = await fetch(`${API_BASE_URL}/api/idiomas/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error("No se pudieron obtener los idiomas");
      const data = await response.json();
      setIdiomasDisponibles(data);
      console.log("idiomas", data)
    } catch (err) {
      setError(err.message);
    }
  };

  // Obtenemos los datos del enemigo
  const fetchEnemigo = async () => {
    try {
                const token = await user.getIdToken();
      const response = await fetch(`${API_BASE_URL}/api/enemigos/${id}/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error("No se pudo obtener el enemigo");
      const data = await response.json();
      setEnemigo(data);
      console.log(data)
      setFormData({
        ...data,
        imagen: null,
        competencias: data.competencias || [],
        idiomas: data.idiomas.map((idioma) => idioma.id),
      });

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIdiomas();
    fetchEnemigo();
  }, [id]);

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
      //} else if (name === "alineamiento") {
      //  setFormData(prev => ({ ...prev, alineamiento: value ? parseInt(value) : null }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.idiomas || formData.idiomas.length === 0) {
      Swal.fire({
        text: "Debes seleccionar al menos un idioma",
        theme: "dark",
        showConfirmButton: false,
        icon: "error"

      })
      return;
    }

    if (formData.vitalidad_maxima < formData.vitalidad_actual) {
      Swal.fire({
        text: "La vida actual no puede ser mayor que la máxima",
        theme: "dark",
        showConfirmButton: false,
        icon: "error"

      })
      return;
    }
    const form = new FormData();
    for (const key in formData) {
      // Validación de la imagen
      if (key === "imagen" && formData.imagen instanceof File) {
        const file = formData.imagen;
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
    
        form.append("imagen", file);
      } else if (key === "idiomas") {
        formData.idiomas.forEach(idiomaId => form.append("idiomas_ids", idiomaId));
        //} 
        //else if (key === "alineamiento" && formData.alineamiento) {
        //  form.append("alineamiento", Number(formData.alineamiento)); //? ID
      } else if (key === "competencias") {
        form.append("competencias", JSON.stringify(formData[key]));
      } else if (formData[key] !== null && formData[key] !== undefined) {
        form.append(key, formData[key]);
      }
    }

    try {
                const token = await user.getIdToken();
      const response = await fetch(`${API_BASE_URL}/api/enemigos/${id}/`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: form,
      });
      if (!response.ok) {
        let errorMsg = "Error al actualizar el enemigo";
        try {
          const errorData = await response.json();
          errorMsg = JSON.stringify(errorData, null, 2);
        } catch {
          errorMsg = await response.text();
        }
        throw new Error(errorMsg);
      }
      const data = await response.json();
      setEnemigo(data);
      setEditar(false);
      <ScrollToTop />
    } catch (err) {
      setError(err.message);
    };

  }



  const handleDelete = async () => {
    const { isConfirmed } = await Swal.fire({
      title: "¿Estás seguro?",
      text: "Esta acción eliminará el enemigo PERMANENTEMENTE y toda su información asociada.",
      icon: "warning",
      iconColor: "#d33",
      showCancelButton: true,
      confirmButtonText: "Sí, ELIMINAR",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#d33",
      cancelButtonColor: "#555",
      theme: "dark",
    });

    if (!isConfirmed) return;            // usuario canceló

    try {
                const token = await user.getIdToken();
      const res = await fetch(
        `${API_BASE_URL}/api/enemigos/${id}/`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) {
        throw new Error("No se pudo eliminar el enemigo");
      }

      await Swal.fire({
        icon: "success",
        title: "Eliminado",
        text: "El enemigo ha sido eliminado.",
        timer: 2000,
        showConfirmButton: false,
        theme: "dark",
        timerProgressBar: true,
      });

      // Ahora sí redirigimos
      navigate("/enemigos/");
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.message || "Hubo un problema al eliminar el enemigo",
        theme: "dark",
      });
    }
  };


  if (loading || !perfil) return <LoadingComponent />;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="min-h-screen bg-[#571f3e] flex justify-center">
      <div className="bg-[#752a53] text-white p-3 sm:p-6 rounded-b-xl shadow-lg w-full lg:max-w-2/3">
        {!editar ? (
          <div>
            <p className="hover:underline cursor-pointer text-lg w-fit mb-2" onClick={() => navigate(`/enemigos`)}>
              <i className="fa-solid fa-arrow-left" ></i>{" "}Volver a la lista de enemigos
            </p>
            {perfil.id === enemigo.creador.user ? (
              <>
                <button
                  onClick={() => setEditar(true)}
                  className="mb-3 bg-[#461831] hover:bg-[#571f3e] text-white px-4 py-2 rounded-lg transition duration-200 cursor-pointer"
                >
                  Editar Enemigo
                </button>
              </>
            ) : (
              <div>

                <p>
                  Creado por
                </p>
                <div className="mb-6 w-fit">
                  <PerfilCardSmall perfil={enemigo.creador} />
                </div>

              </div>
            )}
            <div className="flex items-center space-x-4">
              <img
                src={enemigo.imagen}
                alt="Personaje"
                className="w-32 h-32 object-cover rounded-xl border-4 border-red-500 bg-gray-200"
              />

              <div>
                <h2 className="text-4xl font-bold font-serif">{enemigo.nombre}</h2>
                <div className="text-lg">
                  <p className="font-semibold text-red-400">
                    Dificultad: {enemigo.dificultad}
                  </p>
                  <p className="text-lime-400 font-semibold">
                    XP: {enemigo.xp}
                  </p>
                  <p>
                    {enemigo.raza}
                  </p>
                  <p className="text-gray-300 italic">
                    {enemigo.clase} {enemigo.subclase && `/ ${enemigo.subclase}`}
                  </p>

                </div>
                {/* 
                    // PARA FUTURA ACTUALIZACIÓN
                    <p className="text-sm text-gray-300">
                      Alineamiento: {enemigo?.alineamiento.nombre || "No especificado"}
                    </p>
                      */}
              </div>




            </div>

            {/* Otra Información */}
            <div className="mt-2">
              <p>
                <strong>Armadura:</strong> {enemigo.armadura}
              </p>
              <p>
                <strong>Idiomas:</strong>{" "}
                {idiomasDisponibles
                  .filter(idioma =>
                    enemigo.idiomas.some(idiomaPers => idiomaPers.id === idioma.id)
                  )
                  .map(idioma => idioma.nombre)
                  .join(", ")
                }
              </p>
              <p>
              <strong>Puntaje: </strong><span>{enemigo.puntaje}</span>
              </p>
              <p>
                <strong>Bono de competencia: </strong><span className="text-yellow-400 font-bold">{enemigo.bono_competencia}</span>
              </p>
            </div>

            <div className="mt-6 flex gap-6">
              {/* Estadísticas base */}
              <div>
                <h3 className="text-2xl not-md:text-lg font-semibold mb-2">Estadísticas</h3>
                <div className="space-y-2">
                  {["fuerza", "destreza", "constitucion", "inteligencia", "sabiduria", "carisma"].map(
                    (stat) => (
                      <div key={stat} className="flex flex-col align-items justify-center rounded-lg border-gray-400 border-2 text-center bg-amber-100 text-black w-full h-24 shadow-lg shadow-gray-900">
                        <p className="capitalize font-semibold">{stat}</p>
                        <div>
                          <p className="text-3xl font-semibold">
                            {enemigo[stat]}
                          </p>
                          <p className="text-gray-600 font-semibold">

                            ({calcularModificador(enemigo[stat]) >= 0 ? "+" : ""}
                            {calcularModificador(enemigo[stat])})
                          </p>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>

              {/* Habilidades derivadas */}
              <div className="w-full h-full">
                <h3 className="text-2xl not-md:text-lg font-semibold mb-2">Habilidades</h3>
                <div className="border-2 border-gray-500 rounded-xl px-1">
                  {habilidades.map((hab) => {
                    const esCompetente = enemigo.competencias?.includes(hab.nombre);
                    const mod = calcularModificador(enemigo[hab.stat]);
                    const bono = esCompetente ? enemigo.bono_competencia || 0 : 0;
                    return (
                      <div key={hab.nombre} className={`flex justify-between ${esCompetente ? "text-emerald-400 font-bold" : ""} not-md:text-sm border-y-1 border-gray-500 py-1`}>
                        <div className="flex">
                          {hab.nombre} ({hab.stat.slice(0, 3).toUpperCase()})
                          {esCompetente && (
                            <p className="ml-1 text-yellow-400">
                              <i className="fa-solid fa-star"></i>
                            </p>
                          )}
                        </div>
                        <span className="w-fit">
                          {mod + bono}{" "}
                          <span className="text-gray-400 text-sm">
                            ({mod >= 0 ? "+" : ""}{mod}
                            {esCompetente && (
                              <span className="text-yellow-500"> +{enemigo.bono_competencia || 0}</span>
                            )})
                          </span>
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
            {perfil.id === enemigo.creador.user && (
              <div>
            <p className="font-semibold underline text-lg mt-6">Tus notas privadas sobre el enemigo</p>
              <NotaList model="enemigo" objectId={id} dungeonMaster={""} />
              </div>
            )}



          </div>

        ) : (

          // FORMULARIO DE EDICIÓN

          <form onSubmit={handleSubmit}>
            <div className="flex items-center space-x-4">
              <img
                src={enemigo.imagen}
                alt="Personaje"
                className="w-32 h-32 rounded-xl border-4 bg-gray-200 object-cover border-red-500"
                style={{ borderColor: formData.color_token }}
              />
              <div>
                <label className="block mb-2">Cambiar Imagen</label>
                <input
                  type="file"
                  name="imagen"
                  accept="image/png, image/jpeg, image/jpg"
                  onChange={handleInputChange}
                  className="bg-[#291325] p-2 rounded-lg w-full"
                />
              </div>

              {/* 
                  //Alineamiento no implementado
                  <div>
                    <select
                      name="alineamiento"
                      defaultValue={formData.alineamiento || ""}
                      onChange={handleInputChange}
                      className="w-full p-2 bg-[#291325] text-white rounded"
                    >
                      {ALINEAMIENTOS.map(al => (
                        <option key={al.value} value={al.value}>{al.label}</option>
                      ))}
                    </select>
                  </div>
                     */}
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
                    value={formData.puntaje || 0}
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
                    value={formData.bono_competencia || 0}
                    onChange={handleInputChange}
                    className="w-full p-2 bg-[#291325] text-white rounded"
                  />
                </div>
                <div className="mb-4">
                  <label className="block">XP</label>
                  <input
                    type="number"
                    name="xp"
                    value={formData.xp || ""}
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
            {/* Sección de estadísticas y habilidades */}
            <div className="mt-6 grid md:grid-cols-2 gap-6">
              {/* Estadísticas base */}
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

              {/* Habilidades con competencias */}
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
            <div className="mt-6 flex justify-between space-x-4">
              <div className="flex justify-between space-x-4">
                <button
                  type="submit"
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg cursor-pointer transition border-2 hover:ring"
                >
                  Guardar Cambios
                </button>
                <button
                  type="button"
                  onClick={() => setEditar(false)}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg cursor-pointer"
                >
                  Cancelar
                </button>
              </div>
              <button
                type="button"
                className="bg-red-800 text-white font-bold px-4 py-2 rounded-lg hover:bg-red-900 w-fit transition border-2 hover:ring cursor-pointer"
                onClick={handleDelete}
              >
                <i className="fa-solid fa-trash-can"></i>{" "}Eliminar
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};