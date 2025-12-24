import "./index.css";
import App from "./App.tsx";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { AuthProvider } from "./auth/AuthProvider.tsx";
import { RequestsProvider } from "./contexts/requests/RequestsProvider.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <RequestsProvider>
        <App />
      </RequestsProvider>
    </AuthProvider>
  </StrictMode>
);
