import { useEffect, useState } from "react";
import { userApi, type User } from "../api/user";
import { VendorCard } from "../components/VendorCard";
import { PlusCircleIcon } from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";

export const VendorListPage = () => {
  const navigate = useNavigate();
  const [vendors, setVendors] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchVendors = async () => {
      setLoading(true);
      try {
        const res = await userApi.getAllVendors();
        setVendors(res);
      } catch (err) {
        console.error("Error cargando vendedores", err);
      } finally {
        setLoading(false);
      }
    };
    fetchVendors();
  }, []);

  return (
    <div className="space-y-6 px-4 md:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 w-full">
        <h1 className="text-2xl font-bold text-center sm:text-left">
          Vendedores
        </h1>

        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <button
            onClick={() => navigate("/contracts/new")}
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white font-medium shadow hover:bg-blue-700 transition w-full sm:w-auto cursor-pointer"
          >
            <PlusCircleIcon className="w-5 h-5" />
            Crear contrato
          </button>
        </div>
      </div>

      {loading ? (
        <p className="text-gray-500">Cargando...</p>
      ) : vendors.length === 0 ? (
        <p className="text-gray-500">No hay vendedores disponibles.</p>
      ) : (
        <div
          className="
            grid grid-cols-1 
            sm:grid-cols-2 
            md:grid-cols-3 
            lg:grid-cols-4
            xl:grid-cols-5 
            gap-4 sm:gap-6 lg:gap-8
          "
        >
          {vendors.map((v) => (
            <VendorCard key={v.id} vendor={v} />
          ))}
        </div>
      )}
    </div>
  );
};
