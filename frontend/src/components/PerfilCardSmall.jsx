import { useNavigate } from 'react-router-dom';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;


// A veces 
const getAvatarUrl = (url) => {
  if (url.startsWith("http")) return url;
  return `${API_BASE_URL}${url}`; //! Modificar en el despliegue (al igual que todos los demas enlaces lmao (deberia hacer un .env))
};

export const PerfilCardSmall = ({perfil}) => {

  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/perfil/${perfil.user}`);
  };

  return (
    <div className="flex w-full p-1 pr-3 items-center cursor-pointer bg-[#833961] hover:bg-[#92416e] rounded-md select-none" onClick={handleClick}>
        <img src={getAvatarUrl(perfil.avatar)} className="w-8 h-8 rounded-full border-2 border-white bg-gray-200 select-none" />
        <p className="ml-2 text-sm font-semibold truncate text-white select-none">{perfil.apodo}</p>
    </div>
  );
}
