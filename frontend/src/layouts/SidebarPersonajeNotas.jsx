import { useState, useEffect } from 'react';
import { NotaList } from '../components/NotaList';
import { usePerfil } from '../context/PerfilContext';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Simplemente una implementación de las notas en la barra lateral
export const SidebarPersonajeNotas = ({ personaje, dungeonMaster }) => {
  const { perfil } = usePerfil();

  return (
    <>
      {perfil.id === personaje.creador.user || perfil.id === dungeonMaster.user ? (
        <>
        <p className='font-semibold underline'>
        Notas de {personaje.nombre}
        </p>
        <NotaList model="personaje" objectId={personaje.id} />
        </>
      ) : (
        <>
        <div className='flex flex-col font-semibold text-center text-black bg-amber-500 m-2 p-3 rounded-lg border-2 border-gray-700'>
          <i className='fa-sharp fa-do-not-enter'></i>
          <p className='mt-2'>
            Sólo el DM y el propietario pueden leer estas notas.
          </p>
        </div>
        </>
      )}
    </>
  )
}
