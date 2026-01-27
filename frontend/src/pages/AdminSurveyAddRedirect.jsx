import { useEffect, useState } from "react";
import { apiRequest } from "../api.js";
import AdminSidebar from "../components/AdminSidebar.jsx";

export default function AdminSurveyAddRedirect() {
  const [iframeSrc, setIframeSrc] = useState("");

  useEffect(() => {
    const prepare = async () => {
      try {
        await apiRequest("/admin/session/", { method: "POST" });
      } catch (err) {
        // Ignore session errors and continue loading the admin page.
      }
      const host = window.location.hostname || "localhost";
      const adminBase = (import.meta.env.VITE_ADMIN_BASE || `http://${host}:8000`).replace(/\/$/, "");
      setIframeSrc(`${adminBase}/admin/surveys/survey/add/?embed=1`);
    };
    prepare();
  }, []);

  return (
    <div className="admin-shell">
      <header className="admin-header">
        <h1>Driver rating system</h1>
      </header>
      <div className="admin-body">
        <AdminSidebar />
        <main className="admin-content">
          <h2>Судалгаа нэмэх</h2>
          <div className="card">
            {iframeSrc ? (
              <iframe
                className="admin-iframe"
                src={iframeSrc}
                title="Survey add"
              />
            ) : (
              <div>Loading...</div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
