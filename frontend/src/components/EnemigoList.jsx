import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { usePerfil } from '../context/PerfilContext';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { LoadingComponent } from './LoadingComponent';
import { useNavigate, Link } from 'react-router-dom';
import { PerfilCardSmall } from './PerfilCardSmall';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Lista de enemigos del apartado Archivo
export const EnemigoList = () => {
  const { perfil, user } = usePerfil();
  const [enemigos, setEnemigos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const [busquedaEnemigos, setBusquedaEnemigos] = useState("");

  // Obtención de enemigos de la app
  useEffect(() => {
    if (!perfil) return;
    const fetchEnemigos = async () => {
      try {
                const token = await user.getIdToken();
        const response = await axios.get(`${API_BASE_URL}/api/enemigos/`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setEnemigos(response.data);
        setLoading(false);
      } catch (error) {
        setLoading(false);
        setError("No se pudieron cargar los enemigos");
      }
    };

    fetchEnemigos();
  }, [perfil, user]);

  if (!perfil || loading) return <LoadingComponent />;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="p-4">
      <main>
        <p className="hover:underline cursor-pointer text-lg w-fit mb-2 text-white" onClick={() => navigate(`/archivo`)}>
          <i className="fa-solid fa-arrow-left" ></i>{" "}Volver a Archivo
        </p>
        <p className='font-semibold text-gray-900 w-fit p-1 rounded bg-amber-500 my-2'><i className='fa-solid fa-warning text-gray-900'></i> Como jugador, ten cuidado con los enemigos que miras. Es posible que aparezcan en tu campaña.</p>
        <Link to={`/enemigos/crear/`}>
          <button className="bg-red-600 border-2 border-white text-lg rounded-lg px-3 p-2 font-semibold text-white transition cursor-pointer hover:ring-white hover:ring hover:bg-red-700">
            <i className="fa-solid fa-plus"></i>{" "}Crear enemigo
          </button>
        </Link>

        <div className='my-6'>

          <h1 className="text-2xl font-bold text-white"><i className="fa-solid fa-dragon mr-2"></i>Enemigos</h1>

        </div>

        {/* Lista de enemigos */}
        {enemigos.length === 0 ? (
          <p className="text-gray-300">No hay enemigos en la base de datos.</p>
        ) : (<>
          <input
            type="text"
            placeholder="Buscar enemigos..."
            className="w-full max-w-100 mb-4 p-2 rounded bg-gray-700 border-2 border-gray-600 text-white"
            value={busquedaEnemigos}
            onChange={(e) => setBusquedaEnemigos(e.target.value)}
          />
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 p-1">

            {enemigos
              .filter((e) => e.nombre.toLowerCase().includes(busquedaEnemigos.toLowerCase()))
              .map((enemigo) => (
                <div
                  className="flex flex-col justify-between bg-[#4d1532] hover:bg-[#3b1026] px-4 pt-4 border rounded-xl shadow-lg shadow-black/30 min-h-full hover:scale-101 transition-all duration-100"
                >
                  <Link to={`/enemigos/${enemigo.id}`} key={enemigo.id}>
                    <div>
                      <img
                        src={`${API_BASE_URL}${enemigo.imagen}`}
                        className="w-full h-50 object-cover rounded-xl mb-2 border-5 bg-gray-200 border-red-500"
                      />

                      <h2 className="font-serif text-2xl font-semibold text-white">
                        {enemigo.nombre}
                      </h2>
                      <div className='text-gray-300'>
                        <p className='italic'>{enemigo.raza || "Criatura"}</p>
                        <p className='text-red-300'>Dificultad: {enemigo.dificultad || "?"}</p>
                      </div>

                    </div>
                  </Link>
                  <div className='mt-4'>
                    <p className='text-white'>
                      Creado por
                    </p>
                    <div className="mb-4">
                      <PerfilCardSmall perfil={enemigo.creador} />
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </>
        )}
      </main>
    </div>
  );
};
