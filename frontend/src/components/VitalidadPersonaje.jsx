import { useState, useEffect, useRef } from 'react';
import { usePerfil } from '../context/PerfilContext';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;


// En este componente se define la barrita de vitalidad actual / vitalidad maxima de un personaje.
export const VitalidadPersonaje = ({ personaje, setPersonaje, esCreador, dungeonMaster }) => {
    const aplicandoRef = useRef(false);
    const [inputValor, setInputValor] = useState("");
    const { user, perfil } = usePerfil();

    // Se aplica el cambio de vida, dependiendo de su vida máxima, 0 como mínimo y si se suma o se resta a la actual.
    const aplicarCambio = async () => {
        if (aplicandoRef.current) return;
        aplicandoRef.current = true;
        setTimeout(() => { aplicandoRef.current = false; }, 100);

        const entrada = inputValor;
        let nuevoValor = personaje.vitalidad_actual;

        if (entrada.startsWith('+') || entrada.startsWith('-')) {
            nuevoValor += parseInt(entrada, 10);  // suma o resta con base en el valor actual del personaje
        } else if (!isNaN(parseInt(entrada, 10))) {
            nuevoValor = parseInt(entrada, 10);  // establece valor absoluto
        }

        // Asegura que se mantenga en el rango válido
        nuevoValor = Math.max(0, Math.min(personaje.vitalidad_maxima, nuevoValor));

        try {
                const token = await user.getIdToken();
            const response = await fetch(`${API_BASE_URL}/api/personajes/${personaje.id}/`, {
                method: "PATCH",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ vitalidad_actual: nuevoValor }),
            });

            if (!response.ok) throw new Error("Error al actualizar la vida del personaje");
            const data = await response.json();
            setPersonaje(data);
            setInputValor(data.vitalidad_actual);  // sincroniza el input con valor actualizado
        } catch (error) {
            console.error("Error al actualizar la vida del personaje:", error);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            aplicarCambio();
            e.target.blur();
        }
    };

    // Regex que solo permite los signos más y menos, y números.
    // Si +X : se suma X más el valor anterior.
    // Si -x : se resta X del valor anterior.
    const handleVitalidadActualChange = (e) => {
        const val = e.target.value;
        if (/^[-+]?\d*$/.test(val)) {
            setInputValor(val);
        }
    };

    // Obtenemos la vitalidad actual
    useEffect(() => {
        if (personaje && typeof personaje.vitalidad_actual !== "undefined") {
            setInputValor(personaje.vitalidad_actual);
        }
    }, [personaje]);

    return (
        <>
            <div>
                <meter id="fuel" min="0" max={personaje.vitalidad_maxima} value={personaje.vitalidad_actual} className="w-32"></meter>
                <div className="bg-green-600 mt-1 rounded-2xl text-white w-32">
                    <p className="flex justify-center font-bold">
                        {esCreador || perfil.id === dungeonMaster.user ? (
                            <input
                                type="text"
                                className="w-10 text-center"
                                value={inputValor}
                                onClick={e => e.target.select()}
                                onChange={handleVitalidadActualChange}
                                onBlur={aplicarCambio}
                                onKeyDown={handleKeyDown}
                            />
                        ) : (
                            <input
                                type="text"
                                className="w-10 text-center"
                                disabled
                                value={inputValor}
                                onClick={e => e.target.select()}
                                onChange={handleVitalidadActualChange}
                                onBlur={aplicarCambio}
                                onKeyDown={handleKeyDown}
                            />
                        )}

                        /
                        <input
                            type="text"
                            disabled // No se puede editar la vitalidad máxima
                            className="w-10 text-center"
                            value={personaje.vitalidad_maxima}
                        />
                    </p>
                </div>
            </div>
        </>
    )
}
