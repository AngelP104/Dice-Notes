export const SesionCardFinalizada = ({ sesion, onClick }) => (
    <div
        onClick={() => onClick(sesion.id)}
        className="flex flex-col md:flex-row justify-between items-start md:items-center bg-gray-700/70 hover:bg-gray-600/70 border-gray-400 border-2 p-4 rounded-lg transition duration-200 space-y-4 md:space-y-0 md:space-x-6 mb-4 cursor-pointer"
    >
        <div className="flex flex-col md:flex-row md:items-center md:space-x-6 w-full">
            <div className="flex-1">
                <h3 className="text-2xl md:text-3xl font-semibold font-serif truncate">{sesion.nombre}</h3>
                <p className="text-sm text-gray-200 mt-1 flex">
                    <i className="fa-solid fa-location-dot text-lg mr-1"></i> {sesion.ubicacion}
                </p>
                <p>
                    <i className="fa-solid fa-calendar-days mr-1 my-1"></i>
                    {new Date(sesion.fecha_inicio).toLocaleDateString()}
                </p>
                <p>
                    <i className="fa-solid fa-clock mr-1 text-md"></i>
                    {new Date(sesion.fecha_inicio).toLocaleTimeString()}
                </p>
            </div>
            
        </div>

        <div className="flex justify-between items-center w-full md:w-auto md:justify-end md:space-x-4">
            <div className="bg-gray-500 text-sm md:text-lg rounded-full px-4 py-1 text-center select-none">
                Finalizada
            </div>
            <div className="text-3xl md:text-4xl text-white">
                <i className="fa-solid fa-chevron-right"></i>
            </div>
        </div>
    </div>
);
