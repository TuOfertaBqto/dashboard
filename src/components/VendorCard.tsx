import type { FC } from "react";
import { Link } from "react-router-dom";
import { DocumentTextIcon, BanknotesIcon } from "@heroicons/react/24/outline";
import type { User } from "../api/user";

interface VendorCardProps {
  vendor: User;
}

export const VendorCard: FC<VendorCardProps> = ({ vendor }) => {
  return (
    <div className="bg-white rounded-xl shadow-md p-4 flex flex-col items-center hover:shadow-lg transition-transform focus:outline-none focus:ring-2 focus:ring-blue-400 w-full max-w-sm mx-auto">
      {/* Foto */}
      <img
        src={
          "https://res.cloudinary.com/ddy2z86ai/image/upload/v1756922816/withoutPhoto_jv8xlt.png"
        }
        alt={`Foto de ${vendor.firstName} ${vendor.lastName}`}
        className="w-24 h-24 rounded-full mb-3 object-cover"
      />

      {/* Nombre */}
      <h3 className="text-lg font-semibold text-center truncate w-full mb-4">
        T{vendor.code} {vendor.firstName} {vendor.lastName}
      </h3>

      {/* Botones */}
      <div className="flex flex-wrap gap-2 w-full">
        <Link
          to={`/vendors/${vendor.id}/contracts`}
          className="flex-1 min-w-[120px] flex items-center justify-center gap-1 px-3 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
        >
          <DocumentTextIcon className="w-5 h-5" />
          Contratos
        </Link>
        <Link
          to={`/vendors/${vendor.id}/payments`}
          className="flex-1 min-w-[120px] flex items-center justify-center gap-1 px-3 py-2 text-sm bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
        >
          <BanknotesIcon className="w-5 h-5" />
          Pagos
        </Link>
      </div>
    </div>
  );
};
