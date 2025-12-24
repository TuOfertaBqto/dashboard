import { useContext } from "react";
import { RequestsContext } from "./RequestsContext";

export const useRequests = () => {
  const context = useContext(RequestsContext);

  if (!context) {
    throw new Error("useRequests must be used within a RequestsProvider");
  }

  return context;
};
