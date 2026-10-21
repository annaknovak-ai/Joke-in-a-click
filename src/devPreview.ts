// Dev-only sample texts for checking long / LTR content in the joke card.
// Usage: ?preview=long-he or ?preview=long-en. Disabled in production builds.

const SAMPLES: Record<string, string> = {
  'long-he':
    '[טקסט בדיקה לפיתוח] ' +
    'זהו טקסט ארוך בעברית שנועד לבדוק איך כרטיס הבדיחה מתנהג כשהתוכן ארוך במיוחד. '.repeat(8) +
    '\n\nשורה נוספת אחרי מעבר שורה, כדי לוודא שמעברי שורה נשמרים.',
  // English label so dir="auto" detects LTR from the first strong character
  'long-en':
    '[Dev preview text] ' +
    'This is a long English sample used to check that the joke card shows left-to-right text correctly and wraps nicely. '.repeat(6) +
    '\n\nAveryveryveryveryveryveryveryveryveryverylongwordwithoutanyspacesatalltocheckwrapping.',
};

export function getDevPreviewText(): string | null {
  if (!import.meta.env.DEV) return null;
  const key = new URLSearchParams(window.location.search).get('preview');
  return key ? (SAMPLES[key] ?? null) : null;
}
