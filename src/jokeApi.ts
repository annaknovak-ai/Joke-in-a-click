// Client for POST /api/joke. Never holds the OpenAI key — the backend does.

const GENERIC_ERROR = 'לא הצלחנו ליצור בדיחה כרגע. אפשר לנסות שוב.';

export async function fetchJoke(topic: string): Promise<string> {
  let res: Response;
  try {
    res = await fetch('/api/joke', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic }),
      cache: 'no-store',
    });
  } catch {
    throw new Error(GENERIC_ERROR);
  }

  const data: unknown = await res.json().catch(() => null);
  const body = (typeof data === 'object' && data !== null ? data : {}) as { joke?: unknown; message?: unknown };

  if (res.ok && typeof body.joke === 'string' && body.joke.trim()) return body.joke;
  throw new Error(typeof body.message === 'string' && body.message ? body.message : GENERIC_ERROR);
}
