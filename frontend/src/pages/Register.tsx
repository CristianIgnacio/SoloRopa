import {Box, Button, TextField, Typography, Paper, Alert, Stack, Avatar} from "@mui/material";
import useForm from "../Hooks/useForm";
import loginServices from "../services/login";
import { useNavigate, Link } from "react-router-dom";
import { validateRegister } from "../validations/register";
import { useState } from "react";

interface RegisterData {
  username: string;
  email: string;
  password: string;
  repeatPassword: string;
  imagen: File | null;
}

export default function Register() {
  const initialState : RegisterData = {
    username: "",
    email: "",
    password: "",
    repeatPassword: "",
    imagen: null as File | null,
  };
  const { values: form, handleChange, handleSubmit, errors } = useForm<RegisterData>(initialState, validateRegister);
  const {username, email, password, repeatPassword} = form
  const [loading, setLoading] = useState(false)
  const generalError = errors.username || errors.email || errors.password || errors.repeatPassword || errors.imagen

  const navigate = useNavigate()

  const onSubmit = async (data : RegisterData) => {
    setLoading(true)
    try {
      const credentials = {
        username: data.username,
        email: data.email,
        password: data.password,
        avatarUrl: data.imagen || null,
      }
      console.log(credentials)
      const newUser = await loginServices.register(credentials);
      navigate("/login"); 
      console.log("Register successful:", newUser);
    }
    catch (error) {
      console.error("Register error:", error);
    } finally {
      setLoading(false)
    }
  };

  const previewImage = form.imagen ? URL.createObjectURL(form.imagen) : "";

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-sm rounded-lg bg-white p-6 shadow"
      >
        <h1 className="mb-4 text-center text-2xl font-semibold">Crear cuenta</h1>

        <label className="flex cursor-pointer flex-col items-center gap-2">
          <img
            src={previewImage || ""}
            className="h-20 w-20 rounded-full object-cover"
          />

          <span className="text-sm text-slate-600 underline">
            Elegir foto
          </span>
          
          <input
            type="file"
            accept="image/*"
            name="imagen"
            hidden
            onChange={handleChange}
          />
        </label>

        <input
          type="text"
          placeholder="Username"
          name="username"
          className="mb-3 w-full rounded border px-3 py-2"
          value={username}
          onChange={handleChange}
        />

        <input
          type="email"
          placeholder="Email"
          name="email"
          className="mb-3 w-full rounded border px-3 py-2"
          value={email}
          onChange={handleChange}
        />

        <input
          type="password"
          placeholder="Contraseña"
          name="password"
          className="mb-4 w-full rounded border px-3 py-2"
          value={password}
          onChange={handleChange}
        />

        <input
          type="password"
          placeholder="Repetir Contraseña"
          name="repeatPassword"
          className="mb-4 w-full rounded border px-3 py-2"
          value={repeatPassword}
          onChange={handleChange}
        />

        {generalError && (
          <p className="mb-3 rounded bg-red-50 px-3 py-2 text-sm text-red-600">
            {generalError}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded bg-slate-900 py-2 text-white hover:bg-slate-800 disabled:opacity-50"
        >
          {loading ? "Creando..." : "Crear cuenta"}
        </button>

        <p className="mt-4 text-center text-sm text-slate-600">
          ¿Ya tienes cuenta?{" "}
          <Link to="/login" className="font-medium text-slate-900">
            Inicia sesión
          </Link>
        </p>
      </form>
    </div>
  )
  
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
        Crear Cuenta
      </Typography>

      <Box component="form" onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={2} alignItems="center">
          <Avatar
              src={previewImage}
              sx={{ width: 80, height: 80 }}
          />

          <Button variant="outlined" component="label">
              Elegir foto
              <input
              type="file"
              accept="image/*"
              name="imagen"
              hidden
              onChange={handleChange}
              />
          </Button>
        </Stack>

        <TextField
          label="Username"
          name="username"
          fullWidth
          margin="normal"
          value={form.username}
          onChange={handleChange}
          error={Boolean(errors.username)}
          helperText={errors.username || ""}
        />

        <TextField
          label="Email"
          name="email"
          fullWidth
          margin="normal"
          type="email"
          value={form.email}
          onChange={handleChange}
          error={Boolean(errors.email)}
          helperText={errors.email || ""}
        />

        <TextField
          label="Password"
          name="password"
          type="password"
          fullWidth
          margin="normal"
          value={form.password}
          onChange={handleChange}
          error={Boolean(errors.password)}
          helperText={errors.password || ""}
        />

        <TextField
          label="Repetir Password"
          name="repeatPassword"
          type="password"
          fullWidth
          margin="normal"
          value={form.repeatPassword}
          onChange={handleChange}
          error={Boolean(errors.repeatPassword)}
          helperText={errors.repeatPassword || ""}
        />
        {(errors.imagen) && (
          <Alert severity="error" sx={{ mt: 1 }}>
            { errors.imagen}
          </Alert>
        )}

        <Button
          variant="contained"
          fullWidth
          sx={{ mt: 2 }}
          type="submit"
        >
          Registrarme
        </Button>
      </Box>
    </Paper>
  );
}
