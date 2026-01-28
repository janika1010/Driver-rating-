import { Link, useLocation } from "react-router-dom";

const getInitials = (name) => {
  const cleaned = (name || "").trim();
  if (!cleaned) return "A";
  const parts = cleaned.split(/\s+/);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
};

export default function AdminSidebar() {
  const location = useLocation();
  const username = localStorage.getItem("admin_username") || "Admin";
  const initials = getInitials(username);
  const handleLogout = () => {
    try {
      localStorage.removeItem("admin_token");
      localStorage.removeItem("admin_username");
    } catch {
      // ignore
    }
    window.location.href = "/admin";
  };

  return (
    <aside className="admin-sidebar">
      <div className="admin-user">
        <div className="admin-avatar">{initials}</div>
        <div className="admin-username">{username}</div>
      </div>
      <nav className="admin-menu">
        <div className="admin-menu-top">
          <Link to="/admin/dashboard" className={location.pathname === "/admin/dashboard" ? "active" : ""}>
          <span className="menu-icon" aria-hidden="true">📊</span>
          Dashboard
          </Link>
          <Link to="/admin/surveys" className={location.pathname === "/admin/surveys" ? "active" : ""}>
          <span className="menu-icon" aria-hidden="true">📋</span>
          Surveys
          </Link>
          <Link to="/admin/drivers" className={location.pathname === "/admin/drivers" ? "active" : ""}>
          <span className="menu-icon" aria-hidden="true">🚗</span>
          Drivers
          </Link>
          <Link to="/admin/users" className={location.pathname === "/admin/users" ? "active" : ""}>
          <span className="menu-icon" aria-hidden="true">👤</span>
          Users
          </Link>
          <button type="button" className="admin-menu-logout" onClick={handleLogout}>
            <span className="menu-icon" aria-hidden="true">🚪</span>
            Logout
          </button>
        </div>
      </nav>
    </aside>
  );
}
