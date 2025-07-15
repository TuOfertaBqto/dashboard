import {
  PencilSquareIcon,
  TrashIcon,
  TruckIcon,
} from "@heroicons/react/24/solid";

interface ActionButtonProps {
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
  label: string;
  icon: React.ReactNode;
  color?: string;
}

const ActionButton = ({
  onClick,
  label,
  icon,
  color = "text-blue-600",
}: ActionButtonProps) => {
  return (
    <button
      onClick={(e) => onClick(e)}
      className={`inline-flex items-center gap-1 text-sm ${color} hover:underline cursor-pointer`}
    >
      <span className="w-4 h-4">{icon}</span>
      {label}
    </button>
  );
};

export const EditButton = ({
  onClick,
}: {
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
}) => (
  <ActionButton
    onClick={onClick}
    label="Editar"
    icon={<PencilSquareIcon className="w-4 h-4" />}
  />
);

export const DeleteButton = ({
  onClick,
}: {
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
}) => (
  <ActionButton
    onClick={onClick}
    label="Eliminar"
    icon={<TrashIcon className="w-4 h-4" />}
    color="text-red-600"
  />
);

export const DispatchButton = ({
  onClick,
}: {
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
}) => (
  <ActionButton
    onClick={onClick}
    label="Despachar"
    icon={<TruckIcon className="w-4 h-4" />}
    color="text-green-600"
  />
);
