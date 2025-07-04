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
    console.log(error);
    return { msg: "error login" };
  }
};

export const AuthApi = {
  login,
};
