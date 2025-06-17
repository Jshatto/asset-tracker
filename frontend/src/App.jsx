// src/App.jsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Login from "./pages/login";
import Dashboard from "./pages/Dashboard";
import PrivateRoute from "./components/PrivateRoute";

export default function App() {
  const { token } = useAuth();

  return (
    <Routes>
      {/* Public login page */}
      <Route path="/login" element={<Login />} />

      {/* Root: redirect based on auth */}
      <Route
        path="/"
        element={
          token
            ? <Navigate to="/dashboard" replace />
            : <Navigate to="/login" replace />
        }
      />

      {/* Protected dashboard */}
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        }
      />

      {/* Catch-all: send anything else back to root */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
