import { useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import loginServices from "../services/login";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLock, faCheckCircle } from "@fortawesome/free-solid-svg-icons";
import useForm from "../Hooks/useForm";
import { validateResetPassword } from "../validations/resetPassword";

export default function ResetPassword() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();

  const initialState = { password: "", repeatPassword: "" };
  const { values, handleChange, handleSubmit, errors } = useForm(initialState, validateResetPassword);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const onSubmit = async (data: typeof initialState) => {
    setServerError(null);

    if (!token) {
      setServerError("Falta el token de recuperación en la URL");
      return;
    }

    setLoading(true);

    try {
      await loginServices.resetPassword(token, data.password);
      setMessage("¡Tu contraseña ha sido actualizada con éxito!");
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (err: any) {
      setServerError(err.response?.data?.error || "El enlace es inválido o expiró");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 pt-16">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-sm rounded-sm border-2 border-black bg-white p-6 shadow-[8px_8px_0_0_#000]"
      >
        <h1 className="mb-2 text-2xl font-black uppercase tracking-tighter text-black border-b-4 border-black pb-2">Nueva contraseña</h1>
        <p className="mb-6 mt-4 text-sm font-bold text-slate-800">
          Ingresa tu nueva contraseña para acceder a tu cuenta.
        </p>

        {serverError && (
          <p className="mb-4 rounded bg-red-50 px-3 py-2 text-sm text-red-600">
            {serverError}
          </p>
        )}

        {message && (
          <div className="mb-4 rounded bg-green-50 px-3 py-4 text-center text-sm text-green-700">
            <FontAwesomeIcon icon={faCheckCircle} className="mb-2 text-3xl" />
            <p className="font-medium">{message}</p>
            <p className="mt-1 text-xs opacity-80">Redirigiendo al inicio de sesión...</p>
          </div>
        )}

        {!message && (
          <>
            <div className="relative mb-4">
              <FontAwesomeIcon icon={faLock} className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-black" />
              <input
                type="password"
                name="password"
                placeholder="Nueva Contraseña"
                className="w-full rounded-none border-2 border-black bg-white py-2 pl-9 pr-3 text-sm font-bold shadow-[2px_2px_0_0_#000] outline-none transition-shadow focus:shadow-[4px_4px_0_0_#000]"
                value={values.password}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>
            
            {errors.password && (
              <p className="mt-[-8px] mb-3 text-xs text-red-600 pl-1">{errors.password}</p>
            )}

            <div className="relative mb-4">
              <FontAwesomeIcon icon={faLock} className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-black" />
              <input
                type="password"
                name="repeatPassword"
                placeholder="Repetir Contraseña"
                className="w-full rounded-none border-2 border-black bg-white py-2 pl-9 pr-3 text-sm font-bold shadow-[2px_2px_0_0_#000] outline-none transition-shadow focus:shadow-[4px_4px_0_0_#000]"
                value={values.repeatPassword}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>

            {errors.repeatPassword && (
              <p className="mt-[-12px] mb-3 text-xs text-red-600 pl-1">{errors.repeatPassword}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-none border-2 border-black bg-black py-2.5 font-bold uppercase tracking-widest text-white shadow-[2px_2px_0_0_#000] transition-all hover:bg-yellow-400 hover:text-black active:translate-y-px active:shadow-none disabled:opacity-50"
            >
              <FontAwesomeIcon icon={faLock} />
              {loading ? "Actualizando..." : "Restablecer contraseña"}
            </button>
          </>
        )}

        <p className="mt-6 border-t-2 border-black pt-4 text-center text-xs font-bold uppercase tracking-widest text-black">
          <Link to="/login" className="underline decoration-2 underline-offset-4 transition-colors hover:bg-yellow-400">
            ← Volver al Login
          </Link>
        </p>
      </form>
    </div>
  );
}
