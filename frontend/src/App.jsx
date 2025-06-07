import { useEffect, useState } from 'react';
import { BrowserRouter as Router } from "react-router-dom";

import { Navbar } from "./components/Navbar";
import { Footer } from './components/Footer';
import { Dice } from './components/Dice';
import { ScrollToTop } from './components/ScrollToTop';
import { LoadingComponent } from './components/LoadingComponent';

import { authFirebase } from './firebase/config';
import { onAuthStateChanged } from 'firebase/auth';

import { PerfilProvider } from './context/PerfilContext';

// Rutas de la aplicacion
import { AppRoutes } from './AppRoutes';

import { useLocation, useNavigate } from 'react-router-dom';

import '@fortawesome/fontawesome-free/css/all.min.css';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;


export const App = () => {
  const [user, setUser] = useState(null); // 
  const [loading, setLoading] = useState(true); // Para manejar el estado de carga
  const location = useLocation();
  const navigate = useNavigate();
  const emailVerificado = user?.emailVerified

  // Observa los cambios en el estado de autenticación del usuario
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(authFirebase, (userFirebase) => {
      if (userFirebase) {
        //console.log("Usuario autenticado:", userFirebase);
        setUser(userFirebase);
      } else {
        setUser(null);
      }
      setLoading(false); // Finaliza el estado de carga
    });

    // Limpia el observador al desmontar el componente
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user && user.emailVerified && location.pathname === "/login") {
      // Si ya está logueado y está en login, redirige al home o a la anterior
      const from = location.state?.from || "/";
      navigate(from, { replace: true });
    }
  }, [user, location, navigate]);

  // Muestra un mensaje de carga mientras se verifica el estado de autenticación
  if (loading) {
    return <LoadingComponent />;
  }

  return (
    <div className="min-h-screen bg-[#571f3e]">
      {/* <Router> */}
      <PerfilProvider user={user}>
        {emailVerificado && <Navbar />}
        <hr />
        <div className="bg-[#571f3e]">
          <div className='max-w-[2200px] mx-auto'>
            <ScrollToTop />

            {/* Rutas de la aplicación en AppRoutes */}
            <AppRoutes user={emailVerificado ? user : null} />

          </div>
        </div>
        {emailVerificado && <Dice />}
        {emailVerificado && <Footer />}
      </PerfilProvider>
      {/* </Router> */}
    </div>
  );
};
