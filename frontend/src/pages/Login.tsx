import useForm from "../Hooks/useForm";
import loginServices  from "../services/login";
import { useUserStore } from "../Hooks/useStore";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { validateLogin } from "../validations/login";
import { useState } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faUser, faLock, faRightToBracket } from "@fortawesome/free-solid-svg-icons"

interface LoginData {
  username: string;
  password: string;
}

export default function Login() {
    const initialState: LoginData = { username: "", password: "" };
    const { values, handleChange, handleSubmit, errors } = useForm<LoginData>(initialState, validateLogin);
    const [loading, setLoading] = useState(false)
    
    const navigate = useNavigate()
    const location = useLocation()
    const {login : loginState} = useUserStore();
    
    const from = location.state?.from?.pathname || "/"

    const { username, password } = values;

    const onSubmit = async (data : LoginData) => {
        setLoading(true)
        try{
            const credentials = {
                username: data.username,
                password: data.password,
            };

            const userlogin = await loginServices.login(credentials);
            loginState(userlogin)
            navigate(from, { replace: true })
            // console.log("Login successful:", userlogin);
        }
        catch(error){
            console.error("Login error:", error);
        } finally {
            setLoading(false)
        }
    };
    
    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <form
            onSubmit={handleSubmit(onSubmit)}
            className="w-full max-w-sm rounded-lg bg-white p-6 shadow"
        >
            <h1 className="mb-4 text-xl font-semibold">Iniciar sesión</h1>

            {(errors.username || errors.password) && (
            <p className="mb-3 rounded bg-red-50 px-3 py-2 text-sm text-red-600">
                {errors.username || errors.password}
            </p>
            )}

            <div className="relative mb-3">
            <FontAwesomeIcon icon={faUser} className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400" />
            <input
            type="text"
            name="username"
            placeholder="Username"
            className="w-full rounded border py-2 pl-9 pr-3"
            value={username}
            onChange={handleChange}
            required
            />
            </div>

            <div className="relative mb-4">
            <FontAwesomeIcon icon={faLock} className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400" />
            <input
            type="password"
            name="password"
            placeholder="Contraseña"
            className="w-full rounded border py-2 pl-9 pr-3"
            value={password}
            onChange={handleChange}
            required
            />
            </div>

            <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded bg-slate-900 py-2 text-white hover:bg-slate-800 disabled:opacity-50"
            >
            <FontAwesomeIcon icon={faRightToBracket} />
            {loading ? "Ingresando..." : "Ingresar"}
            </button>

            <p className="mt-4 text-center text-sm text-slate-600">
            ¿No tienes cuenta?{" "}
            <Link to="/register" className="font-medium text-slate-900">
                Regístrate
            </Link>
            </p>
        </form>
        </div>
    )
}
