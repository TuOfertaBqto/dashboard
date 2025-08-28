import axios from "axios";
import { api } from "./api";

interface LoginPayload {
  email: string;
  password: string;
}

const login = async (data: LoginPayload) => {
  try {
    const res = await api.post("/auth/login", data);

    return res.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      throw new Error(
        status === 401
          ? "Credenciales incorrectas."
          : "Error en la autenticación."
      );
    }
  }

  throw new Error("Error de red o desconocido.");
};

const validateToken = async () => {
  try {
    const { data } = await api.get("/auth/validate");

    return data;
  } catch (err) {
    console.error(err);
    return { valid: false, user: null };
  }
};

const forgotPassword = async (email: string) => {
  try {
    const { data } = await api.post("/auth/forgot-password", { email });

    return data;
  } catch (err) {
    console.error(err);
    return { message: "Error al enviar el correo de recuperación" };
  }
};

const resetPassword = async (token: string, newPassword: string) => {
  try {
    const { data } = await api.post("/auth/reset-password", {
      token,
      newPassword,
    });

    return data;
  } catch (err) {
    console.error(err);
    return { message: "Error al restaurar contraseña" };
  }
};

export const AuthApi = {
  login,
  validateToken,
  forgotPassword,
  resetPassword,
};
