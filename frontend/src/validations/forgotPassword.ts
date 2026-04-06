export function validateForgotPassword(values: { email: string }) {
  const errors: Record<string, string> = {};

  if (!values.email || !values.email.trim()) {
    errors.email = "El correo electrónico es obligatorio";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
    errors.email = "Formato de correo inválido";
  }

  return errors;
}
