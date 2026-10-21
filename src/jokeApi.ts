// Client for POST /api/joke. Never holds the OpenAI key — the backend does.

const GENERIC_ERROR = 'לא הצלחנו ליצור בדיחה כרגע. אפשר לנסות שוב.';
const OFFLINE_ERROR = 'נדרש חיבור לאינטרנט כדי ליצור בדיחה';
// A bit longer than the server's 45s OpenAI timeout, so the button never stays locked forever
const CLIENT_TIMEOUT_MS = 65_000;

// 'offline': the request never reached the server; 'failed': the server answered with an error
export class JokeError extends Error {
  readonly kind: 'offline' | 'failed';

  constructor(kind: 'offline' | 'failed', message: string) {
    super(message);
    this.kind = kind;
  }
}

export async function fetchJoke(topic: string): Promise<string> {
  if (!navigator.onLine) throw new JokeError('offline', OFFLINE_ERROR);

  let res: Response;
  try {
    res = await fetch('/api/joke', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic }),
      cache: 'no-store',
      signal: AbortSignal.timeout(CLIENT_TIMEOUT_MS),
    });
  } catch (e) {
    // Timeout means the server got the request but did not answer in time
    if (e instanceof DOMException && e.name === 'TimeoutError') throw new JokeError('failed', GENERIC_ERROR);
    throw new JokeError('offline', OFFLINE_ERROR);
  }

  const data: unknown = await res.json().catch(() => null);
  const body = (typeof data === 'object' && data !== null ? data : {}) as { joke?: unknown; message?: unknown };

  if (res.ok && typeof body.joke === 'string' && body.joke.trim()) return body.joke;
  throw new JokeError('failed', typeof body.message === 'string' && body.message ? body.message : GENERIC_ERROR);
}
