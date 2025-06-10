import { usePerfil } from "../context/PerfilContext";
import React, { useEffect, useState } from "react";
import { PerfilCardSmall } from "./PerfilCardSmall";
import '@fortawesome/fontawesome-free/css/all.min.css';
import { Link } from "react-router-dom";
import { LoadingComponent } from "./LoadingComponent";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

//! ANTIGUO COMPONENTE
//* Este componente se encarga de mostrar la lista de campañas disponibles
//* Dejado por motivos de debugging
export const CampanaList = () => {
  const [campanas, setCampanas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user, perfil } = usePerfil();

  const fetchCampanas = async () => {

    try {
      const token = await user.getIdToken();
      const response = await fetch(`${API_BASE_URL}/api/campanas/`, {
        headers: {
          Authorization: `Bearer ${token}`, // Token de Firebase
        },
      });
      if (!response.ok) throw new Error("Error al cargar las campañas");
      const data = await response.json();
      setCampanas(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampanas();
  }, [perfil, user, campanas]);

  if (loading) return <LoadingComponent />;
  if (error) return <p>{error}</p>;

  return (
    <div className="p-4">
      <main>
        <h1 className="text-2xl font-bold mb-4 ">Lista de Campañas</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 ">
          {campanas.map((campana) => (
            <div key={campana.id} className="flex flex-col justify-between bg-[#752a53] relative p-4 border rounded-xl shadow-xl shadow-black min-h-full">
              <div>
                <img
                  src={`${API_BASE_URL}${campana.imagen}`}
                  alt="Campaña"
                  className="w-full h-32 object-cover rounded-lg mb-2"
                />
                {/* Nombre de la campaña en una capa encima de la imagen */}
                <div className="absolute top-0 left-0 w-full h-32 flex items-center justify-center rounded-xl mt-4 ">
                  <h2 className="font-serif text-3xl font-semibold text-white text-center mx-4 flex justify-center items-center bg-black/30 h-32 rounded-lg w-full">
                    {campana.nombre}
                  </h2>
                </div>
                <p className="text-gray-600 line-clamp-3 mt-2 break-words">
                  {campana.descripcion_corta || "Sin información disponible"}
                </p>
              </div>
              <div className="flex flex-col justify-end">
                <div className="mt-2">
                  <p>Dungeon Master:</p>
                  <PerfilCardSmall
                    perfil={campana.dungeon_master}
                  />
                </div>
                <Link
                  to={`/campanas/${campana.id}`}
                  className="mt-4 inline-block bg-blue-500 text-white px-4 py-2 rounded-xl min-w-full text-center">
                  <i class="fa-solid fa-door-open"></i>
                  <i class="fa-solid fa-door-closed"></i>
                  Entrar
                </Link>
              </div>

            </div>
          ))}
        </div>
      </main>
    </div>
  );
};