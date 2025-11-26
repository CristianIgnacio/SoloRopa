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

const register = async (credentials: Credentials) => {
    const response = await axios.post("/api/user", credentials);
    return response.data;
};

export default { login, register };