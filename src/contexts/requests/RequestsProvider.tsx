import { useCallback, useEffect, useState } from "react";
import { RequestsContext } from "./RequestsContext";
import { ContractApi } from "../../api/contract";
import { useAuth } from "../../auth/useAuth";

export const RequestsProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { user } = useAuth();
  const [requestsCount, setRequestsCount] = useState<number>(0);

  const refreshRequestsCount = useCallback(async () => {
    if (!user) return;
    if (!["main", "admin", "super_admin"].includes(user.role)) return;

    const count = await ContractApi.countRequest();
    setRequestsCount(count);
  }, [user]);

  useEffect(() => {
    refreshRequestsCount();
  }, [refreshRequestsCount]);

  return (
    <RequestsContext.Provider value={{ requestsCount, refreshRequestsCount }}>
      {children}
    </RequestsContext.Provider>
  );
};
