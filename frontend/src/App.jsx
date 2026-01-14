import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import { useAuth } from "./context/auth";
import Analyze from "./pages/Analyze";

export default function App() {
  const { isAuthed } = useAuth();

  return (
    <Routes>
      <Route path="/" element={<Navigate to={isAuthed ? "/dashboard" : "/login"} replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route
  path="/analyze"
  element={
    <ProtectedRoute>
      <Analyze />
    </ProtectedRoute>
  }
/>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
