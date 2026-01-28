import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../api.js";
import AdminSidebar from "../components/AdminSidebar.jsx";

const QUESTION_TYPES = [
  { value: "rating", label: "1-5 үнэлгээ" },
  { value: "text", label: "Чөлөөт текст" },
  { value: "single", label: "Нэг сонголт" },
  { value: "multi", label: "Олон сонголт" },
];

function newQuestion(order) {
  return { text: "", question_type: "rating", is_required: true, order, choices: [] };
}

export default function AdminSurveyAdd() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [questions, setQuestions] = useState([newQuestion(0)]);
  const [status, setStatus] = useState({ loading: false, error: "", success: "" });

  const canSubmit = useMemo(() => title.trim().length > 0, [title]);

  const addQuestion = () => {
    setQuestions((prev) => [...prev, newQuestion(prev.length)]);
  };

  const removeQuestion = (index) => {
    setQuestions((prev) => prev.filter((_, i) => i !== index));
  };

  const updateQuestion = (index, patch) => {
    setQuestions((prev) =>
      prev.map((q, i) => (i === index ? { ...q, ...patch } : q))
    );
  };

  const addChoice = (qIndex) => {
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === qIndex
          ? {
              ...q,
              choices: [...(q.choices || []), { text: "", order: (q.choices || []).length }],
            }
          : q
      )
    );
  };

  const updateChoice = (qIndex, cIndex, patch) => {
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === qIndex
          ? {
              ...q,
              choices: (q.choices || []).map((c, j) =>
                j === cIndex ? { ...c, ...patch } : c
              ),
            }
          : q
      )
    );
  };

  const removeChoice = (qIndex, cIndex) => {
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === qIndex
          ? { ...q, choices: (q.choices || []).filter((_, j) => j !== cIndex) }
          : q
      )
    );
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus({ loading: true, error: "", success: "" });
    try {
      const payload = {
        title: title.trim(),
        description: description.trim(),
        is_active: isActive,
        questions: questions
          .map((q, idx) => ({
            text: (q.text || "").trim(),
            question_type: q.question_type || "rating",
            is_required: Boolean(q.is_required),
            order: Number.isFinite(Number(q.order)) ? Number(q.order) : idx,
            choices:
              q.question_type === "single" || q.question_type === "multi"
                ? (q.choices || [])
                    .map((c, cIdx) => ({
                      text: (c.text || "").trim(),
                      order: Number.isFinite(Number(c.order)) ? Number(c.order) : cIdx,
                    }))
                    .filter((c) => c.text)
                : [],
          }))
          .filter((q) => q.text),
      };

      await apiRequest("/admin/surveys/", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      setStatus({ loading: false, error: "", success: "Амжилттай хадгаллаа." });
      navigate("/admin/surveys");
    } catch (err) {
      setStatus({ loading: false, error: err.message, success: "" });
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
            <h2>Судалгаа нэмэх</h2>
          </div>

          <div className="card">
            {status.error && <div className="error">{status.error}</div>}
            <form className="grid" onSubmit={handleSubmit}>
              <div className="grid-span">
                <label>Судалгааны нэр</label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="grid-span">
                <label>Тайлбар</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </div>

              <div>
                <label className="checkbox-row">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                  />
                  Идэвхтэй
                </label>
              </div>

              <div className="grid-span">
                <div className="admin-title-row" style={{ marginTop: 8 }}>
                  <h3 style={{ margin: 0 }}>Асуулт</h3>
                  <button type="button" className="secondary" onClick={addQuestion}>
                    Өөр асуулт нэмэх
                  </button>
                </div>

                {questions.length === 0 ? (
                  <div>Асуулт алга.</div>
                ) : (
                  questions.map((q, idx) => (
                    <div className="inline-form" key={`q-${idx}`}>
                      <div className="grid grid-2">
                        <div className="grid-span">
                          <label>Асуулт</label>
                          <input
                            value={q.text}
                            onChange={(e) => updateQuestion(idx, { text: e.target.value })}
                            required
                          />
                        </div>

                        <div>
                          <label>Асуултын төрөл</label>
                          <select
                            value={q.question_type}
                            onChange={(e) =>
                              updateQuestion(idx, { question_type: e.target.value })
                            }
                          >
                            {QUESTION_TYPES.map((t) => (
                              <option key={t.value} value={t.value}>
                                {t.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label>Дараалал</label>
                          <input
                            type="number"
                            value={q.order}
                            onChange={(e) => updateQuestion(idx, { order: e.target.value })}
                          />
                        </div>

                        <div>
                          <label className="checkbox-row">
                            <input
                              type="checkbox"
                              checked={Boolean(q.is_required)}
                              onChange={(e) =>
                                updateQuestion(idx, { is_required: e.target.checked })
                              }
                            />
                            Заавал эсэх
                          </label>
                        </div>
                      </div>

                      {(q.question_type === "single" || q.question_type === "multi") && (
                        <div style={{ marginTop: 12 }}>
                          <div className="admin-title-row" style={{ marginTop: 0 }}>
                            <h4 style={{ margin: 0 }}>Сонголтууд</h4>
                            <button
                              type="button"
                              className="secondary"
                              onClick={() => addChoice(idx)}
                            >
                              Сонголт нэмэх
                            </button>
                          </div>
                          {(q.choices || []).length === 0 ? (
                            <div>Сонголт алга.</div>
                          ) : (
                            (q.choices || []).map((c, cIdx) => (
                              <div
                                key={`q-${idx}-c-${cIdx}`}
                                className="grid grid-2"
                                style={{ marginTop: 8 }}
                              >
                                <div>
                                  <label>Сонголтын текст</label>
                                  <input
                                    value={c.text}
                                    onChange={(e) =>
                                      updateChoice(idx, cIdx, { text: e.target.value })
                                    }
                                    required
                                  />
                                </div>
                                <div>
                                  <label>Дараалал</label>
                                  <input
                                    type="number"
                                    value={c.order}
                                    onChange={(e) =>
                                      updateChoice(idx, cIdx, { order: e.target.value })
                                    }
                                  />
                                </div>
                                <div className="card-actions" style={{ gridColumn: "1 / -1" }}>
                                  <button
                                    type="button"
                                    className="danger"
                                    onClick={() => removeChoice(idx, cIdx)}
                                  >
                                    Сонголт устгах
                                  </button>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      )}

                      <div className="card-actions">
                        <button
                          type="button"
                          className="danger"
                          onClick={() => removeQuestion(idx)}
                          disabled={questions.length === 1}
                        >
                          Устгах
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="grid-span">
                <div className="card-actions">
                  <button type="submit" disabled={status.loading || !canSubmit}>
                    {status.loading ? "Хадгалж байна..." : "Хадгалах"}
                  </button>
                </div>
                {status.success && <div className="success">{status.success}</div>}
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}

