import { useState, useEffect } from "react";
import { LoadingComponent } from "../components/LoadingComponent";
import { usePerfil } from "../context/PerfilContext";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Futura implementación del inventario de un personaje en el sidebar
export const SidebarPersonajeInventario = ({ personajeId, dungeonMaster }) => {
  const [items, setItems] = useState([]);
  const { perfil } = usePerfil();

  useEffect(() => {
    if (!personajeId) return;
    fetch(`${API_BASE_URL}/api/personajes/${personajeId}/inventario/`)
      .then((res) => res.json())
      .then((data) => setItems(data));
  }, [personajeId]);

  if (!perfil || !perfil.user) return;
  
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
};
