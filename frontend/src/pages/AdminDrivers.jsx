import { useEffect, useState } from "react";
import { apiRequest } from "../api.js";
import AdminSidebar from "../components/AdminSidebar.jsx";
import AdminLogoutButton from "../components/AdminLogoutButton.jsx";

export default function AdminDrivers() {
  const [drivers, setDrivers] = useState([]);
  const [status, setStatus] = useState({ loading: true, error: "" });
  const [toggleLoadingId, setToggleLoadingId] = useState(null);
  const [toggleError, setToggleError] = useState("");
  const [driverFilter, setDriverFilter] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createForm, setCreateForm] = useState({
    last_name: "",
    name: "",
    phone_number: "",
    car_number: "",
    is_active: true,
  });
  const [createStatus, setCreateStatus] = useState({ loading: false, error: "", success: "" });

  const loadDrivers = async () => {
    setStatus({ loading: true, error: "" });
    try {
      const data = await apiRequest("/admin/drivers/");
      setDrivers(data);
      setStatus({ loading: false, error: "" });
    } catch (err) {
      setStatus({ loading: false, error: err.message });
    }
  };

  useEffect(() => {
    loadDrivers();
  }, []);

  const normalizedFilter = driverFilter.trim().toLowerCase();
  const filteredDrivers = normalizedFilter
    ? drivers.filter((driver) => {
        const haystack = [
          driver.last_name,
          driver.name,
          driver.phone_number,
          driver.car_number,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return haystack.includes(normalizedFilter);
      })
    : drivers;

  const toggleDriverActive = async (driver) => {
    if (!driver) return;
    setToggleLoadingId(driver.id);
    setToggleError("");
    try {
      await apiRequest(`/admin/drivers/${driver.id}/`, {
        method: "PATCH",
        body: JSON.stringify({ is_active: !driver.is_active }),
      });
      loadDrivers();
    } catch (err) {
      setToggleError(err.message);
    } finally {
      setToggleLoadingId(null);
    }
  };

  const handleCreateChange = (event) => {
    const { name, value, type, checked } = event.target;
    setCreateForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const createDriver = async (event) => {
    event.preventDefault();
    setCreateStatus({ loading: true, error: "", success: "" });
    try {
      await apiRequest("/admin/drivers/", {
        method: "POST",
        body: JSON.stringify({
          last_name: createForm.last_name,
          name: createForm.name.trim(),
          phone_number: createForm.phone_number,
          car_number: createForm.car_number,
          is_active: createForm.is_active,
        }),
      });
      setCreateForm({
        last_name: "",
        name: "",
        phone_number: "",
        car_number: "",
        is_active: true,
      });
      setCreateStatus({ loading: false, error: "", success: "Жолооч нэмэгдлээ." });
      setShowCreateForm(false);
      loadDrivers();
    } catch (err) {
      setCreateStatus({ loading: false, error: err.message, success: "" });
    }
  };

  return (
    <div className="admin-shell">
      <header className="admin-header">
        <h1>Driver rating system</h1>
      </header>
      <div className="admin-body">
        <AdminSidebar />
        <main className="admin-content">
          <h2>Жолоочийн жагсаалт</h2>
          <div className="card">
            <div className="card-actions">
              <button
                type="button"
                className="link-button"
                onClick={() => setShowCreateForm((prev) => !prev)}
              >
                Жолооч нэмэх
              </button>
            </div>
            {showCreateForm && (
              <div className="inline-form">
                <form className="grid grid-2" onSubmit={createDriver}>
                  <div>
                    <label>Овог</label>
                    <input
                      name="last_name"
                      value={createForm.last_name}
                      onChange={handleCreateChange}
                    />
                  </div>
                  <div>
                    <label>Нэр</label>
                    <input
                      name="name"
                      value={createForm.name}
                      onChange={handleCreateChange}
                      required
                    />
                  </div>
                  <div>
                    <label>Утасны дугаар</label>
                    <input
                      name="phone_number"
                      value={createForm.phone_number}
                      onChange={handleCreateChange}
                    />
                  </div>
                  <div>
                    <label>Машины дугаар</label>
                    <input
                      name="car_number"
                      value={createForm.car_number}
                      onChange={handleCreateChange}
                    />
                  </div>
                  <div className="grid-span">
                    <label className="checkbox-row">
                      <input
                        type="checkbox"
                        name="is_active"
                        checked={createForm.is_active}
                        onChange={handleCreateChange}
                      />
                      Идэвхтэй
                    </label>
                  </div>
                  <div className="grid-span form-actions">
                    <button type="submit" disabled={createStatus.loading}>
                      {createStatus.loading ? "Нэмж байна..." : "Хадгалах"}
                    </button>
                    <button
                      type="button"
                      className="secondary"
                      onClick={() => setShowCreateForm(false)}
                    >
                      Болих
                    </button>
                  </div>
                </form>
                {createStatus.error && <div className="error">{createStatus.error}</div>}
                {createStatus.success && <div className="success">{createStatus.success}</div>}
              </div>
            )}
            <div className="dashboard-filter">
              <label htmlFor="driver-filter">Жолоочийн нэр</label>
              <input
                id="driver-filter"
                type="text"
                placeholder="Хайх..."
                value={driverFilter}
                onChange={(event) => setDriverFilter(event.target.value)}
              />
            </div>
            {status.error && <div className="error">{status.error}</div>}
            {toggleError && <div className="error">{toggleError}</div>}
            {status.loading ? (
              <div>Loading...</div>
            ) : filteredDrivers.length === 0 ? (
              <div>Өгөгдөл алга.</div>
            ) : (
              <div className="table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Овог</th>
                      <th>Нэр</th>
                      <th>Утасны дугаар</th>
                      <th>Машины дугаар</th>
                      <th className="status-cell">Төлөв</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDrivers.map((driver) => (
                      <tr key={driver.id}>
                        <td>{driver.last_name || "-"}</td>
                        <td>{driver.name}</td>
                        <td>{driver.phone_number || "-"}</td>
                        <td>{driver.car_number || "-"}</td>
                        <td className="status-cell">
                          <button
                            type="button"
                            className={`status-toggle ${driver.is_active ? "active" : "inactive"}`}
                            onClick={() => toggleDriverActive(driver)}
                            disabled={toggleLoadingId === driver.id}
                          >
                            {toggleLoadingId === driver.id
                              ? "Түр хүлээнэ үү..."
                              : driver.is_active
                              ? "Идэвхтэй"
                              : "Идэвхгүй"}
                          </button>
                        </td>
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
