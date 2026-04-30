import useForm from "../Hooks/useForm";
import loginServices  from "../services/login";
import { useUserStore } from "../Hooks/useStore";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { validateLogin } from "../validations/login";
import { useState } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faUser, faLock, faRightToBracket } from "@fortawesome/free-solid-svg-icons"
import { GoogleLogin } from "@react-oauth/google"

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
        }
        catch(error){
            console.error("Login error:", error);
        } finally {
            setLoading(false)
        }
    };

    const handleGoogleLogin = async (credentialResponse: any) => {
        setLoading(true);
        try {
            if (credentialResponse.credential) {
                const userlogin = await loginServices.googleLogin(credentialResponse.credential);
                loginState(userlogin);
                navigate(from, { replace: true });
            }
        } catch (error) {
            console.error("Google login error:", error);
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
            <h1 className="mb-6 text-2xl font-black uppercase tracking-tighter text-black border-b-4 border-black pb-2">Iniciar sesión</h1>

            {(errors.username || errors.password) && (
            <p className="mb-3 rounded bg-red-50 px-3 py-2 text-sm text-red-600">
                {errors.username || errors.password}
            </p>
            )}

            <div className="relative mb-4">
            <FontAwesomeIcon icon={faUser} className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-black" />
            <input
            type="text"
            name="username"
            placeholder="Username"
            className="w-full rounded-none border-2 border-black bg-white py-2 pl-9 pr-3 text-sm font-bold shadow-[2px_2px_0_0_#000] transition-shadow focus:outline-none focus:shadow-[4px_4px_0_0_#000]"
            value={username}
            onChange={handleChange}
            required
            />
            </div>

            <div className="relative mb-4">
            <FontAwesomeIcon icon={faLock} className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-black" />
            <input
            type="password"
            name="password"
            placeholder="Contraseña"
            className="w-full rounded-none border-2 border-black bg-white py-2 pl-9 pr-3 text-sm font-bold shadow-[2px_2px_0_0_#000] transition-shadow focus:outline-none focus:shadow-[4px_4px_0_0_#000]"
            value={password}
            onChange={handleChange}
            required
            />
            </div>

            <div className="mb-6 text-right">
                <Link to="/forgot-password" className="text-[11px] font-bold uppercase tracking-widest text-black underline decoration-2 underline-offset-4 transition-colors hover:bg-yellow-400">
                    ¿Olvidaste tu contraseña?
                </Link>
            </div>

            <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-none border-2 border-black bg-black py-2.5 font-bold uppercase tracking-widest text-white shadow-[2px_2px_0_0_#000] transition-all hover:bg-yellow-400 hover:text-black active:translate-y-px active:shadow-none disabled:opacity-50 mb-4"
            >
            <FontAwesomeIcon icon={faRightToBracket} />
            {loading ? "Ingresando..." : "Ingresar"}
            </button>

            <div className="flex w-full items-center justify-center border-t-2 border-black pt-4 mb-2">
                <GoogleLogin
                    onSuccess={handleGoogleLogin}
                    onError={() => {
                        console.error("Login Failed");
                    }}
                    text="continue_with"
                    shape="rectangular"
                />
            </div>

            <p className="mt-4 border-t-2 border-black pt-4 text-center text-xs font-bold uppercase tracking-widest text-black">
            ¿No tienes cuenta?{" "}
            <Link to="/register" className="ml-1 underline decoration-2 underline-offset-4 transition-colors hover:bg-yellow-400">
                Regístrate
            </Link>
            </p>
        </form>
        </div>
    )
}
