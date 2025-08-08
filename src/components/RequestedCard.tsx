import type { Contract } from "../api/contract";
import { DeleteButton, EditButton } from "./ActionButtons";
import dayjs from "dayjs";
import "dayjs/locale/es";
import utc from "dayjs/plugin/utc";
import relativeTime from "dayjs/plugin/relativeTime";
import { useNavigate } from "react-router-dom";
dayjs.extend(utc);
dayjs.extend(relativeTime);
dayjs.locale("es");

interface Props {
  contract: Contract;
  onEdit?: (contract: Contract) => void;
  onDelete?: (id: string) => void;
}

export function RequestedCard({ contract, onEdit, onDelete }: Props) {
  const navigate = useNavigate();

  return (
    <div
      className="bg-white shadow-md rounded-2xl p-5 transition hover:shadow-lg space-y-4 cursor-pointer"
      onClick={() => navigate(`/requests/${contract.id}/edit`)}
    >
      <div className="flex justify-between items-start">
        <div className="flex items-center space-x-2">
          <h2 className="text-xl font-semibold text-gray-800">
            Contrato #{contract.code}
          </h2>
          <span className="text-xs text-gray-500 font-normal">
            {dayjs(contract.createdAt).utc().local().fromNow()}
          </span>
        </div>

        {/* <div className="flex gap-2">
          <EditButton
            onClick={(e) => {
              e.stopPropagation();
              onEdit?.(contract);
            }}
          />
          <DeleteButton
            onClick={(e) => {
              e.stopPropagation();
              onDelete?.(contract.id);
            }}
          />
        </div> */}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-gray-400 font-medium">Vendedor</p>
          <p className="text-gray-700 font-semibold">
            {contract.vendorId.firstName} {contract.vendorId.lastName}
          </p>
          <p className="text- text-gray-500">T{contract.vendorId.code}</p>
        </div>

        <div>
          <p className="text-sm text-gray-400 font-medium">Cliente</p>
          <p className="text-gray-700 font-semibold">
            {contract.customerId.firstName} {contract.customerId.lastName}
          </p>
        </div>
      </div>

      <div>
        <p className="text-sm text-gray-400 font-medium mb-1">Productos</p>
        <ul className="space-y-1">
          {contract.products.map((cp) => (
            <li key={cp.id} className="flex justify-between text-sm">
              <span>{cp.product.name}</span>
              <span className="text-gray-600">x{cp.quantity}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="pt-2 border-t text-right">
        <span className="text-lg font-bold text-green-600">
          ${contract.totalPrice}
        </span>
      </div>
    </div>
  );
}
