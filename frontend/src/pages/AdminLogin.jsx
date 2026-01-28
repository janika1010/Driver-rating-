import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../api.js";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");

  const handleChange = (event) => {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    try {
      // Use FormData so browser autofill is captured reliably
      const formData = new FormData(event.currentTarget);
      const username = String(formData.get("username") || "").trim();
      const password = String(formData.get("password") || "");
      const payload = { username, password };

      const data = await apiRequest("/auth/login/", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      localStorage.setItem("admin_token", data.token);
      localStorage.setItem("admin_username", data.username || username);
      navigate("/admin/dashboard");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <main>
      <div className="card">
        <h2>Admin Login</h2>
        <form className="grid" onSubmit={handleSubmit}>
          <div>
            <label>Username</label>
            <input
              name="username"
              value={form.username}
              onChange={handleChange}
              autoComplete="username"
              required
            />
          </div>
          <div>
            <label>Password</label>
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              autoComplete="current-password"
              required
            />
          </div>
          <button type="submit">Login</button>
          {error && <div className="error">{error}</div>}
        </form>
      </div>
    </main>
  );
}
