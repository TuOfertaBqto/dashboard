export const Header = () => {
  return (
    <header className="bg-white border-b px-6 py-4 flex justify-between items-center">
      <h2 className="text-xl font-semibold">Panel de administración</h2>
      <div className="flex items-center gap-4">
        <span>👤 Admin</span>
        <button className="text-red-500 hover:underline">Cerrar sesión</button>
      </div>
    </header>
  );
};
