import { useState } from "react";
import QuestionField from "./QuestionField.jsx";

export default function SurveyForm({ survey, drivers, driverSearch, formState, onChange, onSubmit }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleSelectDriver = (driver) => {
    onChange("driverId", driver.id);
    const displayName = `${driver.last_name ? `${driver.last_name} ` : ""}${driver.name}${driver.car_number ? ` [${driver.car_number}]` : ""}`;
    onChange("driverSearch", displayName);
    setIsDropdownOpen(false);
  };

  return (
    <form onSubmit={onSubmit}>
      <div className="card">
        <h3>{survey.title}</h3>
        {survey.description && <p>{survey.description}</p>}
        
        <div style={{ marginTop: "12px", position: "relative" }}>
          <label>Жолооч сонгох (Нэр эсвэл утас)</label>
          <input
            type="text"
            placeholder="Хайх..."
            value={driverSearch}
            onChange={(e) => {
              onChange("driverSearch", e.target.value);
              onChange("driverId", "");
              setIsDropdownOpen(true);
            }}
            onFocus={() => setIsDropdownOpen(true)}
            style={{ padding: "10px", borderRadius: "8px", border: "1px solid #cbd5f5", width: "100%" }}
            required
          />
          
          {isDropdownOpen && drivers.length > 0 && (
            <div style={{
              position: "absolute",
              top: "100%",
              left: 0,
              right: 0,
              backgroundColor: "white",
              border: "1px solid #cbd5f5",
              borderRadius: "8px",
              marginTop: "4px",
              maxHeight: "200px",
              overflowY: "auto",
              zIndex: 10,
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
            }}>
              {drivers.map((driver) => (
                <div
                  key={driver.id}
                  onClick={() => handleSelectDriver(driver)}
                  style={{
                    padding: "10px",
                    cursor: "pointer",
                    borderBottom: "1px solid #f0f0f0"
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = "#f7f7f8"}
                  onMouseLeave={(e) => e.target.style.backgroundColor = "transparent"}
                >
                  {driver.last_name && `${driver.last_name} `}{driver.name} 
                  {driver.car_number && ` [${driver.car_number}]`}
                  {driver.phone_number && ` (${driver.phone_number})`}
                </div>
              ))}
            </div>
          )}
          
          {drivers.length === 0 && driverSearch && isDropdownOpen && (
            <div style={{
              position: "absolute",
              top: "100%",
              left: 0,
              right: 0,
              backgroundColor: "white",
              border: "1px solid #cbd5f5",
              borderRadius: "8px",
              marginTop: "4px",
              padding: "10px",
              zIndex: 10,
              color: "red",
              fontSize: "14px"
            }}>
              Жолооч олдсонгүй.
            </div>
          )}
        </div>
      </div>
      <div className="card">
        {survey.questions.map((question) => (
          <QuestionField
            key={question.id}
            question={question}
            value={formState.answers[question.id] || {}}
            onChange={(questionId, payload) => onChange("answer", { questionId, payload })}
          />
        ))}
      </div>
      <button type="submit">Илгээх</button>
    </form>
  );
}
