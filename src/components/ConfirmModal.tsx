import { useState, type ReactNode } from "react";

interface ConfirmModalProps {
  open: boolean;
  title?: string;
  message: ReactNode;
  onCancel: () => void;
  onConfirm: () => Promise<void>;
  confirmText?: string;
  cancelText?: string;
}

export const ConfirmModal = ({
  open,
  title = "Confirmar acción",
  message,
  onCancel,
  onConfirm,
  confirmText = "Sí, confirmar",
  cancelText = "Cancelar",
}: ConfirmModalProps) => {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm();
    } catch (error) {
      console.error("Error en confirmación:", error);
    } finally {
      setLoading(false);
    }
  };
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Capa de fondo con opacidad */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Contenido del modal */}
      <div className="relative z-10 bg-white text-black rounded-lg shadow-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">{title}</h2>
        {typeof message === "string" ? (
          <p className="text-gray-700 mb-6">{message}</p>
        ) : (
          message
        )}

        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading}
            className={`px-4 py-2 rounded text-white ${
              loading
                ? "bg-red-400 cursor-not-allowed"
                : "bg-red-600 hover:bg-red-700"
            }`}
          >
            {loading ? "Procesando..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
