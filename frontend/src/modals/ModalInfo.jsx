import React from "react";

// Sin usar. Al hacer click en un botón de información mostrar la información que se pasara como prop.
export const ModalInfo = ({ titulo, texto, onClose }) => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
            <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full relative">
                <button
                    className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-2xl"
                    onClick={onClose}
                    aria-label="Cerrar"
                >
                    &times;
                </button>
                <h2 className="text-2xl font-bold mb-4 text-gray-800">{titulo}</h2>
                <p className="text-gray-700">{texto}</p>
                <div className="mt-6 flex justify-end">
                    <button
                        className="bg-gray-300 hover:bg-emerald-700 text-white px-4 py-2 rounded"
                        onClick={onClose}
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
};