import { useState, useEffect } from "react";
import { SidebarPersonajeEstadisticas } from "../layouts/SidebarPersonajeEstadisticas";
import { SidebarPersonajeInventario } from "../layouts/SidebarPersonajeInventario";
import { SidebarPersonajeNotas } from "../layouts/SidebarPersonajeNotas";
import { usePerfil } from "../context/PerfilContext";
import { LoadingComponent } from "../components/LoadingComponent";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;



export const SidebarPersonaje = ({ personajeId, dungeonMaster, selectedPersonaje }) => {

    const tabs = [
        { id: "estadisticas", label: "Estadísticas", icon: "fa-solid fa-book" },
        //{ id: "inventario", label: "Inventario", icon: "fa-solid fa-sack-xmark" },
        { id: "notas", label: "Notas", icon: "fa-solid fa-note-sticky" },
    ];

    const { perfil, user } = usePerfil();
    const [personaje, setPersonaje] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState("estadisticas");

    // De aqui se obtiene el personaje para cada tab
    const fetchPersonaje = async () => {
        if (!personajeId) return;
        try {
                const token = await user.getIdToken();
            const response = await fetch(`${API_BASE_URL}/api/personajes/${personajeId}/`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (!response.ok) throw new Error("No se pudo obtener el personaje");
            const data = await response.json();
            setPersonaje(data);
            console.log(data)


        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPersonaje();
    }, [selectedPersonaje]);


    return (
        <>
            {/* Panel del personaje con tabs arriba */}
            <div className="flex h-full w-[258px] flex-col bg-[#2a1a24]/60 border-white shadow-lg text-white">

                {/* Tabs horizontales arriba */}
                <div className="flex border-b-2 border-white bg-[#361826]/70">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex-1 py-2 flex items-center justify-center text-sm font-semibold text-white transition ${activeTab === tab.id ? "bg-emerald-700/70 border-white" : "hover:bg-[#571f3e] cursor-pointer"}`}
                        >
                            <i className={`${tab.icon} mr-2`}></i>
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Contenido del personaje según tab */}
                <div className="p-2 overflow-y-auto overscroll-contain flex-1">
                    {activeTab === "estadisticas" && (
                        <SidebarPersonajeEstadisticas personaje={personaje} setPersonaje={setPersonaje} dungeonMaster={dungeonMaster} />
                    )}
                    {activeTab === "inventario" && (
                        <SidebarPersonajeInventario personaje={personaje} dungeonMaster={dungeonMaster} />
                    )}
                    {activeTab === "notas" && (
                        <SidebarPersonajeNotas personaje={personaje} dungeonMaster={dungeonMaster} />
                    )}
                </div>
            </div>
        </>
    )
}
