import { useState } from "react";
import { getAuth, sendPasswordResetEmail } from "firebase/auth";
import Swal from "sweetalert2";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;


export const PasswordReset = () => {
  const [email, setEmail] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    reset(email);
  };

  // Envio de formulario de restablecimiento de contraseña
  const reset = async (email) => {
    const auth = getAuth();

    try {
      await sendPasswordResetEmail(auth, email);
      Swal.fire({
        icon: "success",
        title: "Correo enviado",
        text: "Si tienes cuenta, se ha enviado un correo para restablecer la contraseña.",
        theme: "dark",
      });
    } catch (error) {
      console.log("Error al enviar el correo:", error.message);
      alert("Error al enviar el correo: " + error.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#571f3e] px-4">
      <div className="bg-[#461831] w-full max-w-md p-6 rounded-xl shadow-xl border-2 border-gray-800 text-gray-200">
        <h2 className="text-2xl font-bold text-center mb-6 text-red-500">Recuperar Contraseña</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block mb-1">Correo electrónico</label>
            <input
              type="email"
              placeholder="Introduce tu email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border-2 border-[#752a53] bg-[#571f3e] p-2 w-full mb-2 rounded-xl"
              required
            />
          </div>

          <button
            type="submit"
            className="bg-[#571f3e] text-white p-2 rounded-xl w-full hover:bg-[#752a53] cursor-pointer transition duration-100 border-gray-300 hover:ring border-2"
          >
            Enviar Correo
          </button>
        </form>
      </div>
    </div>
  );
};
