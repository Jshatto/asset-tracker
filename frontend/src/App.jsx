import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import Dashboard from "./pages/Dashboard";
import { useAuth } from "./context/AuthContext";

function App() {
  const { token } = useAuth();

  return (
    <Routes>
      {/* explicit login route */}
      <Route path="/login" element={<LoginPage />} />

      {/* root redirects based on auth */}
      <Route
        path="/"
        element={
          token 
            ? <Navigate to="/dashboard" replace /> 
            : <Navigate to="/login" replace />
        }
      />

      {/* protected dashboard */}
      <Route
        path="/dashboard"
        element={
          token 
            ? <Dashboard /> 
            : <Navigate to="/login" replace />
        }
      />
    </Routes>
  );
}

export default App;
