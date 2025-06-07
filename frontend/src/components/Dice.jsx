import { useState } from "react";
//import useSound from 'use-sound';
import diceRollSfx from '../assets/sonidos/diceroll.mp3';
import Swal from 'sweetalert2';
import '@fortawesome/fontawesome-free/css/all.min.css';

// Componente siempre activo de dado
export const Dice = () => {
    const [mostrarDados, setMostrarDados] = useState(false);
    const dados = [
        { id: 2, nombre: "D2", icono: "fa-sharp fa-coin-blank" },
        { id: 4, nombre: "D4", icono: "fa-sharp fa-dice-d4" },
        { id: 6, nombre: "D6", icono: "fa-sharp fa-dice-d6" },
        { id: 8, nombre: "D8", icono: "fa-sharp fa-dice-d8" },
        { id: 10, nombre: "D10", icono: "fa-sharp fa-dice-d10" },
        { id: 12, nombre: "D12", icono: "fa-sharp fa-dice-d12" },
        { id: 20, nombre: "D20", icono: "fa-sharp fa-dice-d20" },
        { id: 100, nombre: "D100", icono: "fa-sharp fa-dice-d10" }
    ];
    const lanzarDado = (dado) => {
        const resultado = Math.floor(Math.random() * dado.id) + 1;
        Swal.fire({
            title: `${resultado}`,
            text: `1${dado.nombre}`,
            showConfirmButton: false,
            theme: 'dark',
            color: '#fff',
        });
        // const [rollSfx] = useSound('../sonidos/diceroll.mp3', {
        //     volume: 0.25,
        // });
    }

    return (
        <>
            {/* Botón flotante para abrir/cerrar el sidebar */}
            {!mostrarDados && (
                <div
                    className="fixed bottom-4 right-0 z-50 flex justify-center items-center bg-red-600/50 h-16 w-16 shadow-lg border-4 border-white/50 rounded-l-xl cursor-pointer hover:bg-red-700 hover:border-white transition-all duration-200"
                    onClick={() => setMostrarDados(true)}
                >
                    <i className="fa-solid fa-dice-d20 text-3xl text-white"></i>
                </div>
            )}

            {/* Sidebar de dados */}
            {mostrarDados && (
                <div className="fixed justify-between bottom-0 right-0 max-h-screen w-16 z-50 bg-red-600/50 shadow-lg border-y-4 border-l-4 border-white flex flex-col items-center overflow-y-auto rounded-l-lg">
                    

                    {/* Lista de dados */}
                    {dados.map((dado) => (
                        <button
                            key={dado.id}
                            onClick={() => lanzarDado(dado)}
                            className="w-full h-full py-2 border-white text-white font-semibold flex flex-col justify-center items-center transition hover:bg-red-500/40  cursor-pointer"
                        >
                            <i className={`${dado.icono} text-xl`}></i>
                            <span className="text-xs text-center">{dado.nombre}</span>
                        </button>
                    ))}
                    {/* Botón de cerrar */}
                    <div
                        className="w-full h-full flex justify-center items-center border-white border-t-4 cursor-pointer p-3 hover:bg-red-500 transition"
                        onClick={() => setMostrarDados(false)}
                    >
                        <i className="fa-solid fa-xmark-square text-white text-3xl"></i>
                    </div>
                </div>
            )}
        </>

    );
};
