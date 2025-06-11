import { usePerfil } from "../context/PerfilContext";
import { useEffect, useRef } from "react";
const WS_BASE_URL = import.meta.env.VITE_WS_BASE_URL;

export const useModeloWebSocket = ({ modelo, objectId = null, onMensaje }) => {
    const { user, loading } = usePerfil();
    const ws = useRef(null);

    useEffect(() => {
        if (loading || !user || !user.accessToken) return;

        ws.current = new WebSocket(`${WS_BASE_URL}/modelos/${modelo}/${objectId ? objectId + "/" : ""}?token=${user.accessToken}`);

        ws.current.onopen = () => {
            //console.log(`[WS abierto] modelo=${modelo} [${objectId || "list"}]`);
        };

        ws.current.onerror = (error) => {
            console.error(`[WS error] modelo=${modelo}:`, error);
        };

        ws.current.onclose = () => {
            //console.log(`[WS cerrado] modelo=${modelo} [${objectId || "list"}]`);
        };

        ws.current.onmessage = (event) => {
            try {
                const mensaje = JSON.parse(event.data);
                //console.log("Mensaje recibido:", mensaje);
                if (onMensaje) {
                    onMensaje(mensaje.data);
                }
            } catch (err) {
                console.error("Error parseando mensaje del WS:", err);
            }
        };

        return () => {
            if (ws.current && ws.current.readyState === WebSocket.OPEN) {
                ws.current.close();
            }
        };
    }, []);

    return ws;
};
