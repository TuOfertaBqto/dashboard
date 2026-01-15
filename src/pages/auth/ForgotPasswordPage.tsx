import { useState } from "react";
import { AuthApi } from "../../api/auth";
import { useAuth } from "../../auth/useAuth";
import { Link, Navigate } from "react-router-dom";

export default function ForgotPasswordPage() {
  const { token, user } = useAuth();
  const allowedRoles = ["super_admin", "admin", "main", "vendor"];
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  if (token && user && allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await AuthApi.forgotPassword(email);

      if (res.error) {
        setMessage("❌ Error al enviar el correo de recuperación");
      } else {
        setMessage(
          "✅ Revisa tu correo para continuar con el restablecimiento."
        );
      }
    } catch (err) {
      console.error(err);
      setMessage("❌ No se pudo enviar el enlace. Intenta de nuevo.");
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
        <h1 className="text-2xl font-bold text-center">Recuperar contraseña</h1>
        <p className="text-sm text-gray-600 text-center">
          Ingresa tu correo y te enviaremos un enlace para restablecer tu
          contraseña.
        </p>

        <div>
          <label className="block text-sm font-medium mb-1">
            Correo electrónico
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold transition disabled:opacity-50"
        >
          {loading ? "Enviando..." : "Enviar enlace"}
        </button>

        {message && (
          <p className="text-center text-sm mt-2 text-gray-700">{message}</p>
        )}

        <p className="text-center text-sm">
          <Link to="/login" className="text-blue-600 hover:underline">
            Volver al inicio de sesión
          </Link>
        </p>
      </form>
    </div>
  );
}
