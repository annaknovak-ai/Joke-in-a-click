import { useState } from 'react';
import kittenUrl from './assets/kitten.jpg';
import { getDevPreviewText } from './devPreview';

const MAX_TOPIC_LENGTH = 100;

function Heart({ className }: { className: string }) {
  return (
    <svg className={`deco heart ${className}`} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 21s-7.5-4.6-9.6-9.2C.9 8.4 3 4.5 6.6 4.5c2.1 0 3.5 1.1 4.4 2.6.9-1.5 2.3-2.6 4.4-2.6 3.6 0 5.7 3.9 4.2 7.3C19.5 16.4 12 21 12 21z" />
    </svg>
  );
}

function Burst({ className }: { className: string }) {
  return (
    <svg className={`deco burst ${className}`} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 12h5M15 12h5M6 5l3.5 3.5M18 5l-3.5 3.5M6 19l3.5-3.5M18 19l-3.5-3.5" />
    </svg>
  );
}

function Sparkles() {
  return (
    <svg className="sparkles" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M10 3l1.6 4.4L16 9l-4.4 1.6L10 15l-1.6-4.4L4 9l4.4-1.6z" />
      <path d="M18 13l.9 2.1L21 16l-2.1.9L18 19l-.9-2.1L15 16l2.1-.9z" />
      <path d="M17 2l.6 1.4L19 4l-1.4.6L17 6l-.6-1.4L15 4l1.4-.6z" />
    </svg>
  );
}

function PawIcon() {
  return (
    <svg className="paw" viewBox="0 0 24 24" aria-hidden="true">
      <ellipse cx="6" cy="10" rx="2.2" ry="2.8" />
      <ellipse cx="10" cy="6" rx="2.2" ry="2.8" />
      <ellipse cx="14.5" cy="6" rx="2.2" ry="2.8" />
      <ellipse cx="18.5" cy="10" rx="2.2" ry="2.8" />
      <path d="M12.2 11.5c3 0 6.3 4.2 5.4 6.6-.8 2-3.3.9-5.4.9s-4.6 1.1-5.4-.9c-.9-2.4 2.4-6.6 5.4-6.6z" />
    </svg>
  );
}

function Smiley() {
  return (
    <svg className="smiley" viewBox="0 0 120 80" aria-hidden="true">
      <g className="smiley-rays">
        <path d="M20 26l8 5M16 40h10M20 54l8-5M100 26l-8 5M104 40H94M100 54l-8-5" />
      </g>
      <circle cx="60" cy="40" r="24" />
      <circle className="smiley-eye" cx="52" cy="35" r="2.6" />
      <circle className="smiley-eye" cx="68" cy="35" r="2.6" />
      <path d="M49 45c5 7 17 7 22 0" />
    </svg>
  );
}

export default function App() {
  const [topic, setTopic] = useState('');
  // Joke generation is connected in Milestone 2; until then only dev preview text can appear
  const [joke] = useState<string | null>(getDevPreviewText);

  return (
    <div className="app">
      <header className="hero">
        <Burst className="burst-title-right" />
        <Burst className="burst-title-left" />
        <h1 className="title">בדיחה בלחיצה</h1>
        <Heart className="h1" />
        <Heart className="h2" />
        <Heart className="h3" />
        <Heart className="h4" />
        <img className="kitten" src={kittenUrl} alt="חתלתול חמוד" width={260} height={260} />
      </header>

      <main className="content">
        <label className="question" htmlFor="topic">
          על מה תרצה בדיחה?
        </label>
        <div className="input-wrap">
          <input
            id="topic"
            className="topic-input"
            type="text"
            value={topic}
            maxLength={MAX_TOPIC_LENGTH}
            placeholder="לדוגמה: חתולים, עבודה, טכנולוגיה..."
            aria-describedby="topic-counter"
            autoComplete="off"
            onChange={(e) => setTopic(e.target.value)}
          />
          <PawIcon />
        </div>
        <div id="topic-counter" className="counter" dir="ltr">
          {topic.length}/{MAX_TOPIC_LENGTH}
        </div>

        <div className="button-row">
          <Burst className="burst-btn-right" />
          <button type="button" className="primary-button" disabled>
            <span>צור בדיחה</span>
            <Sparkles />
          </button>
          <Burst className="burst-btn-left" />
        </div>
        {import.meta.env.DEV && <p className="dev-note">יצירת בדיחות תחובר בשלב הבא</p>}

        <section className="joke-card" aria-live="polite">
          <Heart className="card-h1" />
          <Heart className="card-h2" />
          <Heart className="card-h3" />
          {joke ? (
            <p className="joke-text" dir="auto">
              {joke}
            </p>
          ) : (
            <div className="empty-state">
              <Smiley />
              <p>
                הבדיחה תופיע כאן
                <br />
                לאחר הלחיצה
              </p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
