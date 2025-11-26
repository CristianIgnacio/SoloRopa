import {Box, Button, TextField, Typography, Paper, Alert} from "@mui/material";
import useForm from "../Hooks/useForm";
import loginServices from "../services/login";

interface RegisterData {
  username: string;
  email: string;
  password: string;
  repeatPassword: string;
}

export default function Register() {
  const initialState : RegisterData = {
    username: "",
    email: "",
    password: "",
    repeatPassword: "",
  };
  const { values: form, handleChange, handleSubmit, errors } = useForm<RegisterData>(initialState);

  const onSubmit = async (data : RegisterData) => {
    try {
      const credentials = {
        username: data.username,
        email: data.email,
        password: data.password,
      }
      const newUser = await loginServices.register(credentials);
      console.log("Register successful:", newUser);
    }
    catch (error) {
      console.error("Register error:", error);
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
        Crear Cuenta
      </Typography>

      <Box component="form" onSubmit={handleSubmit(onSubmit)}>
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
