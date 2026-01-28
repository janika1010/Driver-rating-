import { useMemo } from "react";
import AdminSidebar from "../components/AdminSidebar.jsx";

export default function AdminSurveyAddRedirect() {
  const adminAddUrl = useMemo(() => {
    const defaultAdminBase =
      window.location.hostname.endsWith("vercel.app") ||
      window.location.hostname === "drivers-rating.vercel.app"
        ? "https://driver-rating-production.up.railway.app"
        : "http://localhost:8000";

    const adminBase = (import.meta.env.VITE_ADMIN_BASE || defaultAdminBase).replace(
      /\/$/,
      ""
    );

    return `${adminBase}/admin/surveys/survey/add/`;
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
            <p style={{ marginTop: 0 }}>
              Судалгаа нэмэх хуудас шинэ tab дээр нээгдэнэ.
            </p>
            <a
              className="link-button"
              href={adminAddUrl}
              target="_blank"
              rel="noreferrer"
            >
              Django admin дээр нээх
            </a>
          </div>
        </main>
      </div>
    </div>
  );
}
