import React, { useEffect, useState } from "react";
import { PerfilCardSmall } from "./PerfilCardSmall";
import '@fortawesome/fontawesome-free/css/all.min.css';
import { Link } from "react-router-dom";
import { usePerfil } from "../context/PerfilContext";
import { LoadingComponent } from "./LoadingComponent";
import { CampanaCard } from "./CampanaCard";
import { CampanaCreate } from "./CampanaCreate";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Apartado de campañas de un jugador, se muestran tanto las que ha creado como en las que está jugando
export const MisCampanas = () => {
    const { perfil, user } = usePerfil();

    const [campanas, setCampanas] = useState({ creadas: [], en_party: [] });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchCampanas = async () => {
        if (!perfil || !user) return;
        try {
            const response = await fetch(`${API_BASE_URL}/api/mis-campanas/${perfil.id}/`, {
                headers: {
                    Authorization: `Bearer ${user.accessToken}`, // Token de Django
                },
            });
            if (!response.ok) throw new Error("Error al cargar las campañas. Refresca la página.");
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
    }, [perfil, user]);

    const handleMostrarCrearModal = () => {
        setMostrarCrearModal(true);
    };

    if (!perfil || loading) return <LoadingComponent />;
    if (error) return <p>{error}</p>;

    return (
        <>
            <div className="p-5">
                <main>
                    <div>
                        <Link to={`/mis-campanas/crear/`}>
                            <button className="bg-emerald-600 border-2 border-white text-lg rounded-lg px-3 p-2 font-semibold text-white  transition cursor-pointer hover:ring-white hover:ring hover:bg-emerald-700"
                            >
                                <i className="fa-solid fa-plus"></i>{" "}Crear campaña
                            </button>
                        </Link>
                        <h1 className="text-2xl font-bold text-white mt-4"><i className="fa-solid fa-dungeon mr-2"></i>Mis Campañas</h1>

                    </div>

                    {/* Campañas como jugador */}
                    <div className="my-6 rounded-xl">
                        <h2 className="text-xl font-semibold mb-2 text-white">Como Jugador</h2>
                        {campanas.en_party.length === 0 ? (
                            <p className="text-gray-300">No estás participando en ninguna campaña como jugador.</p>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 p-1">
                                {campanas.en_party.map((campana) => (
                                    <CampanaCard key={campana.id} campana={campana} />
                                ))}
                            </div>
                        )}
                    </div>
                    {/* Campañas como DM */}
                    <div className="mb-10 rounded-xl">
                        <h2 className="text-xl font-semibold mb-2 text-white" >Como Dungeon Master</h2>
                        {campanas.creadas.length === 0 ? (
                            <p className="text-gray-300">No has creado ninguna campaña.</p>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 p-1">
                                {campanas.creadas.map((campana) => (
                                    <CampanaCard key={campana.id} campana={campana} />
                                ))}
                            </div>
                        )}
                    </div>


                </main>
            </div>
        </>
    );
};
