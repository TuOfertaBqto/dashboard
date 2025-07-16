import { useState } from "react";
import { Input } from "../components/Input";
import { AuthApi } from "../api/auth";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/useAuth";

export default function Login() {
  const navigate = useNavigate();
  const { login, token, user } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const isDisabled = !email || !password;

  const allowedRoles = ["super_admin", "admin", "main"];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    try {
      const { access_token, user } = await AuthApi.login({ email, password });

      console.log("Token:", access_token);
      console.log("Usuario:", user);

      if (!allowedRoles.includes(user.role)) {
        return;
      }

      login(access_token, user);
      navigate("/");
    } catch (err) {
      if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage("Error al iniciar sesión");
      }
    } finally {
      setLoading(false);
    }
  };

  if (token && user && allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex h-screen items-center justify-center bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm space-y-4"
      >
        <h1 className="text-2xl font-bold text-center">Iniciar sesión</h1>

        <Input
          label="Correo electrónico"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <Input
          label="Contraseña"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button
          type="submit"
          disabled={isDisabled || loading}
          className={`w-full py-2 text-white font-semibold rounded-lg ${
            isDisabled || loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {loading ? "Cargando..." : "Ingresar"}
        </button>

        {errorMessage && (
          <div className="text-red-600 bg-red-100 border border-red-300 rounded px-3 py-2 text-sm">
            {errorMessage}
          </div>
        )}
      </form>
    </div>
  );
}
