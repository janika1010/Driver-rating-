import { useEffect, useState } from "react";
import { apiRequest } from "../api.js";
import AdminSidebar from "../components/AdminSidebar.jsx";

export default function AdminDashboard() {
  const [surveyOptions, setSurveyOptions] = useState([]);
  const [surveyFilter, setSurveyFilter] = useState("");
  const [surveyStatus, setSurveyStatus] = useState({ loading: true, error: "" });
  const [driverOptions, setDriverOptions] = useState([]);
  const [driverFilter, setDriverFilter] = useState("");
  const [driverStatus, setDriverStatus] = useState({ loading: true, error: "" });
  const [dashboardRows, setDashboardRows] = useState([]);
  const [dashboardStatus, setDashboardStatus] = useState({ loading: true, error: "" });

  const loadSurveys = async () => {
    setSurveyStatus({ loading: true, error: "" });
    try {
      const data = await apiRequest("/admin/surveys/");
      setSurveyOptions(data);
      setSurveyStatus({ loading: false, error: "" });
    } catch (err) {
      setSurveyStatus({ loading: false, error: err.message });
    }
  };

  const loadDashboardTable = async () => {
    setDashboardStatus({ loading: true, error: "" });
    try {
      const params = new URLSearchParams();
      if (surveyFilter) {
        params.set("survey_id", surveyFilter);
      }
      if (driverFilter) {
        params.set("driver_id", driverFilter);
      }
      const query = params.toString();
      const data = await apiRequest(`/admin/dashboard-table/${query ? `?${query}` : ""}`);
      setDashboardRows(data.rows || []);
      setDashboardStatus({ loading: false, error: "" });
    } catch (err) {
      setDashboardStatus({ loading: false, error: err.message });
    }
  };

  const loadDrivers = async () => {
    setDriverStatus({ loading: true, error: "" });
    try {
      const data = await apiRequest("/admin/drivers/");
      setDriverOptions(data);
      setDriverStatus({ loading: false, error: "" });
    } catch (err) {
      setDriverStatus({ loading: false, error: err.message });
    }
  };

  useEffect(() => {
    loadSurveys();
    loadDrivers();
  }, []);

  useEffect(() => {
    loadDashboardTable();
  }, [surveyFilter, driverFilter]);

  const questionHeaders = Array.from({ length: 8 }, (_, index) => `Асуулт ${index + 1}`);
  const selectedSurvey = surveyOptions.find(
    (survey) => String(survey.id) === String(surveyFilter)
  );

  const escapeHtml = (value) =>
    String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");

  const downloadDashboardExcel = () => {
    if (!dashboardRows.length) return;
    const headers = [
      "Судалгааны нэр",
      "Жолоочийн нэр",
      "IP хаяг",
      ...questionHeaders,
    ];

    const rows = dashboardRows.map((row) => [
      row.survey,
      row.driver,
      row.ip_address || "-",
      ...questionHeaders.map((_, index) => {
        const values = row.answers?.[index] || [];
        return values.length ? values.join(" | ") : "-";
      }),
    ]);

    const table = `
      <table>
        <thead>
          <tr>${headers.map((header) => `<th>${escapeHtml(header)}</th>`).join("")}</tr>
        </thead>
        <tbody>
          ${rows
            .map(
              (row) =>
                `<tr>${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join("")}</tr>`
            )
            .join("")}
        </tbody>
      </table>
    `;

    const html = `\ufeff<html><head><meta charset="UTF-8"></head><body>${table}</body></html>`;
    const blob = new Blob([html], { type: "application/vnd.ms-excel;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const fileSuffix = selectedSurvey?.slug || "all";
    link.href = url;
    link.download = `survey_dashboard_${fileSuffix}.xls`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const deleteDashboardData = async () => {
    const confirmed = window.confirm(
      "Судалгаа бөглөсөн өгөгдлийг устгах уу? Энэ үйлдэл буцаахгүй."
    );
    if (!confirmed) return;
    setDashboardStatus({ loading: true, error: "" });
    try {
      const result = await apiRequest("/admin/responses/delete/", {
        method: "POST",
        body: JSON.stringify({
          survey_id: surveyFilter || null,
          driver_id: driverFilter || null,
        }),
      });
      await loadDashboardTable();
      if (result.deleted_responses) {
        window.alert(`${result.deleted_responses} өгөгдөл устгалаа.`);
      } else {
        window.alert("Устгах өгөгдөл олдсонгүй.");
      }
    } catch (err) {
      setDashboardStatus({ loading: false, error: err.message });
    }
  };

  return (
    <div className="admin-shell">
      <header className="admin-header">
        <h1>Driver rating system</h1>
      </header>
      <div className="admin-body">
        <AdminSidebar />
        <main className="admin-content" id="dashboard">
          <h2>Судалгааны мэдээлэл</h2>

          <div className="card">
            <div className="dashboard-filter">
              <label htmlFor="survey-filter">Судалгааны нэр</label>
              <select
                id="survey-filter"
                value={surveyFilter}
                onChange={(event) => setSurveyFilter(event.target.value)}
                disabled={surveyStatus.loading}
              >
                <option value="">Бүх судалгаа</option>
                {surveyOptions.map((survey) => (
                  <option key={survey.id} value={survey.id}>
                    {survey.title}
                  </option>
                ))}
              </select>
              <label htmlFor="driver-filter">Жолоочийн нэр</label>
              <select
                id="driver-filter"
                value={driverFilter}
                onChange={(event) => setDriverFilter(event.target.value)}
                disabled={driverStatus.loading}
              >
                <option value="">Бүх жолооч</option>
                {driverOptions.map((driver) => (
                  <option key={driver.id} value={driver.id}>
                    {driver.last_name ? `${driver.last_name} ` : ""}
                    {driver.name}
                    {driver.car_number ? ` [${driver.car_number}]` : ""}
                  </option>
                ))}
              </select>
              <button
                type="button"
                className="secondary"
                onClick={downloadDashboardExcel}
                disabled={dashboardStatus.loading || !dashboardRows.length}
              >
                Мэдээлэл татах
              </button>
              <button
                type="button"
                className="danger"
                onClick={deleteDashboardData}
                disabled={dashboardStatus.loading}
              >
                Өгөгдөл устгах
              </button>
            </div>
            {surveyStatus.error && <div className="error">{surveyStatus.error}</div>}
            {driverStatus.error && <div className="error">{driverStatus.error}</div>}
            {dashboardStatus.error && <div className="error">{dashboardStatus.error}</div>}
            {dashboardStatus.loading ? (
              <div>Loading...</div>
            ) : dashboardRows.length === 0 ? (
              <div>Өгөгдөл алга.</div>
            ) : (
              <div className="table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Судалгааны нэр</th>
                      <th>Жолоочийн нэр</th>
                      <th>IP хаяг</th>
                      {questionHeaders.map((header) => (
                        <th key={header} className="answer-cell">
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {dashboardRows.map((row) => (
                      <tr key={`${row.survey}-${row.driver}-${row.id}`}>
                        <td>{row.survey}</td>
                        <td>{row.driver}</td>
                        <td>{row.ip_address || "-"}</td>
                        {questionHeaders.map((_, index) => {
                          const values = row.answers?.[index] || [];
                          return (
                            <td key={`${row.id}-q-${index}`} className="answer-cell">
                              {values.length ? (
                                <div className="answer-list">
                                  {values.map((value, idx) => (
                                    <div key={`${row.id}-q-${index}-${idx}`} className="answer-item">
                                      {value}
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                "-"
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
