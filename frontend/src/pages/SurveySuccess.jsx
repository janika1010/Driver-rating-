import { Link, useParams } from "react-router-dom";

export default function SurveySuccess() {
  const { slug } = useParams();

  return (
    <div className="success-page">
      <div className="success-card">
        <div className="success-icon" aria-hidden="true">
          <svg viewBox="0 0 64 64" role="img">
            <path
              d="M10 18h44v28H10z"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinejoin="round"
            />
            <path
              d="M10 18l22 16 22-16"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <h2>Судалгаа бөглөсөнд баярлалаа!</h2>
        <p>Таны хариулт амжилттай бүртгэгдлээ.</p>
      </div>
    </div>
  );
}
