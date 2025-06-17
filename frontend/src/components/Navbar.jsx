import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const navigate = useNavigate();
  const { setToken } = useAuth();

  const handleLogout = () => {
    setToken(null);
    navigate("/login");
  };

  return (
    <nav style={{ padding: "1rem", borderBottom: "1px solid #ccc" }}>
      <Link to="/dashboard" style={{ marginRight: "1rem" }}>
        Dashboard
      </Link>
      <button onClick={handleLogout}>Logout</button>
    </nav>
  );
}
