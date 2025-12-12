import useForm from "../Hooks/useForm";
import loginServices  from "../services/login";
import { useUserStore } from "../Hooks/useStore";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { validateLogin } from "../validations/login";
import {useState} from "react"

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

            <input
            type="text"
            name="username"
            placeholder="Username"
            className="mb-3 w-full rounded border px-3 py-2"
            value={username}
            onChange={handleChange}
            required
            />

            <input
            type="password"
            name="password"
            placeholder="Contraseña"
            className="mb-4 w-full rounded border px-3 py-2"
            value={password}
            onChange={handleChange}
            required
            />

            <button
            type="submit"
            disabled={loading}
            className="w-full rounded bg-slate-900 py-2 text-white hover:bg-slate-800 disabled:opacity-50"
            >
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
