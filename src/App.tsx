import { BrowserRouter, Route, Routes } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import { AuthProvider } from "./auth/AuthProvider";
import { PrivateRoute } from "./auth/PrivateRoute";
import UsersPage from "./pages/Users";
import UserFormPage from "./pages/UserFormPage";
import Layout from "./components/Layout";
import ContractsPage from "./pages/ContractsPage";
import ContractFormPage from "./pages/ContractFormPage";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route
            path="/"
            element={
              <PrivateRoute>
                <Layout />
              </PrivateRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="users/new" element={<UserFormPage />} />
            <Route path="users/:id/edit" element={<UserFormPage />} />
            <Route path="contracts" element={<ContractsPage />} />
            <Route path="contracts/new" element={<ContractFormPage />} />
            <Route path="contracts/:id/edit" element={<ContractFormPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
