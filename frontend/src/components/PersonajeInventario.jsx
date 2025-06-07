import { usePerfil } from "../context/PerfilContext";
import { useState, useEffect } from "react";
import { LoadingComponent } from "./LoadingComponent";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;


export const PersonajeInventario = ({ personajeId }) => {

  const [items, setItems] = useState([]);

  useEffect(() => {
    if (!personajeId) return;
    fetch(`${API_BASE_URL}/api/personajes/${personajeId}/inventario/`)
      .then((res) => res.json())
      .then((data) => setItems(data));
  }
    , [personajeId]);
  if (!items) return <LoadingComponent />;
  if (items.length === 0) return <p className="text-center text-gray-500">No hay items en el inventario</p>;
  return (
    <div className="grid grid-cols-2 gap-2">
      {items.map((item) => (
        <div key={item.id} className="p-2 bg-gray-700 rounded">
          <img src={item.imagen} alt={item.nombre} className="w-10 h-10 object-cover" />
          <p>{item.nombre}</p>
          <p>Cantidad: {item.cantidad}</p>
          {item.equipado && <span className="text-green-400 text-sm">Equipado</span>}
        </div>
      ))}
    </div>
  );
}
