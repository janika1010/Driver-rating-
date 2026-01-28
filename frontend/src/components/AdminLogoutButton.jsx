import { useCallback } from "react";

export default function AdminLogoutButton() {
  const handleLogout = useCallback(() => {
    try {
      localStorage.removeItem("admin_token");
      localStorage.removeItem("admin_username");
    } catch {
      // ignore storage errors
    }
    window.location.href = "/admin";
  }, []);

  return (
    <button type="button" className="admin-logout-button" onClick={handleLogout}>
      Logout
    </button>
  );
}

