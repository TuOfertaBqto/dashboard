import { useEffect, useState } from "react";
import { userApi, type User } from "../api/user";
import { VendorCard } from "../components/VendorCard";

export const VendorListPage = () => {
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
      <h1 className="text-xl md:text-2xl font-semibold text-gray-800">
        Vendedores
      </h1>

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
