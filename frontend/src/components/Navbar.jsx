import { NavLink, useNavigate } from "react-router-dom";
import { usePerfil } from "../context/PerfilContext";
import { useState } from "react";
import '@fortawesome/fontawesome-free/css/all.min.css';
import { authFirebase } from "../firebase/config";
import { signOut } from "firebase/auth";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

// Navbar de la aplicación. Contiene los enlaces principales
export const Navbar = () => {
  const { perfil, user, loading } = usePerfil();
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  
  // Método para hacer logout del usuario
  const logout = async () => {
    await signOut(authFirebase);
    await fetch(`${API_BASE_URL}/api/logout/`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${user.getIdToken()}`,
      },
    });
    navigate("/");
  };

  return (
    <nav className="bg-[#752a53] text-white shadow-md px-6">
      <div className="max-w-[2200px] mx-auto flex items-center justify-between h-14">

        {/* Izquierda: Logo y enlaces */}
        <div className="flex items-center space-x-6 h-full w-full md:w-auto justify-between md:justify-start">

          {/* Logo */}
          <NavLink to="/">
            <div className="flex items-center space-x-2">
              <i className="fa-solid fa-dice-d20 text-2xl rotate-15 text-white"></i>
              <h1 className="text-xl font-bold tracking-wide select-none">Dice & Notes</h1>
            </div>
          </NavLink>

          {/* Botón hamburguesa (móvil) */}
          <button
            className="md:hidden text-white text-2xl cursor-pointer"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <i className={`fa-solid fa-${mobileMenuOpen ? 'xmark' : 'bars'}`} />
          </button>

          {/* Enlaces (desktop) */}
          <div className="hidden md:flex h-full">
            <NavLink to="/" className={({ isActive }) =>
              `h-full px-4 flex items-center transition-colors duration-200 
              ${isActive ? "bg-white/20 font-semibold" : "hover:bg-white/10"}`
            }>
              Inicio
            </NavLink>
            <NavLink to="/mis-campanas" className={({ isActive }) =>
              `h-full px-4 flex items-center transition-colors duration-200 
              ${isActive ? "bg-white/20 font-semibold" : "hover:bg-white/10"}`
            }>
              Mis campañas
            </NavLink>
            <NavLink to="/mis-personajes" className={({ isActive }) =>
              `h-full px-4 flex items-center transition-colors duration-200 
              ${isActive ? "bg-white/20 font-semibold" : "hover:bg-white/10"}`
            }>
              Mis personajes
            </NavLink>
            <NavLink to="/archivo" className={({ isActive }) =>
              `h-full px-4 flex items-center transition-colors duration-200 
              ${isActive ? "bg-white/20 font-semibold" : "hover:bg-white/10"}`
            }>
              Archivo
            </NavLink>
          </div>
        </div>

        {/* Derecha: Perfil (desktop) */}
        <div className="relative hidden md:block">
          {perfil ? (
            <button
              onClick={() => setMenuAbierto(!menuAbierto)}
              className="flex items-center space-x-2 hover:bg-[#92416e] py-2 px-2 rounded-lg transition duration-100 focus:outline-none cursor-pointer"
            >
              <img src={perfil.avatar} className="w-8 h-8 rounded-full border-2 bg-white border-white object-cover" />
              <span className="not-lg:hidden">{perfil.apodo}</span>
              <i className={`fa-solid fa-chevron-${menuAbierto ? 'up' : 'down'} text-xs`} />
            </button>
          ) : (
            <button onClick={logout} className="h-full px-4 flex items-center transition-colors duration-200 hover:bg-white/10 cursor-pointer italic text-gray-400">Cargando...</button>
          )}

          {/* Menú desplegable perfil */}
          {menuAbierto && (
            <div className="absolute right-0 mt-2 w-48 bg-gray-800 text-white rounded-lg shadow-lg z-50 overflow-hidden">
              <NavLink
                to={`/perfil/${perfil.id}`} 
                className="block px-4 py-2 hover:bg-gray-900"
                onClick={() => setMenuAbierto(false)}
              >
                <i className="fa-solid fa-circle-user"></i> Ver Perfil
              </NavLink>
              <button
                onClick={logout}
                className="block w-full text-left px-4 py-2 hover:bg-red-900 text-red-400 cursor-pointer"
              >
                <i className="fa-solid fa-right-to-bracket "></i> Cerrar sesión
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Menú móvil desplegable */}
      {mobileMenuOpen && (
        <div className="md:hidden px-4 pb-4 space-y-2">
          <NavLink
            to="/"
            className="block py-2 border-b border-white/20"
            onClick={() => setMobileMenuOpen(false)}
          >
            Inicio
          </NavLink>
          <NavLink
            to="/mis-campanas"
            className="block py-2 border-b border-white/20"
            onClick={() => setMobileMenuOpen(false)}
          >
            Mis campañas
          </NavLink>
          <NavLink
            to="/mis-personajes"
            className="block py-2 border-b border-white/20"
            onClick={() => setMobileMenuOpen(false)}
          >
            Mis personajes
          </NavLink>
          <NavLink
            to="/archivo"
            className="block py-2 border-b border-white/20"
            onClick={() => setMobileMenuOpen(false)}
          >
            Archivo
          </NavLink>
          <div className="border-t border-white/30 pt-2">
            <NavLink
              to={`/perfil/${perfil.id}`}
              className="py-2 flex items-center"
              onClick={() => setMobileMenuOpen(false)}
            >
             <img src={perfil.avatar} className="w-6 h-6 rounded-full border-2 bg-white border-white mr-1" /> Ver Perfil
            </NavLink>
            <button
              onClick={() => {
                logout();
                setMobileMenuOpen(false);
              }}
              className="w-full text-left py-2 text-red-300 hover:text-red-500"
            >
              <i className="fa-solid fa-right-to-bracket" /> Cerrar sesión
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};