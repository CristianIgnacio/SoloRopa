import axios from "axios";

const axiosSecure = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "",
    withCredentials: true,
});


import { useUserStore } from "../Hooks/useStore";

axiosSecure.interceptors.request.use((config) => {
    const csrfToken = localStorage.getItem("csrfToken");
    if (csrfToken) {
        config.headers["X-CSRF-Token"] = csrfToken;
    }
    return config;
});

// Interceptor para respuestas
axiosSecure.interceptors.response.use(
    (response) => {
        return response; // Si todo va bien, devolvemos la respuesta normal
    },
    (error) => {
        // Capturar errores 401 Unauthorized globalmente
        if (error.response && error.response.status === 401) {
            console.warn("Sesión expirada o token inválido. Cerrando sesión...");
            
            // Limpiamos el token CSRF  
            localStorage.removeItem("csrfToken");
            
            // Usamos Zustand para vaciar el estado global del usuario
            useUserStore.getState().logout();
        }
        
        return Promise.reject(error);
    }
);

export default axiosSecure;