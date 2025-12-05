import axios from "axios";
// import axiosSecure from "../utils/axiosSecure";

type Credentials = {
    username: string;
    password: string;
};

const login = async (credentials: Credentials) => {
    const response = await axios.post("/api/auth/login", credentials);


    const csrfToken = response.headers["x-csrf-token"];

    if (csrfToken) {
        localStorage.setItem("csrfToken", csrfToken);
    }

    return response.data;
};

interface RegisterCredentials {
    username: string;
    email: string;
    password: string;
    avatarUrl?: File | null;
}

const register = async (credentials: RegisterCredentials) => {
    console.log("antes de enviar2", credentials)
    const formData = new FormData();
    formData.append("username", credentials.username);
    formData.append("email", credentials.email);
    formData.append("password", credentials.password);
    formData.append("avatarUrl", credentials.avatarUrl || "");
    const response = await axios.post("/api/user", formData, {headers: {"Content-Type": "multipart/form-data"}, withCredentials : true});
    return response.data;
};

const logout = async () => {
    const response = await axios.post("/api/auth/logout");
    localStorage.removeItem("csrfToken");
    return response.data;
}

export default { login, register, logout };