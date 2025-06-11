import { useState, useEffect } from 'react';
import { usePerfil } from '../context/PerfilContext';
import axios from 'axios';
import { PersonajeInventario } from '../components/PersonajeInventario';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;


import '@fortawesome/fontawesome-free/css/all.min.css';
import { SidebarPersonaje } from './SidebarPersonaje';
import { LoadingComponent } from '../components/LoadingComponent';

export const SidebarParty = ({ campanaId, dungeonMaster }) => {
  const { perfil, user } = usePerfil();
  const [party, setParty] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPersonaje, setSelectedPersonaje] = useState(null);
  const [showSidebarParty, setShowSidebarParty] = useState(false);



  useEffect(() => {
    if (!perfil || !perfil.id) return;
    const fetchPersonajes = async () => {
      try {
                const token = await user.getIdToken();
        const response = await fetch(`${API_BASE_URL}/api/campanas/${campanaId}/party/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        setParty(data);
        //console.log("Party data:", data);
      } catch (error) {
        setLoading(false);
        console.error("Error cargando los personajes:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPersonajes();
  }, [campanaId, perfil]);

  // Seleccionar o deseleccionar personaje
  const handlePersonajeClick = (personaje) => {
    if (selectedPersonaje?.id === personaje.id) {
      setSelectedPersonaje(null);
    } else {
      setSelectedPersonaje(personaje);
    }
  };

  return (
    <>
      {!showSidebarParty && (
        <div
          className="fixed bottom-4 left-0 z-50 flex justify-center items-center bg-emerald-600/50 h-16 w-16 shadow-lg border-4 border-white/50 hover:border-white rounded-r-xl cursor-pointer hover:bg-emerald-700 transition duration-200"
          onClick={() => setShowSidebarParty(true)}
        >
          <i className="fa-solid fa-users text-2xl text-white"></i>
        </div>
      )}

      {showSidebarParty && (
        <div className="fixed top-0 left-0 h-screen z-50 flex overscroll-contain">

          <div className="select-none w-16 bg-[#361826]/90 border-r-4 border-white shadow-lg flex flex-col justify-between">

            {/* Contenedor superior con título + íconos */}
            <div className="flex flex-col items-center">
              <p className='p-2 font-semibold text-xl text-white underline text-center'>PJs</p>
              <div className='py-4 space-y-3 overflow-y-auto max-h-[calc(100vh-8rem)]'>
                {loading ? (
                  <LoadingComponent/>
                ) : (
                  party.map((p) =>
                    p.personaje ? (
                      <div
                        key={p.id}
                        className={`w-14 h-14 cursor-pointer overflow-hidden flex items-center justify-center transition-all`}
                        onClick={() => { handlePersonajeClick(p.personaje) }}
                      >
                        <img
                          src={`${API_BASE_URL}${p.personaje.imagen}`}
                          alt={p.personaje.nombre}
                          className={`w-full h-full border-4 object-cover rounded-lg bg-gray-200 transition duration-80 ${selectedPersonaje?.id === p.personaje.id
                            ? 'ring-3 ring-yellow-300 scale-90'
                            : ''
                            }`}
                          style={{ borderColor: p.personaje.color_token }}
                        />
                      </div>
                    ) : null
                  )
                )}
              </div>
            </div>

            {/* Contenedor inferior con botón de cerrar */}
            <div
              className="w-full h-16 flex justify-center items-center border-white border-t-4 cursor-pointer p-3 hover:bg-emerald-700 transition"
              onClick={() => {
                setShowSidebarParty(false);
              }}
            >
              <i className="fa-solid fa-xmark-square text-white text-3xl"></i>
            </div>

          </div>

          {/* Panel del personaje con tabs arriba */}
          {selectedPersonaje && (
            <div className="flex h-full w-[260px] flex-col bg-[#2a1a24]/70 border-r-2 border-white shadow-lg text-white overflow-y-auto">
              <SidebarPersonaje personajeId={selectedPersonaje.id} dungeonMaster={dungeonMaster} selectedPersonaje={selectedPersonaje}/>
            </div>
          )}
        </div>
      )}
    </>
  );
};
