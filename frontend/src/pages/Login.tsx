import {Box, Button,TextField, Typography,Paper, Alert } from "@mui/material";
import useForm from "../Hooks/useForm";
import loginServices  from "../services/login";
import { useUserStore } from "../Hooks/useStore";
import { useNavigate } from "react-router-dom";
import { validateLogin } from "../validations/login";

interface LoginData {
  username: string;
  password: string;
}

export default function Login() {
    const initialState: LoginData = { username: "", password: "" };
    const { values, handleChange, handleSubmit, errors } = useForm<LoginData>(initialState, validateLogin);

    const { username, password } = values;

    const {login : loginState} = useUserStore();

    const navigate = useNavigate();

    const onSubmit = async (data : LoginData) => {
        try{
            const credentials = {
                username: data.username,
                password: data.password,
            };

            const userlogin = await loginServices.login(credentials);
            loginState(userlogin)
            navigate("/");
            console.log("Login successful:", userlogin);
        }
        catch(error){
            console.error("Login error:", error);
        }
    };

    return (
        <Paper
        sx={{
            maxWidth: 400,
            margin: "40px auto",
            padding: 4,
            borderRadius: 3,
        }}
        elevation={3}
        >
        <Typography variant="h5" mb={2} fontWeight="bold" textAlign="center">
            Iniciar Sesión
        </Typography>

        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
            <TextField
            label="Username"
            name="username"
            fullWidth
            margin="normal"
            value={username}
            onChange={handleChange}
            error={Boolean(errors.username)}
            helperText={errors.username || ""}
            />

            <TextField
            label="Password"
            name="password"
            type="password"
            fullWidth
            margin="normal"
            value={password}
            onChange={handleChange}
            error={Boolean(errors.password)}
            helperText={errors.password || ""}
            />

            {/* {(errors.username || errors.password) && (
                <Alert severity="error" sx={{ mt: 1 }}>
                    {errors.username || errors.password  }
                </Alert>
            )} */}

            <Button
            variant="contained"
            fullWidth
            sx={{ mt: 2 }}
            type="submit"
            >
            Entrar
            </Button>
        </Box>
        </Paper>
    );
}
