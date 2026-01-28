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
      // Use explicit admin base URL when provided.
      // If not provided (common in Vercel misconfig), default to Railway in production
      // and localhost in local dev.
      const defaultAdminBase =
        window.location.hostname.endsWith("vercel.app") ||
        window.location.hostname === "drivers-rating.vercel.app"
          ? "https://driver-rating-production.up.railway.app"
          : "http://localhost:8000";

      const adminBase = (import.meta.env.VITE_ADMIN_BASE || defaultAdminBase).replace(
        /\/$/,
        ""
      );
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
