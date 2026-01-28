import { useEffect, useState } from "react";
import { apiRequest } from "../api.js";
import AdminSidebar from "../components/AdminSidebar.jsx";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [status, setStatus] = useState({ loading: true, error: "" });
  const [userFilter, setUserFilter] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createForm, setCreateForm] = useState({
    username: "",
    password: "",
    email: "",
    first_name: "",
    last_name: "",
    is_staff: false,
    is_active: true,
  });
  const [createStatus, setCreateStatus] = useState({ loading: false, error: "", success: "" });

  const loadUsers = async () => {
    setStatus({ loading: true, error: "" });
    try {
      const data = await apiRequest("/admin/users/");
      setUsers(data);
      setStatus({ loading: false, error: "" });
    } catch (err) {
      setStatus({ loading: false, error: err.message });
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const normalizedFilter = userFilter.trim().toLowerCase();
  const filteredUsers = normalizedFilter
    ? users.filter((user) => {
        const haystack = [
          user.username,
          user.email,
          user.first_name,
          user.last_name,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return haystack.includes(normalizedFilter);
      })
    : users;

  const formatBool = (value) => (value ? "Тийм" : "Үгүй");

  const handleCreateChange = (event) => {
    const { name, value, type, checked } = event.target;
    setCreateForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const createUser = async (event) => {
    event.preventDefault();
    setCreateStatus({ loading: true, error: "", success: "" });
    try {
      await apiRequest("/admin/users/", {
        method: "POST",
        body: JSON.stringify({
          username: createForm.username.trim(),
          password: createForm.password,
          email: createForm.email,
          first_name: createForm.first_name,
          last_name: createForm.last_name,
          is_staff: createForm.is_staff,
          is_active: createForm.is_active,
        }),
      });
      setCreateForm({
        username: "",
        password: "",
        email: "",
        first_name: "",
        last_name: "",
        is_staff: false,
        is_active: true,
      });
      setCreateStatus({ loading: false, error: "", success: "Хэрэглэгч нэмэгдлээ." });
      setShowCreateForm(false);
      loadUsers();
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
          <h2>Хэрэглэгчийн жагсаалт</h2>
          <div className="card">
            <div className="card-actions">
              <button
                type="button"
                className="link-button"
                onClick={() => setShowCreateForm((prev) => !prev)}
              >
                Хэрэглэгч нэмэх
              </button>
            </div>
            {showCreateForm && (
              <div className="inline-form">
                <form className="grid grid-2" onSubmit={createUser}>
                  <div>
                    <label>Хэрэглэгчийн нэр</label>
                    <input
                      name="username"
                      value={createForm.username}
                      onChange={handleCreateChange}
                      required
                    />
                  </div>
                  <div>
                    <label>Нууц үг</label>
                    <input
                      name="password"
                      type="password"
                      value={createForm.password}
                      onChange={handleCreateChange}
                      required
                    />
                  </div>
                  <div>
                    <label>И-мэйл</label>
                    <input
                      name="email"
                      value={createForm.email}
                      onChange={handleCreateChange}
                    />
                  </div>
                  <div>
                    <label>Нэр</label>
                    <input
                      name="first_name"
                      value={createForm.first_name}
                      onChange={handleCreateChange}
                    />
                  </div>
                  <div>
                    <label>Овог</label>
                    <input
                      name="last_name"
                      value={createForm.last_name}
                      onChange={handleCreateChange}
                    />
                  </div>
                  <div className="grid-span">
                    <label className="checkbox-row">
                      <input
                        type="checkbox"
                        name="is_staff"
                        checked={createForm.is_staff}
                        onChange={handleCreateChange}
                      />
                      Админ эрх
                    </label>
                    <label className="checkbox-row" style={{ marginLeft: "16px" }}>
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
              <label htmlFor="user-filter">Хэрэглэгчийн нэр</label>
              <input
                id="user-filter"
                type="text"
                placeholder="Хайх..."
                value={userFilter}
                onChange={(event) => setUserFilter(event.target.value)}
              />
            </div>
            {status.error && <div className="error">{status.error}</div>}
            {status.loading ? (
              <div>Loading...</div>
            ) : filteredUsers.length === 0 ? (
              <div>Өгөгдөл алга.</div>
            ) : (
              <div className="table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Хэрэглэгчийн нэр</th>
                      <th>И-мэйл</th>
                      <th>Нэр</th>
                      <th>Овог</th>
                      <th className="boolean-cell">Админ эрх</th>
                      <th className="boolean-cell">Идэвхтэй</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user) => (
                      <tr key={user.id}>
                        <td>{user.username}</td>
                        <td>{user.email || "-"}</td>
                        <td>{user.first_name || "-"}</td>
                        <td>{user.last_name || "-"}</td>
                        <td className="boolean-cell">{formatBool(user.is_staff)}</td>
                        <td className="boolean-cell">{formatBool(user.is_active)}</td>
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
