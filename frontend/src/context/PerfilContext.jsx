import { createContext, useContext, useEffect, useState } from "react";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;


// Este componente maneja el perfil local del usuario en toda la aplicación.
// user: obtiene las credenciales de Firebase
// perfil: obtiene el perfil asociado al usuario de Django, a su vez asociado al UID de FIrebase. 
const PerfilContext = createContext();

/*
perfil: {
  id: 1,
  user: 1,
  apodo: "Ángel123",
  biografia: "Hola a todos esta es la biografía del perfil.",
  avatar: "https://localhost:8000/media/avatares/default_avatar.jpg",
}
  user: {
  uid: "1234567890",
  displayName: "Ángel",
  email: "---@gmail.com",
  accessToken: "--------------" Así autorizamos el acceso a la API de Django en las peticiones
*/


export const usePerfil = () => useContext(PerfilContext);

export const PerfilProvider = ({ children, user }) => {
  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(true);
    
  useEffect(() => {
    const fetchPerfil = async () => {
      if (!user || !user.accessToken) {
        setLoading(false);
        return;
      }

      try {
    const token = await user.getIdToken(); // Se obtiene un token nuevo 
        const response = await fetch(`${API_BASE_URL}/api/obtener-perfil/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        
        const data = await response.json();
        setPerfil(data); // Guarda el perfil en el contexto
        //console.log("Perfil obtenido:", data);
        //console.log("User:", user);
      } catch (error) {
        setPerfil(null); // Si hay un error, aseguramos que perfil sea null
        console.error("Error al obtener el perfil:", error);
        //console.log(user)
      } finally {
        setLoading(false);
      }
    };

    fetchPerfil();
  }, [user]);

  return (
    <PerfilContext.Provider value={{ perfil, setPerfil, user, loading }}>
      {children}
    </PerfilContext.Provider>
  );
};