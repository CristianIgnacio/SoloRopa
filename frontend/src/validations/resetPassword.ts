export function validateResetPassword(values: {
  password: string;
  repeatPassword: string;
}) {
  const errors: Record<string, string> = {};

  if (!values.password || !values.password.trim()) {
    errors.password = "La nueva contraseña es obligatoria";
  } else if (values.password.length < 6) {
    errors.password = "Debe tener al menos 6 caracteres";
  }

  if (!values.repeatPassword || !values.repeatPassword.trim()) {
    errors.repeatPassword = "Debes repetir la contraseña";
  } else if (values.password !== values.repeatPassword) {
    errors.repeatPassword = "Las contraseñas no coinciden";
  }

  return errors;
}
