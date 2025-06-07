const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Tarjetas de participante mostradas en la pantalla de creación de encuentro
export const EncuentroCreateCard = ({ entidad, esPersonaje, onClick }) => {
    const nombre = esPersonaje ? entidad.nombre : entidad.nombre;
    const clase = esPersonaje ? entidad.clase : entidad.raza;

    const calcularModificador = (stat) => Math.floor((stat - 10) / 2)
    
    return (
        <div
            className={`p-3 bg-gradient-to-t from-gray-900 to-rose-900 border-2 border-white rounded-lg shadow-lg cursor-pointer hover:scale-103 transition-transform select-none`}
            onClick={onClick}
        >
            <div className="flex items-center space-x-3">
                <img
                    src={`${API_BASE_URL}${entidad.imagen}`}
                    alt={nombre}
                    className="w-14 h-14 rounded-lg border-2 shadow-md bg-gray-200"
                />
                <div>
                    <h4 className="text-white font-bold text-lg">{nombre}</h4>
                    <p className="text-sm text-gray-300 italic">{clase}{" "}
                        {entidad.subclase && (
                            "/" + ` ` + entidad.subclase)}
                    </p>

                    {esPersonaje && (
                        <p className="font-light">Nivel {entidad.nivel}</p>
                    )}
                </div>
            </div>
            <div className='not-sm:text-sm grid grid-cols-2 gap-1 mt-2'>
                <div className='font-light flex flex-col gap-1'>
                    <p>FUE: <span className='font-semibold'>{entidad.fuerza} ({calcularModificador(entidad.fuerza) >= 0 ? "+" : " "}{calcularModificador(entidad.fuerza)})</span></p>
                    <p>DES: <span className='font-semibold'>{entidad.destreza} ({calcularModificador(entidad.destreza) >= 0 ? "+" : " "}{calcularModificador(entidad.destreza)})</span></p>
                    <p>CON: <span className='font-semibold'>{entidad.constitucion} ({calcularModificador(entidad.constitucion) >= 0 ? "+" : " "}{calcularModificador(entidad.constitucion)})</span></p>
                </div>
                <div className='font-light flex flex-col gap-1'>
                    <p>INT: <span className='font-semibold'>{entidad.inteligencia} ({calcularModificador(entidad.inteligencia) >= 0 ? "+" : " "}{calcularModificador(entidad.inteligencia)})</span></p>
                    <p>SAB: <span className='font-semibold'>{entidad.sabiduria} ({calcularModificador(entidad.sabiduria) >= 0 ? "+" : " "}{calcularModificador(entidad.sabiduria)})</span></p>
                    <p>CAR: <span className='font-semibold'>{entidad.carisma} ({calcularModificador(entidad.carisma) >= 0 ? "+" : " "}{calcularModificador(entidad.carisma)})</span></p>
                </div>
            </div>
        </div>
    );
};