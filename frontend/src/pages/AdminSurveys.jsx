import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../api.js";
import QRCode from "qrcode";
import AdminSidebar from "../components/AdminSidebar.jsx";
import AdminLogoutButton from "../components/AdminLogoutButton.jsx";

export default function AdminSurveys() {
  const navigate = useNavigate();
  const [surveys, setSurveys] = useState([]);
  const [status, setStatus] = useState({ loading: true, error: "" });
  const [qrLoadingId, setQrLoadingId] = useState(null);
  const [toggleLoadingId, setToggleLoadingId] = useState(null);
  const [toggleError, setToggleError] = useState("");

  const loadSurveys = async () => {
    setStatus({ loading: true, error: "" });
    try {
      const data = await apiRequest("/admin/surveys-overview/");
      setSurveys(data);
      setStatus({ loading: false, error: "" });
    } catch (err) {
      setStatus({ loading: false, error: err.message });
    }
  };

  useEffect(() => {
    loadSurveys();
  }, []);

  const questionHeaders = Array.from({ length: 8 }, (_, index) => `Асуулт ${index + 1}`);

  const openAdminAddSurvey = async () => {
    navigate("/admin/surveys/survey/add/");
  };

  const downloadSurveyQr = async (survey) => {
    if (!survey?.slug || !survey.is_active) return;
    setQrLoadingId(survey.id);
    try {
      const surveyUrl = `${window.location.origin}/survey/${survey.slug}`;
      const dataUrl = await QRCode.toDataURL(surveyUrl, { width: 280, margin: 1 });
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = `survey_qr_${survey.slug}.png`;
      document.body.appendChild(link);
      link.click();
      link.remove();
    } finally {
      setQrLoadingId(null);
    }
  };

  const toggleSurveyActive = async (survey) => {
    if (!survey) return;
    setToggleLoadingId(survey.id);
    setToggleError("");
    try {
      await apiRequest(`/admin/surveys/${survey.id}/`, {
        method: "PATCH",
        body: JSON.stringify({ is_active: !survey.is_active }),
      });
      loadSurveys();
    } catch (err) {
      setToggleError(err.message);
    } finally {
      setToggleLoadingId(null);
    }
  };

  return (
    <div className="admin-shell">
      <header className="admin-header">
        <h1>Driver rating system</h1>
      </header>
      <div className="admin-body">
        <AdminSidebar />
        <main className="admin-content admin-surveys">
          <div className="admin-title-row">
            <h2>Судалгааны жагсаалт</h2>
            <button
              type="button"
              className="link-button"
              onClick={openAdminAddSurvey}
            >
              Судалгаа нэмэх
            </button>
          </div>
          <div className="card">
            {status.error && <div className="error">{status.error}</div>}
            {toggleError && <div className="error">{toggleError}</div>}
            {status.loading ? (
              <div>Loading...</div>
            ) : surveys.length === 0 ? (
              <div>Өгөгдөл алга.</div>
            ) : (
              <div className="table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Судалгааны нэр</th>
                      <th className="survey-description">Тайлбар</th>
                      <th className="status-cell">Төлөв</th>
                      <th className="url-cell">URL</th>
                      <th className="qr-cell">QR</th>
                      {questionHeaders.map((header) => (
                        <th key={header} className="question-cell">
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {surveys.map((survey) => (
                      <tr key={survey.id}>
                        <td>{survey.title}</td>
                        <td className="survey-description">{survey.description || "-"}</td>
                        <td className="status-cell">
                          <button
                            type="button"
                            className={`status-toggle ${survey.is_active ? "active" : "inactive"}`}
                            onClick={() => toggleSurveyActive(survey)}
                            disabled={toggleLoadingId === survey.id}
                          >
                            {toggleLoadingId === survey.id
                              ? "Түр хүлээнэ үү..."
                              : survey.is_active
                              ? "Идэвхтэй"
                              : "Идэвхгүй"}
                          </button>
                        </td>
                        <td className="url-cell">
                          {survey.slug ? (
                            <a
                              className="table-button"
                              href={`/survey/${survey.slug}`}
                              target="_blank"
                              rel="noreferrer"
                            >
                              Нээх
                            </a>
                          ) : (
                            "-"
                          )}
                        </td>
                        <td className="qr-cell">
                          <button
                            type="button"
                            className="secondary qr-button"
                            onClick={() => downloadSurveyQr(survey)}
                            disabled={qrLoadingId === survey.id || !survey.is_active}
                          >
                            {qrLoadingId === survey.id ? "Татаж байна..." : "QR татах"}
                          </button>
                        </td>
                        {questionHeaders.map((_, index) => (
                          <td key={`${survey.id}-q-${index}`} className="question-cell">
                            {survey.questions?.[index] || "-"}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>
      <AdminLogoutButton />
    </div>
  );
}
