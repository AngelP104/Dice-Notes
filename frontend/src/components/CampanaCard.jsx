import { Link } from "react-router-dom";
import { PerfilCardSmall } from "./PerfilCardSmall";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Card de campaña
export const CampanaCard = ({ campana }) => {
    return (
        <div key={campana.id} className="flex flex-col justify-between bg-[#752a53] relative p-4 border rounded-xl shadow-lg shadow-black/30 min-h-full hover:scale-101 transition-all duration-100">
            <div>
                <img
                    src={`${API_BASE_URL}${campana.imagen}`}
                    className="w-full h-32 object-cover rounded-lg mb-2"
                />
                <div className="absolute top-0 left-0 w-full h-32 flex items-center justify-center rounded-xl mt-4">
                    <h2 className="font-serif text-3xl font-semibold text-white text-center mx-4 flex justify-center items-center bg-black/30 h-32 rounded-lg w-full select-none">
                        {campana.nombre}
                    </h2>
                </div>
                <p className="text-gray-300 line-clamp-3 mt-2 break-words">
                    {campana.descripcion_corta || "Sin información disponible"}
                </p>
            </div>
            <div className="flex flex-col justify-end">
                <div className="mt-2">
                    <p className="text-white">Dungeon Master</p>
                    <PerfilCardSmall perfil={campana.dungeon_master} />
                </div>
                <Link
                    to={`/campanas/${campana.id}`}
                    className="mt-4 text-lg inline-block bg-emerald-500 hover:bg-emerald-600 transition text-white font-semibold py-3 rounded-xl min-w-full text-center"
                >
                    <i className="fa-solid fa-door-open mr-2"></i>
                    Entrar
                </Link>
            </div>
        </div>
    );
};
