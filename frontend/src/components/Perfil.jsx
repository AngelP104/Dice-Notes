import { useState, useEffect } from "react";
import { usePerfil } from "../context/PerfilContext";
import { useParams } from "react-router-dom";
import { LoadingComponent } from "./LoadingComponent";
import { CampanaCard } from "./CampanaCard";
import { Link } from "react-router-dom";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;


export const Perfil = () => {
    const { perfilUser } = useParams();
    const [editarPerfil, setEditarPerfil] = useState(false);
    const [error, setError] = useState(null);
    const [loadingProfile, setLoadingProfile] = useState(true);
    const [perfilVisionado, setPerfilVisionado] = useState(null);
    const [infoPerfil, setInfoPerfil] = useState(null);
    const [campanasCreadas, setCampanasCreadas] = useState(null)
    const [campanasEnParty, setCampanasEnParty] = useState(null)
    const [personajes, setPersonajes] = useState()

    const { user, perfil, setPerfil } = usePerfil();

    const [updatePerfil, setUpdatePerfil] = useState({
        apodo: "",
        biografia: "",
        avatar: null,
    });

    // Traer el perfil desde el backend con el id del usuario del perfil asociado
    const fetchPerfil = async () => {

        try {
            const response = await fetch(`${API_BASE_URL}/api/perfil/${perfilUser}/`, {
                headers: {
                    Authorization: `Bearer ${user.accessToken}`,
                },
            });
            if (!response.ok) throw new Error("No se pudo obtener el perfil");
            const data = await response.json();
            setPerfilVisionado(data);
            console.log("Data perfil", data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoadingProfile(false);
        }
    };

    const fetchInfoPerfil = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/perfil/${perfilUser}/info/`, {
                headers: {
                    Authorization: `Bearer ${user.accessToken}`,
                },

            })
            if (!response.ok) throw new Error("No se pudo obtener el perfil");
            const data = await response.json();
            setInfoPerfil(data);
            setCampanasCreadas(data.creadas)
            setCampanasEnParty(data.en_party)
            setPersonajes(data.personajes)
            console.log("INFO perfil", data);
        } catch (err) {
            setError(err.message);
        }
    }
    useEffect(() => {
        fetchPerfil();
    }, [perfilUser]);

    useEffect(() => {
        fetchInfoPerfil();
    }, [])

    // Setear el formulario una vez que perfilVisionado se cargue
    useEffect(() => {
        if (perfilVisionado) {
            setUpdatePerfil({
                apodo: perfilVisionado.apodo || "",
                biografia: perfilVisionado.biografia || "",
                avatar: null,
            });
        }
    }, [perfilVisionado]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append("apodo", updatePerfil.apodo);
        formData.append("biografia", updatePerfil.biografia);

        if (updatePerfil.avatar instanceof File) {
            formData.append("avatar", updatePerfil.avatar);
        }

        try {
            const response = await fetch(`${API_BASE_URL}/api/perfil/${perfilUser}/`, {
                method: "PATCH",
                headers: {
                    Authorization: `Bearer ${user.accessToken}`,
                },
                body: formData,
            });

            if (!response.ok) throw new Error("Error al actualizar el perfil");

            const data = await response.json();
            await fetchPerfil();
            setEditarPerfil(false);

        } catch (err) {
            setError(err.message);
        }
    };

    if (loadingProfile || campanasCreadas === null || campanasEnParty === null || personajes === null) {
        return <LoadingComponent />;
    }





    return (
        <div className="min-h-screen bg-[#571f3e] flex justify-center">
            <div className="bg-[#752a53] text-white p-3 sm:p-6 rounded-b-4xl shadow-lg w-full">
                {!editarPerfil ? (
                    <div className="">
                        <div className="bg-[#833961] p-4 rounded-xl">

                        <div className="lg:flex lg:items-center space-x-4 ">
                            <img
                                src={perfilVisionado?.avatar}
                                className="w-28 h-28 rounded-full border-4 object-center bg-gray-200 object-cover"
                            />
                            <div>
                                <h2 className="text-4xl mt-4 font-bold">{perfilVisionado?.apodo}</h2>
                            </div>
                        </div>
                        <div className="mt-6 lg:w-1/2">
                            <h3 className="text-xl font-semibold">Biografía</h3>
                            <p className="text-gray-200 mt-2  bg-[#92416e] p-2 rounded-lg border-2 border-[#63304c]">
                                {perfilVisionado?.biografia || "Sin biografía disponible"}
                            </p>
                        </div>
                        <div>
                            </div>

                            {perfil?.id === perfilVisionado?.user && (
                                <button
                                    onClick={() => setEditarPerfil(true)}
                                    className="mt-4 bg-[#461831] hover:bg-[#571f3e] text-white px-4 py-2 rounded-lg transition duration-200 cursor-pointer"
                                >
                                    Editar Perfil
                                </button>
                            )}
                        </div>


                        {/* Informacion del jugador */}
                        <div className=" bg-gray-800/30 rounded-xl border-2 border-gray-700 p-4 mt-20">
                            <h2 className="font-semibold text-xl underline mb-6">Información del jugador</h2>

                            <div className="mb-10">

                                <h2 className="text-xl font-semibold text-white" >Personajes creados</h2>

                                {personajes.length === 0 ? (
                                    <p className="text-gray-300">Este usuario no tiene personajes creados.</p>
                                ) : (

                                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 p-1 mt-2">
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
                            </div>


                            {/* Campañas como jugador */}
                            <div className="mb-10 rounded-xl">
                                <h2 className="text-xl font-semibold mb-2 text-white">Campañas como Jugador</h2>
                                {campanasEnParty.length === 0 ? (
                                    <p className="text-gray-300">Este usuario no participa en ninguna campaña como jugador.</p>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 p-1">
                                        {campanasEnParty.map((campana) => (
                                            <CampanaCard key={campana.id} campana={campana} />
                                        ))}
                                    </div>
                                )}
                            </div>
                            {/* Campañas como DM */}
                            <div className="mt-6 rounded-xl">
                                <h2 className="text-xl font-semibold mb-2 text-white" >Campañas como Dungeon Master</h2>
                                {campanasCreadas.length === 0 ? (
                                    <p className="text-gray-300">Este usuario no ha creado ninguna campaña.</p>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 p-1">
                                        {campanasCreadas.map((campana) => (
                                            <CampanaCard key={campana.id} campana={campana} />
                                        ))}
                                    </div>
                                )}
                            </div>
                            
                        </div>
                    </div>



                ) : (



                    // Formulario edición
                    <div>
                        <h2 className="text-2xl font-bold mb-4">Editar Perfil</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <h2 className="block text-sm font-medium">Foto de perfil</h2>
                                <img
                                    src={perfilVisionado?.avatar}
                                    alt="Avatar"
                                    className="w-24 h-24 rounded-full border-4 border-white bg-gray-200"
                                />
                                <div className="mt-2">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="w-fit mt-1 p-2 border border-gray-300 rounded-lg bg-[#291325] text-white"
                                        onChange={(e) => {
                                            const file = e.target.files[0];
                                            if (file) {
                                                setUpdatePerfil((prevPerfil) => ({
                                                    ...prevPerfil,
                                                    avatar: file,
                                                }));
                                            }
                                        }}
                                    />
                                </div>
                            </div>
                            <div className="mb-4">
                                <label htmlFor="apodo" className="block text-sm font-medium">
                                    Apodo
                                </label>
                                <input
                                    type="text"
                                    id="apodo"
                                    value={updatePerfil.apodo}
                                    className="w-full mt-1 p-2 border border-gray-300 rounded-lg bg-[#291325] text-white"
                                    maxLength="100"
                                    onChange={(e) =>
                                        setUpdatePerfil((prevPerfil) => ({
                                            ...prevPerfil,
                                            apodo: e.target.value,
                                        }))
                                    }
                                />
                            </div>
                            <div className="mb-4">
                                <label htmlFor="biografia" className="block text-sm font-medium">
                                    Biografía
                                </label>
                                <textarea
                                    id="biografia"
                                    value={updatePerfil.biografia}
                                    className="w-full min-h-50 mt-1 p-2 border border-gray-300 rounded-lg bg-[#291325] text-white resize-none"
                                    rows="4"
                                    maxLength="500"
                                    onChange={(e) =>
                                        setUpdatePerfil((prevPerfil) => ({
                                            ...prevPerfil,
                                            biografia: e.target.value,
                                        }))
                                    }
                                ></textarea>
                            </div>
                            <div className="flex space-x-4">
                                <button
                                    type="submit"
                                    className="bg-[#461831] hover:bg-[#571f3e] text-white px-4 py-2 rounded-lg transition duration-200 cursor-pointer"
                                >
                                    Guardar Cambios
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setEditarPerfil(false)}
                                    className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition duration-200 cursor-pointer"
                                >
                                    Cancelar
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
};
