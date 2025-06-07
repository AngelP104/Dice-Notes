import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { Home } from "./components/Home";
import { Login } from './components/Login';
import { CampanaList } from "./components/CampanaList";
import { Dice } from './components/Dice';
import { PasswordReset } from './components/PasswordReset';
import { Perfil } from './components/Perfil';
import { MisCampanas } from './components/MisCampanas';
import { MisPersonajes } from './components/MisPersonajes';
import { PersonajeDetail } from './components/PersonajeDetail';
import { CampanaDetail } from './components/CampanaDetail';
import { UnirseCampana } from './components/UnirseCampana';
import { CampanaCreate } from './components/CampanaCreate';
import { EncuentroCreate } from './components/EncuentroCreate';
import { PersonajeCreate } from './components/PersonajeCreate';
import { Archivo } from './components/Archivo';
import { EnemigoList } from './components/EnemigoList';
import { EnemigoDetail } from './components/EnemigoDetail';
import { EnemigoCreate } from './components/EnemigoCreate';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Rutas de la aplicación
export const AppRoutes = ({ user }) => {
    const location = useLocation();

    return (
        <Routes>
            {/* Ruta protegida: solo accesible si el usuario está autenticado */}
            <Route
                path="/"
                element={user ? <Home /> : <Navigate to="/login" state={{ from: location.pathname }} replace />}
            />

            {/* Ruta de inicio de sesión */}
            <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />

            {/* Ruta perfil */}
            <Route
                path="/perfil/:perfilUser"
                element={user ? <Perfil /> : <Navigate to="/login" state={{ from: location.pathname }} />}
            />

            {/* Ruta protegida para Mis Campañas */}
            <Route
                path="/mis-campanas"
                element={user ? <MisCampanas /> : <Navigate to="/login" state={{ from: location.pathname }} />}
            />

            {/* Ruta protegida para crear nueva campaña */}
            <Route
                path="/mis-campanas/crear"
                element={user ? <CampanaCreate /> : <Navigate to="/login" state={{ from: location.pathname }} />}
            />

            {/* Ruta protegida para Campaña detalle */}
            <Route
                path="/campanas/:campanaId"
                element={user ? <CampanaDetail /> : <Navigate to="/login" state={{ from: location.pathname }} />}
            />

            {/* Ruta para Mis Personajes*/}
            <Route
                path="/mis-personajes"
                element={user ? <MisPersonajes /> : <Navigate to="/login" state={{ from: location.pathname }} />}
            />

            {/* Ruta para crear personaje*/}
            <Route
                path="/mis-personajes/crear"
                element={user ? <PersonajeCreate /> : <Navigate to="/login" state={{ from: location.pathname }} />}
            />

            {/* Ruta para Personaje Detail*/}
            <Route
                path="/personajes/:id"
                element={user ? <PersonajeDetail /> : <Navigate to="/login" state={{ from: location.pathname }} />}
            />

            {/* Ruta para Archivo*/}
            <Route
                path="/archivo"
                element={user ? <Archivo /> : <Navigate to="/login" state={{ from: location.pathname }} />}
            />

            {/* Ruta para enemigos*/}
            <Route
                path="/enemigos"
                element={user ? <EnemigoList /> : <Navigate to="/login" state={{ from: location.pathname }} />}
            />

            {/* Ruta para enemigo detalle*/}
            <Route
                path="/enemigos/:id"
                element={user ? <EnemigoDetail /> : <Navigate to="/login" state={{ from: location.pathname }} />}
            />

            {/* Ruta para crear enemigo */}
            <Route
                path="/enemigos/crear"
                element={user ? <EnemigoCreate /> : <Navigate to="/login" state={{ from: location.pathname }} />}
            />

            {/* Ruta para unirse a una nueva campaña */}
            <Route
                path="/unirse/:codigo"
                element={user ? <UnirseCampana /> : <Navigate to="/login" state={{ from: location.pathname }} />}
            />

            {/* Ruta para Crear Encuentro */}
            <Route
                path="/campanas/:campanaId/encuentros/crear/"
                element={user ? <EncuentroCreate /> : <Navigate to="/login" state={{ from: location.pathname }} />}
            />

            {/* Ruta para enviar email de recuperacion */}
            <Route path="/reset-pass" element={user ? <Navigate to="/" /> : <PasswordReset />} />

            <Route path="/*" element={<Navigate to="/"/>}/> 
        </Routes>
    );
};
