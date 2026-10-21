# תוכנית — Milestone 4: פריסה אוטומטית ובדיקת Production

**מקורות:** `MILESTONES.md` (Milestone 4), `ARCHITECTURE.md` (סעיפים 2.4, 2.7, 2.8, 3, ADR-1–7), `PRD.md`.
**נקודת פתיחה:** Milestones 1–3 ✅. ה-repo המקומי כבר מחובר ל-`https://github.com/annaknovak-ai/Joke-in-a-click` (branch `main`). אין עדיין חשבון/פרויקט Vercel.

## מטרה
להעלות את האפליקציה לכתובת HTTPS ציבורית ב-Vercel, כך שכל Push מאושר ל-`main` יפרוס אוטומטית ל-Production, ולבדוק אותה בטלפונים אמיתיים.

## עקרונות לביצוע
- **אין שינוי בפיצ'רים או בהתנהגות.** כל השינויים בקוד הם הגדרות פריסה ואבטחה בלבד.
- **אין Rate Limiting**, אין Database, אין Preview Environment (ADR-4), המודל נשאר `gpt-5`.
- **חשבונות ומפתחות — המשתמשת בלבד.** Claude לא נכנס לחשבון Vercel/OpenAI, לא מקליד מפתחות ולא מריץ `vercel` CLI. Claude מדריך צעד אחר צעד בשפה פשוטה.
- **כל Push ל-`main` = פריסה לאוויר.** לפני כל Push עוצרים ומבקשים אישור מפורש.
- לא קוראים את `.env`.

## 1. קבצים ליצור / לשנות

### 1.1 `vercel.json` (חדש, בשורש)
```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "framework": "vite",
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "functions": {
    "api/joke.ts": { "maxDuration": 60 }
  },
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "Content-Security-Policy", "value": "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'self'; manifest-src 'self'; worker-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'" }
      ]
    },
    {
      "source": "/sw.js",
      "headers": [{ "key": "Cache-Control", "value": "no-cache" }]
    },
    {
      "source": "/assets/(.*)",
      "headers": [{ "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }]
    }
  ]
}
```
הערות:
- `maxDuration: 60` גבוה מ-Timeout של 45 שניות ל-OpenAI (סעיף 2.5), ותואם לתוכנית Hobby.
- ה-CSP נבדק מול ה-Build הקיים: אין סקריפטים או סגנונות inline (`registerSW.js` הוא קובץ חיצוני, ואין `style=` ב-JSX), ולכן אפשר CSP הדוקה בלי `'unsafe-inline'`. ה-CSP מאפשרת Service Worker (`worker-src 'self'`).
- `sw.js` ללא Cache בדפדפן — כדי שגרסה חדשה תתגלה (ADR-6). קובצי `/assets/` עם Hash בשם — Cache ארוך.
- `/api/joke` כבר מחזיר `Cache-Control: no-store` מהקוד; לא משנים.
- אין צורך ב-Rewrites: מסך יחיד בכתובת `/`.

### 1.2 `package.json`
- הוספת `"engines": { "node": "24.x" }` — תואם לגרסה המקומית (v24) ולדרישות `openai` v7, וקובע גרסת Node.js ב-Vercel.

### 1.3 `api/joke.ts`
- **ללא שינוי לוגי.** אם בבדיקה ב-Vercel יתברר שהחתימה `export default { fetch }` (ADR-5) לא נתמכת — מעבר לייצוא `export async function POST(request)` (+ טיפול ב-405 לשיטות אחרות) באותה לוגיקה, ועדכון ה-Middleware המקומי ב-`vite.config.ts` בהתאם. זהו מסלול גיבוי בלבד.

### 1.4 `DEPLOYMENT.md` (חדש, בשורש)
מסמך קצר בעברית:
- כתובת ה-Production.
- איך הפריסה עובדת (Push ל-`main` ← Vercel פורס אוטומטית), ואיפה מוגדר `OPENAI_API_KEY` (Vercel → Settings → Environment Variables, Production בלבד).
- תוצאות בדיקות הקבלה ב-Production (מחשב, Android, iPhone).
- מגבלות ידועות של Chrome ב-iPhone (התקנה דרך Share → Add to Home Screen, אין חלונית התקנה אוטומטית, התנהגות Offline תלויה בגרסת iOS).
- תזכורת עלויות: OpenAI ו-Vercel עלולים לחייב; אין מכסת שימוש במוצר; הוגדרו תקרת הוצאה והתראת תקציב ב-OpenAI.

### 1.5 `CLAUDE.md` — סעיף "פקודות הרצה"
- הוספת שורה: **Production:** הכתובת ב-Vercel, ושהפריסה מתבצעת אוטומטית ב-Push ל-`main` (באישור בלבד).

### 1.6 `ARCHITECTURE.md` — ADR חדש
- **ADR-8: הגדרות פריסה וכותרות אבטחה ב-`vercel.json`** — הקשר (סעיפים 2.8, 3.2), החלטה (CSP הדוקה ללא inline, `maxDuration` 60, Cache ל-`sw.js`/`assets`, Node 24.x), השלכות (הוספת סקריפט/סגנון inline בעתיד תחייב עדכון CSP; הכותרות פעילות רק ב-Vercel, לא בהרצה מקומית).
- אם יופעל מסלול הגיבוי של 1.3 — עדכון ADR-5 בהתאם (באישור).

### 1.7 `MILESTONES.md`
- סימון 🟡 בסיום הבנייה.

## 2. סדר העבודה

### שלב א — הכנה מקומית (Claude)
1. יצירת `vercel.json`, עדכון `package.json`.
2. `npm run build` — ללא שגיאות.
3. בדיקה שאין מפתח ב-Build: חיפוש `sk-` ו-`OPENAI_API_KEY` בתיקיית `dist/` — אין תוצאות.
4. בדיקת `npm run preview:pwa` — האפליקציה עובדת כמו ב-Milestone 3 (השינויים לא אמורים להשפיע מקומית).

### שלב ב — חשבונות (המשתמשת, בהדרכה צעד אחר צעד)
5. **OpenAI:** הגדרת תקרת הוצאה חודשית (Budget / Usage limit) והתראת תקציב (Email alert) בחשבון OpenAI. Claude מסביר איפה לוחצים; המשתמשת בוחרת את הסכום.
6. **Vercel:** פתיחת חשבון Hobby עם "Continue with GitHub", ומתן הרשאה ל-Vercel לגשת ל-repo `Joke-in-a-click` בלבד.
7. **Import:** Add New → Project → בחירת ה-repo. בדיקה ש-Framework = Vite, Build = `npm run build`, Output = `dist` (נקבע גם ב-`vercel.json`).
8. **מפתח:** Settings → Environment Variables → `OPENAI_API_KEY`, מסומן **Production בלבד**, מסוג Sensitive. המשתמשת מדביקה את המפתח בעצמה.

> הערה: ה-Import עשוי לבצע פריסה ראשונה מיד, מהקוד שכבר ב-`main` (Milestone 3, בלי `vercel.json`). זה תקין — היא תתעדכן אחרי ה-Push בשלב ג. אם המפתח הוגדר אחרי הפריסה הראשונה, יצירת בדיחה תיכשל עד הפריסה הבאה.

### שלב ג — Push ראשון (באישור מפורש)
9. **עצירה:** Claude מציג מה ייכנס ל-Commit ומבקש אישור ל-Push ל-`main`.
10. לאחר אישור: commit + push. Vercel מתחיל פריסה אוטומטית — זו גם הבדיקה של "עדכון ב-`main` מוביל לפריסה אוטומטית".
11. המשתמשת מוסרת ל-Claude את כתובת ה-`*.vercel.app` (או ש-Claude מזהה אותה ממה שהמשתמשת מעתיקה מלוח הבקרה).

### שלב ד — בדיקות Production (Claude, מהמחשב)
12. בדיקות HTTP מול הכתובת (באמצעות `curl` ודפדפן מובנה):
    - `GET /` → 200 ב-HTTPS, כולל כותרות האבטחה וה-CSP.
    - `POST /api/joke` עם `{"topic":"חתולים"}` → 200 + בדיחה בעברית, `Cache-Control: no-store`.
    - `POST` עם `{"topic":"cats"}` → בדיחה באנגלית; `{}` / `{"topic":"   "}` → בדיחה כללית בעברית.
    - נושא באורך 101 תווים → 400 `INVALID_TOPIC`; גוף מעל 2KB → 413; `GET /api/joke` → 405; JSON שבור → 400.
    - התגובות אינן מכילות את המפתח.
13. בדפדפן (בהדמיית טלפון): המסך נטען, אין שגיאות CSP בקונסול, Manifest תקין, Service Worker רשום; יצירת בדיחה; מצב Offline (ניתוק רשת ב-DevTools) → הממשק נפתח והודעת "נדרש חיבור לאינטרנט כדי ליצור בדיחה" מופיעה.
14. בדיקה שה-Bundle שהוגש מ-Vercel (`/assets/*.js`) אינו מכיל את המפתח.
15. בדיקת Function Logs ב-Vercel (המשתמשת מציגה/מעתיקה): רק מטא-נתונים (`ok (…ms)`), בלי נושא ובלי בדיחה.

### שלב ה — בדיקות בטלפונים אמיתיים (המשתמשת, לפי רשימה של Claude)
16. **Android + Chrome:** פתיחת הכתובת; RTL תקין; בדיחה בנושא בעברית, באנגלית ובשדה ריק; שתי לחיצות עוקבות מחליפות בדיחה; מצב טיסה → הודעת Offline והבדיחה הקודמת נשארת; התקנה ("Install app" / "הוספה למסך הבית"); פתיחה מהאייקון במצב טיסה.
17. **iPhone + Chrome:** אותן בדיקות; התקנה דרך Share → Add to Home Screen (אם זמין בגרסת ה-iOS); פתיחה מהאייקון Offline. מה שלא עובד — מתועד כמגבלה ב-`DEPLOYMENT.md`, לא מתוקן בכוח.
18. המשתמשת מדווחת תוצאות; Claude מתעד אותן ב-`DEPLOYMENT.md`.

### שלב ו — סיום
19. עדכון `DEPLOYMENT.md`, `CLAUDE.md` (כתובת Production), ADR-8, וסימון 🟡 ב-`MILESTONES.md`.
20. **עצירה:** השינויים התיעודיים האלה ייכנסו לאוויר רק ב-Push הבא — שיתבצע כשהמשתמשת תבקש "דחוף שינויים לגיטהאב" (שהוא גם אישור ה-Milestone).

## 3. מיפוי ל-Definition of Done

| תנאי | איך נבדק |
|---|---|
| כתובת HTTPS מציגה את המסך וה-API באותו Origin | שלב ד, סעיפים 12–13 |
| בדיקות Milestones 1–3 עוברות ב-Production | שלב ד (מחשב) + שלב ה (טלפונים) |
| המפתח לא חשוף ל-Frontend / Repository / תגובות API | סעיפים 3, 12, 14; `.env` ב-`.gitignore`; המפתח רק ב-Vercel |
| Push מאושר ל-`main` ← פריסה אוטומטית | שלב ג, סעיף 10 |
| תקרת הוצאה והתראת תקציב ב-OpenAI | שלב ב, סעיף 5 (אישור מהמשתמשת) |
| התקנה ו-Offline נבדקו במכשירים; מגבלות iPhone תועדו | שלב ה + `DEPLOYMENT.md` |
| הובהרו סיכוני העלות | הסבר בצ'אט + `DEPLOYMENT.md` |

## 4. מחוץ לתחום
- Domain מותאם אישית, Analytics, ניטור חיצוני, Rate Limiting, בדיקת `Origin`, סביבת Preview, GitHub Actions.
- כל שינוי בעיצוב, בטקסטים או בהתנהגות.

## 5. סיכונים ומה עושים
- **`gpt-5` לא זמין בחשבון / הוסר:** עוצרים ושואלים (ADR-2). לא מחליפים מודל.
- **החתימה `{ fetch }` לא עובדת ב-Vercel:** מסלול הגיבוי בסעיף 1.3.
- **CSP חוסמת משהו ב-Production:** מזהים בקונסול, מרחיבים את הכלל המינימלי הנדרש בלבד, ומעדכנים את ADR-8.
- **Timeout של Vercel:** אם בדיחות נכשלות אחרי ~10 שניות — לוודא ש-`maxDuration` נקלט (Settings → Functions).
