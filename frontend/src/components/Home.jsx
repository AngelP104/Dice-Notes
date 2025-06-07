import { signOut } from "firebase/auth";
import { authFirebase } from "../firebase/config";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { usePerfil } from "../context/PerfilContext";
import { LoadingComponent } from "./LoadingComponent";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;


// Pantalla principal después de iniciar sesión/registratse
export const Home = () => {

  // Obtienemos los datos del usuario autenticado con Firebase y su perfil creado
  const { perfil, user, loading } = usePerfil();

  const navigate = useNavigate();

  // Servía para debuggear
  // // Función para cerrar sesión
  // const logout = async () => {
  //   await fetch(`${API_BASE_URL}/api/logout/`, {
  //     method: "POST",
  //     headers: {
  //       Authorization: `Bearer ${user.accessToken}`,
  //     },
  //   });
  //   await signOut(authFirebase);
  //   navigate("/login");
  // };

  if (loading || !perfil) {
    return <LoadingComponent />;
  }

  return (
    <>
      <div className="text-white">
        <header>
          <div className="bg-[#3b1026] w-full lg:h-full flex flex-col justify-center items-center p-4 cursor-default">

            <i className="fa-sharp fa-dice-d20 text-5xl rotate-15 text-red-500 mb-2"></i>

            <p className="text-center text-4xl lg:text-5xl font-semibold text-red-500 font-serif">Dice & Notes</p>
            <span className="text-md text-gray-300">v1.0</span>
          </div>
        </header>

        <main className="bg-[#461831] rounded-b-4xl px-6 py-10 pb-16 min-h-[60vh] text-gray-200 cursor-default">
          <section className="max-w-5xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-red-400 mb-2">¡Hola, {perfil?.apodo || 'aventurero'}!</h2>
            <p className="text-lg mb-6">Planifica partidas, guarda tus apuntes y retoma tus historias sin perder detalle.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10 text-left">

              {/* Enlaces / Tabs */}
              <Link to={`/mis-campanas/`}  className="bg-[#752a53] p-6 rounded-2xl shadow-lg border border-red-800 hover:scale-102 transition hover:bg-[#833961]">
                <div>
                  <h3 className="text-xl font-semibold text-red-300 mb-2"><i className="fa-solid fa-dragon text-red-400"></i> Campañas y encuentros</h3>
                  <p>Lleva el control total de tus campañas de D&D 5e. Crea y organiza sesiones, gestiona encuentros y ten acceso rápido a todo.</p>
                </div>
              </Link>

              <Link to={`/mis-personajes/`} className="bg-[#752a53] p-6 rounded-2xl shadow-lg border border-red-800 hover:scale-102 transition hover:bg-[#833961]">
                <div>
                  <h3 className="text-xl font-semibold text-red-300 mb-2"><i className="fa-solid fa-hat-wizard text-purple-400"></i> Fichas de personaje</h3>
                  <p>Registra y personaliza tus personajes fácilmente. Accede a sus estadísticas y evolución con comodidad.</p>
                </div>
              </Link>

              <div className="bg-[#752a53] p-6 rounded-2xl shadow-lg border border-red-800 hover:scale-102 transition hover:bg-[#833961]">
                <h3 className="text-xl font-semibold text-red-300 mb-2"><i className="fa-solid fa-bookmark text-yellow-500"></i> Apuntes y lore</h3>
                <p>Documenta la historia de tu mundo y cualquier idea que enriquezca tus partidas.</p>
              </div>

              <div className="bg-[#752a53] p-6 rounded-2xl shadow-lg border border-red-800 hover:scale-102 transition hover:bg-[#833961]">
                <h3 className="text-xl font-semibold text-red-300 mb-2"><i className="fa-solid fa-globe text-blue-500"></i> Conexión en tiempo real</h3>
                <p>Comparte información en vivo con tu grupo y sincroniza automáticamente con tus compañeros de campaña.</p>
              </div>
            </div>
          </section>
        </main>

      </div>
    </>
  );
}
