import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { usePerfil } from '../context/PerfilContext';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { LoadingComponent } from './LoadingComponent';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { VitalidadPersonaje } from './VitalidadPersonaje';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Apartado de Personajes de un perfil de un usuario
export const MisPersonajes = () => {
    const { perfil, user } = usePerfil();

    const [personajes, setPersonajes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPersonajes = async () => {
            try {
                const token = await user.getIdToken();
                const response = await axios.get(`${API_BASE_URL}/api/mis-personajes/${perfil.id}/`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                setPersonajes(response.data);
                setLoading(false);
                console.log(personajes)
            } catch (error) {
                setLoading(false);
            }
        };

        fetchPersonajes();
    }, [perfil]);

    if (loading || !perfil) return <LoadingComponent />;

    return (
        <div className="p-5">
            <main>
                <Link to={`/mis-personajes/crear/`}>
                    <button className="bg-rose-500 border-2 border-white text-lg rounded-lg px-3 p-2 font-semibold text-white  transition cursor-pointer hover:ring-white hover:ring hover:bg-rose-600"
                    >
                        <i className="fa-solid fa-plus"></i>{" "}Crear personaje
                    </button>
                </Link>
                <h1 className="text-2xl font-bold my-6 text-white"><i className="fa-solid fa-user-alt mr-2"></i>Mis Personajes</h1>

                {personajes.length === 0 ? (
                    <p className="text-gray-300">No tienes personajes creados.</p>
                ) : (

                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 p-1">
                        {personajes.map((personaje) => (
                            <Link to={`/personajes/${personaje.id}`}>
                                <div
                                    key={personaje.id}
                                    className="flex flex-col justify-between bg-[#752a53] hover:bg-[#833961] p-4 border rounded-xl shadow-lg shadow-black/30 min-h-full hover:scale-101 transition-all duration-100"
                                >
                                    <div>
                                        {/* Imagen de personaje si la tienes, aquí va ejemplo estático */}
                                        <img
                                            src={`${API_BASE_URL}${personaje.imagen}`}
                                            className="w-full h-50 object-cover rounded-xl mb-2 border-5 bg-gray-200"
                                            style={{
                                                borderColor: personaje.color_token
                                            }}
                                        />
                                        <h2 className="font-serif text-2xl font-semibold text-white">
                                            {personaje.nombre}
                                        </h2>
                                        <div className='text-gray-300'>
                                            <p className='italic'>
                                                {personaje.clase}  {personaje.subclase ? `/ ${personaje.subclase}` : ""}
                                            </p>
                                            <p>
                                                {personaje.raza}
                                            </p>
                                            <p>
                                                Nivel {personaje.nivel}
                                            </p>
                                        </div>

                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};
