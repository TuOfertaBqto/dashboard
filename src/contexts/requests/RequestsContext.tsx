import { createContext } from "react";

export interface RequestsContextType {
  requestsCount: number;
  refreshRequestsCount: () => Promise<void>;
}

export const RequestsContext = createContext<RequestsContextType | null>(null);
