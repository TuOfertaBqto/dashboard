// src/pages/Login.tsx
import { useState } from 'react';
import { Input } from '../components/Input';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const isDisabled = !email || !password;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simular petición al backend
    await new Promise((resolve) => setTimeout(resolve, 1500));

    console.log({ email, password });

    // Aquí iría el manejo del token o redirección
    setLoading(false);
  };

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
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {loading ? 'Cargando...' : 'Ingresar'}
        </button>
      </form>
    </div>
  );
}
