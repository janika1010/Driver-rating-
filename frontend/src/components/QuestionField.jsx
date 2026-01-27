export default function QuestionField({ question, value, onChange }) {
  const handleRating = (event) => {
    onChange(question.id, { rating_value: Number(event.target.value) });
  };

  const handleText = (event) => {
    onChange(question.id, { text_value: event.target.value });
  };

  const handleSingleChoice = (event) => {
    onChange(question.id, { choice_ids: [Number(event.target.value)] });
  };

  const handleMultiChoice = (event) => {
    const choiceId = Number(event.target.value);
    const current = new Set(value.choice_ids || []);
    if (event.target.checked) {
      current.add(choiceId);
    } else {
      current.delete(choiceId);
    }
    onChange(question.id, { choice_ids: Array.from(current) });
  };

  return (
    <div className="card">
      <div style={{ fontWeight: 600, marginBottom: "8px" }}>{question.text}</div>
      {question.question_type === "rating" && (
        <div className="rating-scale" role="radiogroup" aria-label="Үнэлгээ сонгох">
          {[
            { value: 1, label: "Very bad", tone: "very-bad" },
            { value: 2, label: "Bad", tone: "bad" },
            { value: 3, label: "Okay", tone: "okay" },
            { value: 4, label: "Very good", tone: "very-good" },
            { value: 5, label: "Excellent", tone: "excellent" },
          ].map((item) => (
            <label key={item.value} className={`rating-option ${item.tone}`}>
              <input
                type="radio"
                name={`rating-${question.id}`}
                value={item.value}
                checked={Number(value.rating_value) === item.value}
                onChange={handleRating}
                required={question.is_required}
              />
              <span className="face" aria-hidden="true">
                <span className="eye left" />
                <span className="eye right" />
                <span className="mouth" />
              </span>
              <span className="rating-label">{item.label}</span>
            </label>
          ))}
        </div>
      )}
      {question.question_type === "text" && (
        <textarea
          rows="3"
          value={value.text_value || ""}
          onChange={handleText}
          required={question.is_required}
        />
      )}
      {question.question_type === "single" && (
        <div className="grid">
          {question.choices.map((choice) => (
            <label key={choice.id}>
              <input
                type="radio"
                name={`question-${question.id}`}
                value={choice.id}
                checked={(value.choice_ids || [])[0] === choice.id}
                onChange={handleSingleChoice}
                required={question.is_required}
              />
              {choice.text}
            </label>
          ))}
        </div>
      )}
      {question.question_type === "multi" && (
        <div className="grid">
          {question.choices.map((choice) => (
            <label key={choice.id}>
              <input
                type="checkbox"
                value={choice.id}
                checked={(value.choice_ids || []).includes(choice.id)}
                onChange={handleMultiChoice}
              />
              {choice.text}
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
