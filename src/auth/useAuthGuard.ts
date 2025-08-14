import { useEffect, useState, useRef, useCallback } from "react";
import { AuthApi } from "../api/auth";
import { useAuth } from "./useAuth";

export function useAuthGuard() {
  const { token, user: currentUser, login, logout } = useAuth();
  const [loading, setLoading] = useState(true);

  const prevToken = useRef<string | null>(token);
  const prevUser = useRef<string | null>(
    currentUser ? JSON.stringify(currentUser) : null
  );
  const firstLoad = useRef(true);

  const validateToken = useCallback(async () => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    const userChanged =
      storedUser !== prevUser.current || storedToken !== prevToken.current;

    if (!token || userChanged || firstLoad.current) {
      setLoading(true);

      try {
        const { valid, user } = await AuthApi.validateToken();

        if (!valid) {
          await logout();
        } else {
          const validToken = storedToken || token;
          if (!validToken) {
            await logout();
            setLoading(false);
            return;
          }

          login(validToken, user);
          prevToken.current = validToken;
          prevUser.current = JSON.stringify(user);
        }
      } catch {
        await logout();
      } finally {
        setLoading(false);
        firstLoad.current = false;
      }
    } else {
      setLoading(false);
    }
  }, [token, login, logout]);

  useEffect(() => {
    validateToken();

    const handleStorage = (event: StorageEvent) => {
      if (event.key === "token" || event.key === "user") {
        validateToken();
      }
    };
    window.addEventListener("storage", handleStorage);

    return () => window.removeEventListener("storage", handleStorage);
  }, [validateToken]);

  return { loading };
}
