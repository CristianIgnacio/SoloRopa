import {Box, Button, TextField, Typography, Paper, Alert, Stack, Avatar} from "@mui/material";
import useForm from "../Hooks/useForm";
import loginServices from "../services/login";
import { use, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";

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
  const { values: form, handleChange, handleSubmit, errors } = useForm<RegisterData>(initialState);

  const navigate = useNavigate()

  const onSubmit = async (data : RegisterData) => {
    try {
      const credentials = {
        username: data.username,
        email: data.email,
        password: data.password,
        avatarUrl: data.imagen || null,
      }
      const newUser = await loginServices.register(credentials);
      navigate("/login"); 
      console.log("Register successful:", newUser);
    }
    catch (error) {
      console.error("Register error:", error);
    }
  };

  const previewImage = form.imagen ? URL.createObjectURL(form.imagen) : "";
  
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
          required
          value={form.username}
          onChange={handleChange}
        />

        <TextField
          label="Email"
          name="email"
          fullWidth
          margin="normal"
          type="email"
          required
          value={form.email}
          onChange={handleChange}
        />

        <TextField
          label="Password"
          name="password"
          type="password"
          fullWidth
          margin="normal"
          required
          value={form.password}
          onChange={handleChange}
        />

        <TextField
          label="Repetir Password"
          name="repeatPassword"
          type="password"
          fullWidth
          margin="normal"
          required
          value={form.repeatPassword}
          onChange={handleChange}
        />
        {(errors.email || errors.username || errors.password || errors.repeatPassword) && (
          <Alert severity="error" sx={{ mt: 1 }}>
            {errors.email || errors.username || errors.password || errors.repeatPassword }
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
