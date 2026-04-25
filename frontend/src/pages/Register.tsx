import useForm from "../Hooks/useForm";
import loginServices from "../services/login";
import { useNavigate, Link } from "react-router-dom";
import { validateRegister } from "../validations/register";
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faUser, faEnvelope, faLock, faUserPlus } from "@fortawesome/free-solid-svg-icons"

interface RegisterData {
  username: string;
  email: string;
  password: string;
  repeatPassword: string;
  imagen: File | null;
}

export default function Register() {
  const initialState : RegisterData = {
    username: "",
    email: "",
    password: "",
    repeatPassword: "",
    imagen: null as File | null,
  };
  const { values: form, handleChange, handleSubmit, errors } = useForm<RegisterData>(initialState, validateRegister);
  const {username, email, password, repeatPassword} = form
  const [loading, setLoading] = useState(false)
  const generalError = errors.username || errors.email || errors.password || errors.repeatPassword || errors.imagen

  const navigate = useNavigate()

  const onSubmit = async (data : RegisterData) => {
    setLoading(true)
    try {
      const credentials = {
        username: data.username,
        email: data.email,
        password: data.password,
        avatarUrl: data.imagen || null,
      }
      await loginServices.register(credentials);
      navigate("/login"); 
    }
    catch (error) {
      console.error("Register error:", error);
    } finally {
      setLoading(false)
    }
  };

  const previewImage = form.imagen ? URL.createObjectURL(form.imagen) : "";

  return (
    <div className="flex min-h-screen items-center justify-center px-4 pt-16 pb-16">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-sm rounded-sm border-2 border-black bg-white p-6 shadow-[8px_8px_0_0_#000]"
      >
        <h1 className="mb-6 text-center text-2xl font-black uppercase tracking-tighter text-black border-b-4 border-black pb-2">Crear cuenta</h1>

        <label className="flex cursor-pointer flex-col items-center gap-2">
          <img
            src={previewImage || ""}
            className="h-20 w-20 rounded-full object-cover"
          />

          <span className="text-xs font-bold uppercase tracking-widest text-black underline decoration-2 underline-offset-4 hover:bg-yellow-400">
            Elegir foto
          </span>
          
          <input
            type="file"
            accept="image/*"
            name="imagen"
            hidden
            onChange={handleChange}
          />
        </label>

        <div className="relative mb-4">
        <FontAwesomeIcon icon={faUser} className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-black" />
        <input
          type="text"
          placeholder="Username"
          name="username"
          className="w-full rounded-none border-2 border-black bg-white py-2 pl-9 pr-3 text-sm font-bold shadow-[2px_2px_0_0_#000] transition-shadow focus:outline-none focus:shadow-[4px_4px_0_0_#000]"
          value={username}
          onChange={handleChange}
        />
        </div>

        <div className="relative mb-4">
        <FontAwesomeIcon icon={faEnvelope} className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-black" />
        <input
          type="email"
          placeholder="Email"
          name="email"
          className="w-full rounded-none border-2 border-black bg-white py-2 pl-9 pr-3 text-sm font-bold shadow-[2px_2px_0_0_#000] transition-shadow focus:outline-none focus:shadow-[4px_4px_0_0_#000]"
          value={email}
          onChange={handleChange}
        />
        </div>

        <div className="relative mb-4">
        <FontAwesomeIcon icon={faLock} className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-black" />
        <input
          type="password"
          placeholder="Contraseña"
          name="password"
          className="w-full rounded-none border-2 border-black bg-white py-2 pl-9 pr-3 text-sm font-bold shadow-[2px_2px_0_0_#000] transition-shadow focus:outline-none focus:shadow-[4px_4px_0_0_#000]"
          value={password}
          onChange={handleChange}
        />
        </div>

        <div className="relative mb-6">
        <FontAwesomeIcon icon={faLock} className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-black" />
        <input
          type="password"
          placeholder="Repetir Contraseña"
          name="repeatPassword"
          className="w-full rounded-none border-2 border-black bg-white py-2 pl-9 pr-3 text-sm font-bold shadow-[2px_2px_0_0_#000] transition-shadow focus:outline-none focus:shadow-[4px_4px_0_0_#000]"
          value={repeatPassword}
          onChange={handleChange}
        />
        </div>

        {generalError && (
          <p className="mb-3 rounded bg-red-50 px-3 py-2 text-sm text-red-600">
            {generalError}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-none border-2 border-black bg-black py-2.5 font-bold uppercase tracking-widest text-white shadow-[2px_2px_0_0_#000] transition-all hover:bg-yellow-400 hover:text-black active:translate-y-px active:shadow-none disabled:opacity-50"
        >
          <FontAwesomeIcon icon={faUserPlus} />
          {loading ? "Creando..." : "Crear cuenta"}
        </button>

        <p className="mt-6 border-t-2 border-black pt-4 text-center text-xs font-bold uppercase tracking-widest text-black">
          ¿Ya tienes cuenta?{" "}
          <Link to="/login" className="ml-1 underline decoration-2 underline-offset-4 transition-colors hover:bg-yellow-400">
            Inicia sesión
          </Link>
        </p>
      </form>
    </div>
  )
  
}
