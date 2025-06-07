import { Link } from "react-router-dom";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Apartado principal de Navbar: Archivo
export const Archivo = () => {
  return (
    <div className="p-4">
      <main>
        <h1 className="text-2xl font-bold my-4 text-white"><i className="fa-solid fa-book mr-2"></i>Archivo</h1>

        <div className="w-full grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 p-1">

          <Link to={`/enemigos`}>
            <button className="bg-red-500 border-4 border-white text-lg rounded-2xl px-2 p-1 font-semibold text-white transition cursor-pointer hover:ring-white hover:ring-2 hover:bg-red-600 flex flex-col justify-center w-full items-center h-60">
              <i className="fa-solid fa-dragon text-5xl"></i>
              <p className="text-2xl mt-4">
                Enemigos
              </p>
            </button>
          </Link>
        </div>

      </main>
    </div>
  );
};