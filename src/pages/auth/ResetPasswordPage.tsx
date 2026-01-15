import { AuthApi } from "../../api/auth";
import { useEffect, useState } from "react";
import { useAuth } from "../../auth/useAuth";
import { Navigate, useLocation, useNavigate } from "react-router-dom";

export default function ResetPasswordPage() {
  const { token, user } = useAuth();
  const allowedRoles = ["super_admin", "admin", "main", "vendor"];
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const key = query.get("token");
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!key) {
      navigate("/login", { replace: true });
    }
  }, [key, navigate]);

  if (token && user && allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    if (!key) {
      navigate("/login", { replace: true });
      return;
    }

    setLoading(true);
    try {
      const res = await AuthApi.resetPassword(key, password);

      if (res.error) {
        setError("Error al restaurar contraseña");
      } else {
        setError("");
        setSuccess("Contraseña restablecida con éxito ✅");
      }
    } catch (err) {
      console.error(err);
      setError("Error inesperado");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white w-full max-w-sm p-6 rounded-xl shadow space-y-5"
      >
        <h1 className="text-2xl font-bold text-center">
          Restablecer contraseña
        </h1>

        {error && <p className="text-red-600 text-sm text-center">{error}</p>}
        {success && (
          <p className="text-green-600 text-sm text-center">{success}</p>
        )}

        {!success ? (
          <>
            <div>
              <label className="block text-sm font-medium mb-1">
                Nueva contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={7}
                required
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Confirmar contraseña
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                minLength={7}
                required
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-2 rounded-lg font-semibold transition text-white
          ${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-green-600 hover:bg-green-700"
          }
        `}
            >
              {loading ? "Guardando..." : "Guardar nueva contraseña"}
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={() => navigate("/login")}
            className="w-full py-2 rounded-lg font-semibold transition text-white bg-blue-600 hover:bg-blue-700"
          >
            Ir al inicio de sesión
          </button>
        )}
      </form>
    </div>
  );
}
