import axios from "axios";

export const googleLoginError = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    if (error.response?.status === 404 || error.response?.status === 503) {
      return "El inicio de sesión con Google no está disponible en este momento. Intenta más tarde.";
    }
    if (error.response?.status === 429) {
      return "Demasiados intentos de inicio de sesión. Intenta nuevamente en 15 minutos.";
    }
    if (!error.response) {
      return "No pudimos conectar con el servidor. Revisa tu conexión e intenta nuevamente.";
    }
  }
  return "No pudimos iniciar sesión con Google. Intenta nuevamente.";
};
