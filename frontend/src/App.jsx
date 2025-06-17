import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import LoginPage from "./pages/LoginPage";
import Dashboard from "./pages/Dashboard";

function App() {
  const { token } = useAuth();

  return (
    <Routes>
      {/* 1. Explicit login route */}
      <Route path="/login" element={<LoginPage />} />

      {/* 2. Root: redirect based on auth */}
      <Route
        path="/"
        element={
          token 
            ? <Navigate to="/dashboard" replace /> 
            : <Navigate to="/login" replace />
        }
      />

      {/* 3. Dashboard (protected) */}
      <Route
        path="/dashboard"
        element={
          token 
            ? <Dashboard /> 
            : <Navigate to="/login" replace />
        }
      />

      {/* 4. Catch–all unknown paths → root */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
