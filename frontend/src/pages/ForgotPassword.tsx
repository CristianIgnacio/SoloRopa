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
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-sm rounded-lg bg-white p-6 shadow"
      >
        <h1 className="mb-2 text-xl font-semibold text-slate-900">Recuperar cuenta</h1>
        <p className="mb-6 text-sm text-slate-500">
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

        <div className="relative mb-4">
          <FontAwesomeIcon icon={faEnvelope} className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400" />
          <input
            type="email"
            name="email"
            placeholder="Correo electronico"
            className="w-full rounded border py-2 pl-9 pr-3 outline-none focus:border-slate-500"
            value={values.email}
            onChange={handleChange}
            required
            disabled={loading || !!message}
          />
        </div>

        <button
          type="submit"
          disabled={loading || !!message}
          className="flex w-full items-center justify-center gap-2 rounded bg-slate-900 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-50"
        >
          <FontAwesomeIcon icon={faPaperPlane} />
          {loading ? "Enviando..." : "Enviar enlace"}
        </button>

        <p className="mt-5 text-center text-sm text-slate-600">
          {"Recordaste tu contrasena? "}
          <Link to="/login" className="font-medium text-slate-900 hover:underline">
            Inicia sesion
          </Link>
        </p>
      </form>
    </div>
  );
}
