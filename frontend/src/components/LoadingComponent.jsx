// Componente general que se muestra cuando un componente está cargando.
export const LoadingComponent = () => {
    return (
        <div className="w-full flex flex-col justify-center items-center py-10">
            <i className="fa-solid fa-spinner animate-spin text-3xl text-white mb-2"></i>
            <p className="text-white text-lg">Cargando...</p>
        </div>
    );
};
