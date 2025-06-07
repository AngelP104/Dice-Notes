import { useState, useEffect } from 'react';
import { useForm } from '../hooks/useForm';
import { useNavigate, useLocation } from 'react-router-dom';
import Swal from 'sweetalert2';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  sendEmailVerification
} from 'firebase/auth';
import { authFirebase } from '../firebase/config';
import { Link } from 'react-router-dom';
import { usePerfil } from '../context/PerfilContext';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Componente de página: Login
export const Login = () => {
  const { perfil, setPerfil } = usePerfil();
  const [cuenta, setCuenta] = useState(true);
  const location = useLocation();
  const from = location.state?.from || "/";

  // useEffect(() => {
  //   console.log(from)
  // }, [location])

  // useEffect(() => {
  //   console.log("From location.state:", location.state);
  //   console.log("From final:", from);
  // }, [location]);


  const navigate = useNavigate();
  const { formState, onInputChange, email, password } = useForm({
    email: "",
    password: "",
  });

  const autenticar = async (e) => {
    e.preventDefault();
    try {
      let userCredential;
      if (cuenta) {
        userCredential = await signInWithEmailAndPassword(authFirebase, email, password);

        // Verificación de email
        if (!userCredential.user.emailVerified) {
          await authFirebase.signOut();

          Swal.fire({
            title: 'Correo no verificado',
            text: 'Por favor, verifica tu correo electrónico antes de continuar.',
            icon: 'warning',
            confirmButtonText: 'Reenviar correo',
            showCancelButton: true,
            theme: 'dark',
          }).then(async (result) => {
            if (result.isConfirmed) {
              await userCredential.user.sendEmailVerification();
              Swal.fire('Correo reenviado', 'Revisa tu bandeja de entrada.', 'success');
            }
          });

          return;
        }

      } else {
        userCredential = await createUserWithEmailAndPassword(authFirebase, email, password);

        // Enviar correo de verificación
        await sendEmailVerification(userCredential.user);

        // Cierra la sesión para que el usuario no esté autenticado hasta verificar
        await authFirebase.signOut();

        Swal.fire({
          title: 'Verifica tu correo',
          text: 'Te hemos enviado un correo de verificación. Por favor, verifica tu email antes de iniciar sesión.',
          icon: 'info',
          confirmButtonText: 'Ok',
          theme: 'dark',
        });

        return;

      }


      // continua con el login normal si el email está verificado...
      const token = await userCredential.user.getIdToken();
      //await syncWithDjango(token);
      Swal.fire({
        title: 'Autenticacion exitosa',
        text: `Inicio de sesión exitoso con email: ${email}`,
        icon: 'success',
        showConfirmButton: false,
        allowOutsideClick: true,
        timer: 5000,
        timerProgressBar: true,
        theme: 'dark',
      });

      setTimeout(() => {
        navigate(from, { replace: true });
      }, 500);

    } catch (error) {
      Swal.fire({
        title: 'Error',
        text: `No se pudo iniciar sesión con email y contraseña. Revisa las credenciales.`,
        icon: 'warning',
        confirmButtonText: 'Ok',
        theme: 'dark',
      });
    }
  };

  const loginWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(authFirebase, provider);
      const token = await result.user.getIdToken();
      //await syncWithDjango(token);
      Swal.fire({
        title: 'Autenticacion exitosa!',
        text: `Inicio de sesión exitoso con Google: ${result.user.displayName}`,
        icon: 'success',
        showConfirmButton: false,
        allowOutsideClick: true,
        timer: 5000,
        timerProgressBar: true,
        theme: 'dark',
      });
      //navigate('/dashboard');

      setTimeout(() => {
        navigate(from, { replace: true });
      }, 500);

      navigate(from, { replace: true });
    } catch (error) {
      console.log(error)
      Swal.fire({
        title: 'Error',
        text: `No se pudo iniciar sesión con Google`,
        theme: "dark",
        icon: 'warning',
        confirmButtonText: 'Ok',
      });
    }
  };


  return (
    <>
      <div className="h-screen flex flex-col lg:flex-row bg-[#752a53]">
        {/* Logo / Lado izquierdo */}
        <div className="bg-[#3b1026] w-full lg:w-1/2 h-72 lg:h-full flex flex-col justify-center items-center p-6 cursor-default">

          <i className="fa-sharp fa-dice-d20 text-7xl rotate-15 text-red-500 mb-4"></i>

          <p className="text-center text-4xl lg:text-5xl font-semibold text-red-500 font-serif">Dice & Notes</p>
          <p className='text-gray-200 mt-1 text-center max-w-100'>Gestiona campañas, fichas y apuntes. Todo en un solo lugar para tus partidas de D&D 5e.</p>
          <p className="text-center text-sm text-gray-400 mt-4">
            Hecho por{" "}
            <a
              href="https://github.com/AngelP104"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-red-400 transition"
            >
              Ángel Pardo
            </a>
          </p>
        </div>

        {/* Formulario */}
        <div className="w-full text-gray-200 lg:w-1/2 h-auto lg:h-full flex flex-col justify-center items-center p-6 bg-[#752a53]">

          <main className={`${cuenta ? "bg-[#461831]" : "bg-[#5c2644]"} w-3/4 max-w-sm p-6 rounded-xl shadow-xl text-lg border-gray-800 border-2`}>
            <h1 className="text-xl font-bold text-center mb-2">{cuenta ? "Iniciar sesión" : "Registrarse"}</h1>
            <hr className="mb-4" />

            <form onSubmit={autenticar}>
              <div className="mb-3">
                <label htmlFor="email" className="block">Email</label>
                <input
                  type="text"
                  placeholder="Correo electrónico"
                  name="email"
                  value={email}
                  onChange={onInputChange}
                  className="border-2 border-[#752a53] bg-[#571f3e] p-2 w-full mb-2 rounded-xl"
                />
              </div>
              <div className="mb-3">
                <label htmlFor="password" className="block">Contraseña</label>
                <input
                  type="password"
                  placeholder="Contraseña"
                  name="password"
                  value={password}
                  onChange={onInputChange}
                  className="border-2 border-[#752a53] bg-[#571f3e] p-2 w-full mb-2 rounded-xl"
                />
              </div>
              <button
                type="submit"
                className="bg-[#571f3e] text-white p-2 rounded-xl w-full hover:bg-[#752a53] cursor-pointer transition duration-100 border-gray-300 hover:ring border-2"
              >
                {cuenta ? "Iniciar Sesión" : "Regístrate"}
              </button>
            </form>
          </main>

          {/* Enlaces y botones extras */}
          <div className="mt-4 text-center space-y-2">
            <Link to="/reset-pass" className="block text-white hover:underline mb-6">¿Olvidaste la contraseña?</Link>
            <button
              onClick={loginWithGoogle}
              className="bg-[#461831] text-white p-2 rounded-xl w-full max-w-xs hover:bg-[#833961] cursor-pointer transition duration-100 border-gray-800 border-2"
            >
              <i className='fa-brands fa-google mx-1'></i>{" "}Iniciar Sesión con Google
            </button>

            <p>{cuenta ? "¿No tienes cuenta?" : "¿Ya tienes cuenta?"}</p>
            <button
              type="button"
              onClick={() => setCuenta(!cuenta)}
              className="bg-[#461831] text-white p-2 rounded-xl w-full max-w-xs hover:bg-[#833961] cursor-pointer transition duration-100 border-gray-800 border-2"
            >
              {cuenta ? "Regístrarse" : "Iniciar Sesión"}
            </button>


          </div>
        </div>
      </div>
    </>
  );
};
