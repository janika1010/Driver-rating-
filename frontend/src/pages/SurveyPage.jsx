import { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiRequest } from "../api.js";
import SurveyForm from "../components/SurveyForm.jsx";

export default function SurveyPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [survey, setSurvey] = useState(null);
  const [drivers, setDrivers] = useState([]);
  const [driverSearch, setDriverSearch] = useState("");
  const [formState, setFormState] = useState({ driverId: "", answers: {} });
  const [status, setStatus] = useState({ loading: true, error: "", success: "" });

  useEffect(() => {
    const loadSurvey = async () => {
      setStatus({ loading: true, error: "", success: "" });
      try {
        const surveyData = await apiRequest(`/surveys/active/${slug}/`);
        setSurvey(surveyData);
      } catch (err) {
        setStatus({ loading: false, error: err.message, success: "" });
      } finally {
        setStatus((prev) => ({ ...prev, loading: false }));
      }
    };
    loadSurvey();
  }, [slug]);

  const fetchDrivers = useCallback(async (search = "") => {
    try {
      const url = search ? `/drivers/active/?search=${encodeURIComponent(search)}` : "/drivers/active/";
      const driverData = await apiRequest(url);
      setDrivers(driverData);
    } catch (err) {
      console.error("Failed to fetch drivers", err);
    }
  }, []);

  useEffect(() => {
    fetchDrivers(driverSearch);
  }, [driverSearch, fetchDrivers]);

  const handleChange = (type, payload) => {
    if (type === "driverId") {
      setFormState((prev) => ({ ...prev, driverId: payload }));
      return;
    }
    if (type === "driverSearch") {
      setDriverSearch(payload);
      return;
    }
    if (type === "answer") {
      setFormState((prev) => ({
        ...prev,
        answers: {
          ...prev.answers,
          [payload.questionId]: {
            ...(prev.answers[payload.questionId] || {}),
            ...payload.payload,
          },
        },
      }));
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!survey) return;
    if (!formState.driverId) {
      setStatus({ loading: false, error: "Жолоочоо жагсаалтаас сонгоно уу.", success: "" });
      return;
    }
    setStatus({ loading: false, error: "", success: "" });

    const answers = survey.questions.map((question) => ({
      question_id: question.id,
      ...(formState.answers[question.id] || {}),
    }));

    try {
      await apiRequest("/responses/", {
        method: "POST",
        body: JSON.stringify({
          survey_id: survey.id,
          driver_id: Number(formState.driverId),
          answers,
        }),
      });
      setStatus({ loading: false, error: "", success: "" });
      setFormState({ driverId: "", answers: {} });
      navigate(`/survey/${slug}/success`);
    } catch (err) {
      setStatus({ loading: false, error: err.message, success: "" });
    }
  };

  if (status.loading) {
    return <main>Loading...</main>;
  }

  if (!survey) {
    return <main>No active survey found.</main>;
  }

  return (
    <>
      <header>
        <h1>NEXPRESS Delivery</h1>
      </header>
      <main>
        <SurveyForm
          survey={survey}
          drivers={drivers}
          driverSearch={driverSearch}
          formState={formState}
          onChange={handleChange}
          onSubmit={handleSubmit}
        />
        {status.error && <div className="error">{status.error}</div>}
        {status.success && <div className="success">{status.success}</div>}
      </main>
    </>
  );
}
