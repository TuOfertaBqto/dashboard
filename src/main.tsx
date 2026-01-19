import "./index.css";
import App from "./App.tsx";
import { Toaster } from "sonner";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { AuthProvider } from "./auth/AuthProvider.tsx";
import { RequestsProvider } from "./contexts/requests/RequestsProvider.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <RequestsProvider>
        <App />
        <Toaster richColors position="top-right" />
      </RequestsProvider>
    </AuthProvider>
  </StrictMode>
);
