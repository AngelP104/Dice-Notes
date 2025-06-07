import { useState, useEffect } from "react";
import { redirect, useParams } from "react-router-dom";
import { LoadingComponent } from "./LoadingComponent";
import { usePerfil } from "../context/PerfilContext";
import { PerfilCardSmall } from "./PerfilCardSmall";
import '@fortawesome/fontawesome-free/css/all.min.css';
import { CrearInvitacion } from "../modals/CrearInvitacion";
import { SidebarParty } from "../layouts/SidebarParty";
import { SesionList } from "./SesionList";
import Swal from "sweetalert2";
import { EncuentroList } from "./EncuentroList";
import { AjustesCampana } from "./AjustesCampana";
import { MisionList } from "./MisionList";
import { NotaList } from "./NotaList";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Pantalla de detalle de campaña
export const CampanaDetail = () => {
  const { campanaId } = useParams();
  const { user, perfil } = usePerfil();

  const [campana, setCampana] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("general");
  const [party, setParty] = useState([]); // Perfiles y personajes
  const [showSesionDetail, setShowSesionDetail] = useState(false);

  // Detectar si el jugador está en la party
  const jugadorEstaEnCampana = party.some((entry) => entry.perfil?.user === perfil?.id) || campana?.dungeon_master.user === perfil?.id;

  // Modal invitacion campaña
  const [showCrearInvitacionModal, setShowCrearInvitacionModal] = useState(false);

  // Comprobar si el jugador está en la party (dejado como provisional)
  //const jugadorEstaEnParty = party?.some((entry) => entry.perfil.user === perfil?.id);

  //* INFO: los jugadores de la party son los perfiles, no los personajes
  //* Los jugadores que no están en la party no verán las notas

  const tabs = [
    { id: "general", label: "General", icon: "fa-house" },
    { id: "sesiones", label: "Sesiones", icon: "fa-calendar-days" },
    { id: "encuentros", label: "Encuentros", icon: "fa-dragon" },
    //{ id: "misiones", label: "Misiones", icon: "fa-scroll" },
    //{ id: "inventario", label: "Inventario", icon: "fa-sack-xmark" },
    //{ id: "galeria", label: "Galería", icon: "fa-image" },
  ];

  // Obtener perfiles de la party y personajes
  useEffect(() => {
    const fetchPerfiles = async () => {
      if (!perfil || !user) return;
      try {
        const response = await fetch(`${API_BASE_URL}/api/campanas/${campanaId}/party/`, {
          headers: {
            Authorization: `Bearer ${user.accessToken}`,
          }
        });
        if (!response.ok) throw new Error("No se pudieron cargar los perfiles");
        const data = await response.json();
        setParty(data);
      } catch (error) {
        setError(error.message);
      }
    };

    fetchPerfiles();
  }, [campana]);

  const fetchCampana = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/campanas/${campanaId}/`, {
        headers: {
          Authorization: `Bearer ${user.accessToken}`,
        }
      });
      if (!response.ok) throw new Error("Campaña no encontrada");
      const data = await response.json();
      setCampana(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Cargar la campaña al iniciar
  useEffect(() => {
    fetchCampana();
  }, [campanaId, perfil]);

  if (!perfil || loading) return <LoadingComponent />;
  if (error) return <p className="text-red-500 text-center">{error}</p>;

  //* Comprobar que el usuario con sesión iniciada es el DM de la campaña, se usará para mostrar la pestaña de ajustes y otras funcionalidades del DM
  if (perfil.id === campana.dungeon_master.user) {
    tabs.push({ id: "ajustes", label: "Ajustes", icon: "fa-gear" });
  }


  // Mostrar modal CrearInvitacion
  const handleCrearInvitacion = () => {
    setShowCrearInvitacionModal(true);
  }

  // Eliminar jugador de la party
  const handleEliminarJugador = async (perfilId) => {
    // Muestra la confirmación de eliminación

    // Verifica si el perfilId es el del jugador que se va a eliminar (salir de la campaña)
    if (perfilId === perfil.id) {
      Swal.fire({
        title: "¿Estás seguro?",
        text: "Esta acción eliminará al jugador de la campaña.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Sí, eliminar",
        confirmButtonColor: "#ff3333",
        cancelButtonText: "Cancelar",
        theme: "dark",
        iconColor: "#ff3333",
      }).then(async (result) => {
        if (result.isConfirmed) {
          try {
            // Elimina al jugador de la campaña
            await deletePlayer(perfilId); // Pasa el perfilId
            Swal.fire({
              title: "Eliminado",
              text: "El jugador ha sido eliminado de la campaña",
              icon: "success",
              theme: "dark"
            })
          } catch (error) {
            Swal.fire({
              title: "Error",
              text: "Hubo un problema al eliminar al jugador",
              icon: "error",
              theme: "dark"
            })
          }
        }
      });
    }

    Swal.fire({
      title: "¿Eliminar jugador?",
      text: `Esta acción eliminará al jugador de la campaña.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      confirmButtonColor: "#ff3333",
      cancelButtonText: "Cancelar",
      theme: "dark",
      iconColor: "#ff3333",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          // Elimina al jugador de la campaña
          await deletePlayer(perfilId); // Pasa el perfilId
          Swal.fire({
            title: "Eliminado",
            text: "El jugador ha sido eliminado de la campaña.",
            icon: "success",
            theme: "dark"
          })
        } catch (error) {
          Swal.fire({
            title: "Error",
            text: "Hubo un problema al eliminar al jugador.",
            icon: "error",
            theme: "dark"
          })
        }
      }
    });
  };

  // Eliminar jugador de la party
  const deletePlayer = async (perfilId) => {
    try {
      // Realiza la solicitud DELETE al servidor
      const response = await fetch(`${API_BASE_URL}/api/campanas/${campanaId}/party/${perfilId}/delete/`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.accessToken}`,
        },
      });


      // Si la respuesta no es exitosa, lanza un error
      if (!response.ok) throw new Error("No se pudo eliminar al jugador");

      // Recarga la lista de jugadores de la party

      try {
        const response = await fetch(`${API_BASE_URL}/api/campanas/${campanaId}/party/`, {
          headers: {
            Authorization: `Bearer ${user.accessToken}`,
          }
        });
        if (!response.ok) throw new Error("No se pudieron cargar los perfiles");
        const data = await response.json();
        setParty(data);

        console.log(party)
      } catch (error) {
        setError(error.message);
      }

    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <>

      <SidebarParty
        campanaId={campanaId} dungeonMaster={campana.dungeon_master} />

      <div className="flex">
        <div className="w-full">
          {/* Título */}
          <h1 className="flex text-2xl font-bold text-white bg-[#3b1026] py-2 font-serif">
            <i className="fa-solid fa-dungeon mx-2 my-1"></i>{" "}{campana.nombre}{" "}<i className="fa-solid fa-dungeon mx-2 my-1"></i>
          </h1>

          {/* Mini-navbar responsive */}
          <div className="bg-[#4e1832]">
            <div className="flex justify-between bg-[#4e1832] text-white overflow-hidden shadow-md text-sm md:text-base md:w-100">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 text-center py-3 px-1 font-semibold flex flex-col items-center gap-1
              ${activeTab === tab.id ? "border-b-2 border-white bg-[#752a53] rounded-t-xl" : "hover:bg-[#571f3e] cursor-pointer"}`}
                >
                  <i className={`fa-solid ${tab.icon} text-lg`} />
                  <span className="hidden sm:block">{tab.label}</span>
                </button>
              ))}
            </div></div>

          {/* Contenido dinámico */}
          <div className="bg-[#752a53] not-sm:p-2 p-6 rounded-b-xl text-white shadow-md">
            {activeTab === "general" && (
              <div>
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Descripción */}
                  <div className="lg:w-1/2">
                    <p className="text-2xl font-semibold underline mb-4">General</p>
                    <h2 className="text-xl font-semibold mb-2 text-justify">Descripción</h2>
                    <p className="mb-4 break-words text-justify">{campana.descripcion_larga || "Sin descripción detallada."}</p>
                  </div>

                  {/* Info lateral */}
                  <div className="lg:w-1/2 bg-[#4e1832] rounded-xl p-4 shadow-md h-fit">
                    <h3 className="text-md font-semibold text-white mb-2 uppercase">Dungeon Master</h3>
                    <PerfilCardSmall perfil={campana.dungeon_master} />

                    <hr className="my-3 border-white/20" />

                    <div className="flex justify-between items-center mb-2">

                      <h3 className="text-md font-semibold text-white uppercase">Jugadores</h3>

                      {/* Botón para crear invitación */}
                      {perfil.id === campana.dungeon_master.user && (
                        <button className="bg-cyan-400 hover:bg-cyan-300 text-lg rounded-lg px-3 py-1 font-semibold text-black cursor-pointer transition"
                          onClick={handleCrearInvitacion}
                        >
                          <i className="fa-solid fa-plus"></i>
                          {" "}Crear invitación</button>
                      )}
                    </div>
                    <div className="space-y-2">
                      {party && party.length > 0 ? (
                        party.map((entry) => (
                          <div className="flex w-full gap-2 justify-between" key={entry.perfil.user}>
                            <PerfilCardSmall perfil={entry.perfil} />
                            {(perfil.id === campana.dungeon_master.user || perfil.id === entry.perfil.user) && (
                              <button
                                className="bg-red-500 hover:bg-red-600 text-sm rounded-lg px-3 py-2 font-semibold text-white cursor-pointer transition"
                                onClick={() => handleEliminarJugador(entry.perfil.user)}
                              >
                                <i className="fa-solid fa-user-minus text-md"></i>
                              </button>
                            )}
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-white/50">Aún no hay jugadores. ¡Invítalos!</p>
                      )}
                    </div>

                  </div>

                </div>

                {jugadorEstaEnCampana && (
                  <div>
                    <p className="font-semibold underline text-lg mt-6">Notas Generales</p>
                    <NotaList model="campana" objectId={campanaId} />
                  </div>
                )}

              </div>
            )}

            {activeTab === "sesiones" && (
              <SesionList campanaId={campanaId} dungeonMaster={campana.dungeon_master} party={party} />
            )}

            {activeTab === "encuentros" && (
              <EncuentroList campanaId={campanaId} dungeonMaster={campana.dungeon_master} party={party} />
            )}
            {activeTab === "misiones" && (
              <MisionList campanaId={campanaId} dungeonMaster={campana.dungeon_master} />
            )}

            {activeTab === "inventario" && <p>Aquí irá el inventario de la party...</p>}
            {activeTab === "galeria" && <p>Aquí irán las imágenes de la galería...</p>}
            {activeTab === "ajustes" && (
              <AjustesCampana campanaId={campanaId} onUpdateInfo={fetchCampana} />
            )}
          </div>
        </div>
        {showCrearInvitacionModal && (
          <CrearInvitacion
            show={showCrearInvitacionModal}
            onClose={() => setShowCrearInvitacionModal(false)}
            campanaId={campanaId}
          />
        )}
      </div>
    </>
  );

};
