import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Login from "./pages/auth/Login";
import Dashboard from "./pages/Dashboard";
import { PrivateRoute } from "./auth/PrivateRoute";
import UsersPage from "./pages/Users";
import UserFormPage from "./pages/UserFormPage";
import Layout from "./components/Layout";
import ContractsPage from "./pages/ContractsPage";
import ContractFormPage from "./pages/ContractFormPage";
import { ProductListPage } from "./pages/ProductListPage";
import { ProductFormPage } from "./pages/ProductFormPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { InstallmentListPage } from "./pages/InstallmentListPage";
import { InstallmentPaymentPage } from "./pages/InstallmentPaymentPage";
import RequestedContractsPage from "./pages/RequestedContractsPage";
import ContractRequestFormPage from "./pages/ContractRequestFormPage";
import { useAuth } from "./auth/useAuth";

function App() {
  const { user } = useAuth();
  const allowedRoles = ["super_admin", "admin", "main"];
  const allowedRolesWithVendor = ["super_admin", "admin", "main", "vendor"];
  const onlyVendorMain = ["main", "vendor"];
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route
          path="/"
          element={
            <PrivateRoute allowedRoles={allowedRolesWithVendor}>
              <Layout />
            </PrivateRoute>
          }
        >
          <Route
            index
            element={
              user?.role === "vendor" ? (
                <Navigate to="/requests" replace />
              ) : ["main", "admin"].includes(user?.role ?? "") ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <Navigate to="/products" replace />
              )
            }
          />

          <Route
            path="dashboard"
            element={
              <PrivateRoute allowedRoles={allowedRoles}>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="contracts"
            element={
              <PrivateRoute allowedRoles={allowedRoles}>
                <ContractsPage />
              </PrivateRoute>
            }
          />
          <Route
            path="contracts/new"
            element={
              <PrivateRoute allowedRoles={allowedRoles}>
                <ContractFormPage />
              </PrivateRoute>
            }
          />
          <Route
            path="contracts/:id/edit"
            element={
              <PrivateRoute allowedRoles={allowedRoles}>
                <ContractFormPage />
              </PrivateRoute>
            }
          />
          <Route
            path="installments"
            element={
              <PrivateRoute allowedRoles={allowedRoles}>
                <InstallmentListPage />
              </PrivateRoute>
            }
          />
          <Route
            path="installments/:id/pay"
            element={
              <PrivateRoute allowedRoles={allowedRoles}>
                <InstallmentPaymentPage />
              </PrivateRoute>
            }
          />

          <Route
            path="users"
            element={
              <PrivateRoute allowedRoles={allowedRolesWithVendor}>
                <UsersPage />
              </PrivateRoute>
            }
          />
          <Route
            path="users/new"
            element={
              <PrivateRoute allowedRoles={allowedRolesWithVendor}>
                <UserFormPage />
              </PrivateRoute>
            }
          />
          <Route
            path="users/:id/edit"
            element={
              <PrivateRoute allowedRoles={allowedRolesWithVendor}>
                <UserFormPage />
              </PrivateRoute>
            }
          />

          <Route
            path="products"
            element={
              <PrivateRoute allowedRoles={allowedRolesWithVendor}>
                <ProductListPage />
              </PrivateRoute>
            }
          />
          <Route
            path="products/new"
            element={
              <PrivateRoute allowedRoles={allowedRoles}>
                <ProductFormPage />
              </PrivateRoute>
            }
          />
          <Route
            path="products/:id/edit"
            element={
              <PrivateRoute allowedRoles={allowedRoles}>
                <ProductFormPage />
              </PrivateRoute>
            }
          />

          <Route
            path="requests"
            element={
              <PrivateRoute allowedRoles={onlyVendorMain}>
                <RequestedContractsPage />
              </PrivateRoute>
            }
          />

          <Route
            path="requests/new"
            element={
              <PrivateRoute allowedRoles={onlyVendorMain}>
                <ContractRequestFormPage />
              </PrivateRoute>
            }
          />

          <Route
            path="requests/:id/edit"
            element={
              <PrivateRoute allowedRoles={onlyVendorMain}>
                <ContractRequestFormPage />
              </PrivateRoute>
            }
          />

          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
