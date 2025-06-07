// CrearInvitacion.jsx
import { useState, useEffect } from "react";
import { usePerfil } from "../context/PerfilContext";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const FRONT_BASE_URL = import.meta.env.VITE_FRONT_BASE_URL;

// Se forma el enlace de invitación para la campaña
export const CrearInvitacion = ({ show, onClose, campanaId }) => {
    const { user, perfil } = usePerfil();
    const [codigo, setCodigo] = useState("Generando...");
    const [copiado, setCopiado] = useState(false);

    useEffect(() => {
        const crearInvitacion = async () => {
            const res = await fetch(`${API_BASE_URL}/api/campanas/${campanaId}/invitacion/`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${user.accessToken}`,
                },

            });
            const data = await res.json();
            setCodigo(`${FRONT_BASE_URL}/unirse/${data.codigo}`);
        };

        crearInvitacion();
    }, []);

    const copiarAlPortapapeles = () => {
        navigator.clipboard.writeText(codigo);
        setCopiado(true);
        setTimeout(() => {
            setCopiado(false);
        }, 5000);
    };

    return (
        show && (
            <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
                <div className="absolute inset-0" onClick={onClose}></div>
                <div className="fixed w-11/12 max-w-lg h-auto top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gray-900 p-6 shadow-lg rounded-xl text-center text-white">
                    <h2 className="text-xl font-bold mb-4">Invita a tus jugadores</h2>
                    <div className="mb-4 flex flex-col sm:flex-row items-center justify-center">
                        {copiado ? (
                            <>
                            <p className="mb-2 sm:mb-0 sm:mr-2 text-sm break-all ring rounded ring-gray-700 p-2 truncate">{codigo}</p>
                            <button
                                onClick={copiarAlPortapapeles}
                                className="text-white px-3 py-2 rounded bg-green-500 transition flex items-center cursor-pointer ring-green-600 ring-2"
                            >
                                <i className="fa-solid fa-check mr-2"></i> Copiado
                            </button>
                        </>
                        ) : (
                            <>
                                <p className="mb-2 sm:mb-0 sm:mr-2 text-sm break-all ring rounded ring-gray-700 p-2 truncate">{codigo}</p>
                                <button
                                    onClick={copiarAlPortapapeles}
                                    className="bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700 transition flex items-center cursor-pointer"
                                    title="Copiar al portapapeles"
                                >
                                    <i className="fa-solid fa-copy mr-2"></i> Copiar
                                </button>
                            </>
                        )}

                    </div>
                    <p className="text-gray-400 italic">Este código expirará en 1 día.</p>
                    <p onClick={onClose} className="text-gray-400 mt-6">
                        Pulsa fuera para cerrar
                    </p>
                </div>
            </div>
        )
    );
};
