import { Route, Routes, Navigate } from "react-router-dom";
import AdminLogin from "./pages/AdminLogin.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import AdminSurveys from "./pages/AdminSurveys.jsx";
import AdminDrivers from "./pages/AdminDrivers.jsx";
import AdminUsers from "./pages/AdminUsers.jsx";
import AdminSurveyAddRedirect from "./pages/AdminSurveyAddRedirect.jsx";
import SurveyPage from "./pages/SurveyPage.jsx";
import SurveySuccess from "./pages/SurveySuccess.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/admin" replace />} />
      <Route path="/admin" element={<AdminLogin />} />
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      <Route path="/admin/surveys" element={<AdminSurveys />} />
      <Route path="/admin/surveys/survey/add" element={<AdminSurveyAddRedirect />} />
      <Route path="/admin/surveys/survey/add/" element={<AdminSurveyAddRedirect />} />
      <Route path="/admin/drivers" element={<AdminDrivers />} />
      <Route path="/admin/users" element={<AdminUsers />} />
      <Route path="/admin/surveys/:slug" element={<SurveyPage />} />
      <Route path="/survey/:slug" element={<SurveyPage />} />
      <Route path="/survey/:slug/success" element={<SurveySuccess />} />
    </Routes>
  );
}
