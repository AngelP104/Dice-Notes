import { useEffect } from "react"
import { useLocation } from "react-router-dom"

// Componente que hace scroll al inicio de la página al cambiar de ruta
export const ScrollToTop = () => {
    const { pathname } = useLocation()
    
    useEffect(() => {
        window.scrollTo(0, 0)
    }, [pathname])
    
    return null;
}
