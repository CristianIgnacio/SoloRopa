export function validateLogin(values: { username: string; password: string }) {
  const errors: Record<string, string> = {};

  if (!values.username.trim()) {
    errors.username = "El usuario es obligatorio";
  }

  if (!values.password.trim()) {
    errors.password = "La contraseña es obligatoria";
  } else if (values.password.length < 6) {
    errors.password = "Debe tener al menos 6 caracteres";
  }

  return errors;
}