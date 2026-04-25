import { useState } from "react";
import { Link } from "react-router-dom";
import loginServices from "../services/login";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faPaperPlane } from "@fortawesome/free-solid-svg-icons";
import useForm from "../Hooks/useForm";
import { validateForgotPassword } from "../validations/forgotPassword";

export default function ForgotPassword() {
  const initialState = { email: "" };
  const { values, handleChange, handleSubmit, errors } = useForm(initialState, validateForgotPassword);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const onSubmit = async (data: typeof initialState) => {
    setLoading(true);
    setMessage(null);
    setServerError(null);

    try {
      await loginServices.forgotPassword(data.email);
      setMessage("Si el correo esta registrado, enviaremos instrucciones para recuperar tu contrasena.");
    } catch (err: any) {
      setServerError(err.response?.data?.error || "Error al solicitar la recuperacion");
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
        <h1 className="mb-2 text-2xl font-black uppercase tracking-tighter text-black border-b-4 border-black pb-2">Recuperar cuenta</h1>
        <p className="mb-6 mt-4 text-sm font-bold text-slate-800">
          Ingresa tu correo electronico y te enviaremos un enlace para restablecer tu contrasena.
        </p>

        {serverError && (
          <p className="mb-4 rounded bg-red-50 px-3 py-2 text-sm text-red-600">
            {serverError}
          </p>
        )}

        {errors.email && (
          <p className="mb-3 rounded bg-red-50 px-3 py-2 text-sm text-red-600">
            {errors.email}
          </p>
        )}

        {message && (
          <p className="mb-4 rounded bg-green-50 px-3 py-2 text-sm text-green-700">
            {message}
          </p>
        )}

        <div className="relative mb-6">
          <FontAwesomeIcon icon={faEnvelope} className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-black" />
          <input
            type="email"
            name="email"
            placeholder="Correo electronico"
            className="w-full rounded-none border-2 border-black bg-white py-2 pl-9 pr-3 text-sm font-bold shadow-[2px_2px_0_0_#000] outline-none transition-shadow focus:shadow-[4px_4px_0_0_#000]"
            value={values.email}
            onChange={handleChange}
            required
            disabled={loading || !!message}
          />
        </div>

        <button
          type="submit"
          disabled={loading || !!message}
          className="flex w-full items-center justify-center gap-2 rounded-none border-2 border-black bg-black py-2.5 font-bold uppercase tracking-widest text-white shadow-[2px_2px_0_0_#000] transition-all hover:bg-yellow-400 hover:text-black active:translate-y-px active:shadow-none disabled:opacity-50"
        >
          <FontAwesomeIcon icon={faPaperPlane} />
          {loading ? "Enviando..." : "Enviar enlace"}
        </button>

        <p className="mt-6 border-t-2 border-black pt-4 text-center text-xs font-bold uppercase tracking-widest text-black">
          {"Recordaste tu contrasena? "}
          <Link to="/login" className="ml-1 underline decoration-2 underline-offset-4 transition-colors hover:bg-yellow-400">
            Inicia sesion
          </Link>
        </p>
      </form>
    </div>
  );
}
