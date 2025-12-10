export function validateRegister(values: {
  username: string;
  email: string;
  password: string;
  repeatPassword: string;
  avatar?: File | null;
}) {
  const errors: Record<string, string> = {};

  if (!values.username.trim()) {
    errors.username = "El usuario es obligatorio";
  }

  if (!values.email.trim()) {
    errors.email = "El email es obligatorio";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
    errors.email = "Formato de email inválido";
  }

  if (!values.password.trim()) {
    errors.password = "La contraseña es obligatoria";
  } else if (values.password.length < 6) {
    errors.password = "Debe tener al menos 6 caracteres";
  }

  if (!values.repeatPassword.trim()) {
    errors.repeatPassword = "Debes repetir la contraseña";
  } else if (values.password !== values.repeatPassword) {
    errors.repeatPassword = "Las contraseñas no coinciden";
  }

  if (values.avatar) {
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (!allowed.includes(values.avatar.type)) {
      errors.avatar = "Formato inválido (solo JPG, PNG o WebP)";
    }
    if (values.avatar.size > 2 * 1024 * 1024) {
      errors.avatar = "La imagen no puede superar los 2MB";
    }
  }

  return errors;
}
