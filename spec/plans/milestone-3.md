# תוכנית — Milestone 3: חוויית שימוש שלמה והפעלת PWA

**מקורות:** `MILESTONES.md` (Milestone 3), `PRD.md` (FR-04, FR-05, Edge Cases, זרימות שגיאה ו-Offline), `ARCHITECTURE.md` (סעיפים 2.2, 2.3, 2.6, 2.7, 2.8, ADR-3), `DESIGN.md` (1.1 — מיקום הודעות, 2.1 — Theme Color, 2.4 — אייקונים מצילום החתלתול).

**מטרה:** זרימת יצירת הבדיחה אמינה וברורה במצבי טעינה, תקלה וניתוק; האפליקציה ניתנת להתקנה כ-PWA ונפתחת גם בלי אינטרנט — הכול נבדק מקומית במחשב, בהדמיית טלפון.

**לא נכלל ב-Milestone הזה:**
- פריסה ל-Vercel, `vercel.json`, כותרות אבטחה/Cache לקובצי Static ול-`sw.js` ב-Hosting (Milestone 4).
- בדיקות בטלפון אמיתי (Android / iPhone) והתקנה בפועל בטלפון (Milestone 4).
- כפתור "נסה שוב" נפרד, חלונית "גרסה חדשה זמינה", מודאלים או כל רכיב UI חדש שלא מוגדר ב-DESIGN.

---

## 1. תלויות

| חבילה | סוג | למה |
|---|---|---|
| `vite-plugin-pwa` | devDependency | Manifest, Service Worker (Workbox) ו-Precache לקובצי המעטפת (ARCHITECTURE 2.7) |
| `sharp` | devDependency | סקריפט חד-פעמי שגוזר את אייקוני האפליקציה מצילום החתלתול |

אין צורך ב-`workbox-window` (רישום ה-Service Worker נעשה אוטומטית ע"י הפלגין, `injectRegister: 'auto'`).

## 2. מבנה קבצים

```text
scripts/
  generate-icons.mjs     # one-off: crops kitten.jpg into PWA icons (sharp)
public/
  icons/
    icon-192.png         # 192x192
    icon-512.png         # 512x512
    icon-maskable-512.png# 512x512, kitten inside the safe zone on Blush Pink
    apple-touch-icon.png # 180x180 (iOS home screen)
src/
  jokeApi.ts             # error kinds: offline vs failed; client timeout
  App.tsx                # status state, loading text in card, lock against double requests
  App.css                # loading look, disabled button look
vite.config.ts           # VitePWA config; local API also in `vite preview`
index.html               # icon + apple-touch-icon links
package.json             # new devDependencies + "icons" script
.claude/launch.json      # add "preview" configuration (port 4173)
CLAUDE.md                # run commands: add build+preview for PWA/offline checks
spec/ARCHITECTURE.md     # ADR-6, ADR-7 (see section 8)
```

## 3. Client API — `src/jokeApi.ts`

הבחנה בין "אין חיבור" ל"תקלה" לפי PRD (Edge Cases):

- מחלקת שגיאה קטנה `JokeError` עם `kind: 'offline' | 'failed'` ו-`message` בעברית.
- **לפני** השליחה: אם `navigator.onLine === false` → `offline` מיד, בלי לשלוח בקשה.
- `fetch` נכשל בחריגה (הבקשה לא הגיעה לשרת: אין רשת, השרת לא זמין) → `offline` עם **"נדרש חיבור לאינטרנט כדי ליצור בדיחה"**.
- השרת השיב בשגיאה (4xx/5xx), או תשובה לא תקינה/בלי `joke` → `failed` עם ה-`message` מהשרת אם קיים, אחרת **"לא הצלחנו ליצור בדיחה כרגע. אפשר לנסות שוב."**.
- **Timeout בצד הלקוח:** `AbortSignal.timeout(65_000)` — מעט יותר מ-45 השניות של השרת, כדי שהכפתור לא יישאר נעול לעולם אם תשובה נתקעה. חריגת Timeout → `failed` (הבקשה כן הגיעה לשרת).
- נשאר: `cache: 'no-store'`, אין Retry אוטומטי.

## 4. מצבי המסך — `src/App.tsx`

**State** (לפי ARCHITECTURE 2.3): `topic`, `joke` (הבדיחה האחרונה בלבד), `status: 'idle' | 'loading' | 'success' | 'error' | 'offline'`, `errorMessage`.

**מניעת בקשות מקבילות:** בנוסף ל-`disabled` על הכפתור, `useRef` בוליאני שננעל מיד בתחילת `handleGenerate` — כך גם שתי נגיעות מהירות לפני רינדור מחדש לא ישלחו שתי בקשות. הנעילה משתחררת ב-`finally`.

**זרימה בלחיצה:**
1. אם נעול → לא עושים כלום.
2. `status = 'loading'`, מוחקים הודעת שגיאה קודמת. הנושא והבדיחה הקודמת **לא נמחקים** מה-State.
3. הצלחה → `joke` מוחלף, `status = 'success'`.
4. כשל → `status = 'offline'` או `'error'` לפי `kind`, `errorMessage` נקבע; `joke` נשאר כפי שהיה.

**תצוגה:**
- **כרטיס הבדיחה:** כש-`status === 'loading'` מוצג בתוכו **"מכין לך בדיחה..."** במקום התוכן הקודם (DESIGN 1.1). אחרת — הבדיחה (אם יש) או המצב הריק. כך, בכשל, הכרטיס חוזר אוטומטית להציג את הבדיחה הקודמת או את המצב הריק.
- **הודעת שגיאה/Offline:** מתחת לכפתור (כמו היום, `role="alert"`), בעברית.
- **הכפתור:** `disabled` ו-`aria-busy` בזמן טעינה; התווית "צור בדיחה" לא משתנה (ההודעה מוצגת בכרטיס, לא בכפתור).
- **נגישות:** הכרטיס כבר `aria-live="polite"`, כך שהודעת הטעינה והבדיחה החדשה מוקראות.
- `devPreview` (טקסטים ארוכים לבדיקה) נשאר, פעיל ב-Development בלבד.

## 5. עיצוב — `src/App.css`

- סגנון לשורת הטעינה בכרטיס: טקסט ממורכז, Charcoal/Cocoa כהה (ניגודיות ≥ 4.5:1 על Pale Pink), עם אנימציית "נשימה" עדינה של אייקון קטן קיים (למשל הסמיילי או הכף). האנימציה מכובה תחת `prefers-reduced-motion: reduce`.
- כפתור מושבת: מראה מעומעם מעט יותר מהיום כדי שיהיה ברור שאינו זמין, בלי לשבור את הניגודיות של הטקסט הלבן.
- גלילה של בדיחה ארוכה: הכרטיס גדל עם התוכן וכל העמוד גולל אנכית (כבר קיים: `pre-wrap`, `overflow-wrap: anywhere`). רק אימות — בלי גלילה פנימית בכרטיס ובלי גלילה אופקית.

## 6. PWA — `vite.config.ts` + אייקונים

### 6.1 אייקונים (`scripts/generate-icons.mjs`)
- מקור: `src/assets/kitten.jpg` (800×1200, לאורך). חיתוך ריבועי סביב פני החתלתול (בהתאם ל-`object-position: center 30%` שבמסך).
- `icon-192.png`, `icon-512.png`: החיתוך הריבועי כפי שהוא.
- `icon-maskable-512.png`: החתלתול מוקטן לכ-80% במרכז, על רקע Blush Pink `#F7AEB8`, כדי שלא ייחתך בעיגול/צורה של מערכת ההפעלה.
- `apple-touch-icon.png`: 180×180.
- הסקריפט רץ פעם אחת (`npm run icons`) והתוצרים נשמרים ב-`public/icons/`. קובץ `kitten-CREDITS.md` יעודכן במשפט שהאייקונים נגזרו מאותו צילום.

### 6.2 Manifest (ARCHITECTURE 2.7)
`name` ו-`short_name`: "בדיחה בלחיצה", `lang: "he"`, `dir: "rtl"`, `display: "standalone"`, `start_url: "/"`, `scope: "/"`, `theme_color: "#F7AEB8"`, `background_color: "#FFF4ED"` (Cream), ואייקוני 192, 512 ו-512 Maskable (`purpose: "maskable"`).

### 6.3 Service Worker (Workbox, `generateSW`)
- **Precache בלבד** — HTML, JS, CSS, אייקונים, תמונת החתלתול וקובצי הגופנים: `globPatterns: ['**/*.{html,js,css,png,jpg,woff2,webmanifest}']`. נכללים רק קובצי `woff2` (Chrome לא צריך את `woff`).
- `navigateFallback: '/index.html'` עם `navigateFallbackDenylist: [/^\/api\//]` — פתיחת `/` ב-Offline מוגשת מהמטמון.
- **אין `runtimeCaching` בכלל** → `/api/joke` לעולם לא נשמר במטמון ותמיד יוצא לרשת (ARCHITECTURE 2.3, 2.7).
- **מדיניות עדכון** (ADR-6): `registerType: 'prompt'` בלי חלונית — גרסה חדשה של המעטפת נטענת ברקע ונכנסת לתוקף בפתיחה הבאה של האפליקציה, ולא באמצע שימוש או באמצע בקשה פעילה. אין `skipWaiting`/רענון אוטומטי.
- Service Worker **לא** פעיל בשרת הפיתוח (`npm run dev`); הוא נבדק על ה-Build דרך `vite preview`.

### 6.4 `index.html`
הוספת `<link rel="icon" href="/icons/icon-192.png">` ו-`<link rel="apple-touch-icon" href="/icons/apple-touch-icon.png">`. ה-`theme-color` כבר קיים. קישור ה-Manifest מוזרק אוטומטית ע"י הפלגין.

## 7. בדיקה מקומית של ה-Build עם ה-API (ADR-7)

כיום ה-Middleware של `/api/joke` פועל רק ב-`npm run dev`, וב-Dev אין Service Worker. כדי לבדוק PWA, Offline ושגיאות **על אותה גרסה שתעלה לאוויר**:
- ה-Plugin `localApi` יחובר גם ל-`vite preview` (`configurePreviewServer`). ב-Preview אין `ssrLoadModule`, ולכן נוצר בו פעם אחת שרת Vite פנימי במצב Middleware (`createServer({ server: { middlewareMode: true }, appType: 'custom' })`) שטוען את אותו `api/joke.ts`. הקוד המשותף (המרת הבקשה והתשובה) יוצא לפונקציה אחת שמשמשת את שני המצבים.
- המפתח ממשיך להיטען מ-`.env` לתהליך השרת בלבד.
- `.claude/launch.json`: תצורה חדשה `preview` — `npm run build && npm run preview` (פורט 4173). סקריפט `package.json`: `"preview:pwa": "npm run build && vite preview"`.
- `CLAUDE.md` → פקודות הרצה: הוספת שורה לבדיקת PWA/Offline (`npm run preview:pwa`, כתובת http://localhost:4173).

## 8. ADRs ל-`ARCHITECTURE.md`

- **ADR-6: עדכון Service Worker בפתיחה הבאה** — הקשר: ARCHITECTURE 2.7 אוסר להחליף קבצים באמצע בקשה, ו-DESIGN אינו כולל חלונית עדכון. החלטה: `registerType: 'prompt'` בלי UI; הגרסה החדשה פעילה בפתיחה הבאה. השלכות: אחרי Deploy, משתמש שהאפליקציה פתוחה אצלו יראה את הגרסה החדשה רק אחרי סגירה ופתיחה.
- **ADR-7: API מקומי גם ב-`vite preview`** — הקשר: צריך לבדוק PWA ו-Offline על ה-Build. החלטה: ה-Middleware של ADR-1 מחובר גם ל-Preview. השלכות: אין צורך ב-Vercel לבדיקה; עדיין ייתכנו הבדלים קטנים מול Vercel, שייבדקו באבן דרך 4.

## 9. בדיקות (Claude, במחשב, בדפדפן המובנה בהדמיית טלפון 375×812)

על `npm run dev`:
1. לחיצה → "מכין לך בדיחה..." בכרטיס, הכפתור מושבת; בסיום הבדיחה מוחלפת והכפתור זמין שוב.
2. שתי לחיצות מהירות (כולל קריאה כפולה ל-`click()` ב-JS) → בקשה אחת בלבד ברשת.
3. **כשל שרת:** החלפה זמנית של `fetch` בדף (דרך כלי הבדיקה, לא בקוד) כך שיחזיר `502` → הודעת תקלה בעברית מתחת לכפתור, הבדיחה הקודמת והנושא נשארים. החזרת `fetch` המקורי → לחיצה נוספת מביאה בדיחה.
4. **"אין חיבור":** `fetch` שזורק חריגה, וגם `navigator.onLine = false` (הדמיה) → "נדרש חיבור לאינטרנט כדי ליצור בדיחה", בלי בדיחה חדשה. במקרה של `onLine = false` — אין בקשה ברשת כלל.
5. כשל בזמן מצב ריק → הכרטיס חוזר למצב הריק (סמיילי).
6. `?preview=long-he` ו-`?preview=long-en` → גלילה אנכית בלבד, `scrollWidth <= clientWidth`.

על `npm run preview:pwa` (Build):
7. ה-Manifest נטען ותקין (שם, `lang`, `dir`, `theme_color`, 3 אייקונים שקיימים בפועל); Service Worker רשום ופעיל (`navigator.serviceWorker.controller`).
8. Cache Storage מכיל את קובצי המעטפת, הגופנים, התמונה והאייקונים — **ואין בו** שום כתובת `/api/`.
9. יצירת בדיחה עובדת גם דרך ה-Preview (ה-API פעיל).
10. **Offline:** עצירת שרת ה-Preview ורענון הדף → המסך המלא נפתח מהמטמון (כולל גופנים ותמונה); לחיצה → הודעת ה-Offline. הפעלת השרת מחדש → לחיצה מביאה בדיחה.
11. אין `localStorage`/`sessionStorage`/IndexedDB עם בדיחות או נושאים; רענון מאפס נושא ובדיחה.
12. `npm run build` עובר ללא שגיאות TypeScript.
13. בסיום — סגירת כל השרתים שהופעלו לבדיקה.

## 10. בדיקה מול Definition of Done

| תנאי | איך נבדק |
|---|---|
| הודעת טעינה גלויה, אין בקשה נוספת, הכפתור חוזר להיות זמין | בדיקות 1–2 |
| כשל API/רשת בעברית, ניסיון חוזר עובד | בדיקות 3–5 |
| פתיחה ללא חיבור אחרי טעינה; ניסיון יצירה מציג הודעת Offline | בדיקה 10 |
| תנאי התקנת PWA ב-Chrome (Manifest, אייקונים, Service Worker) | בדיקות 7–8 |
| בדיחות/נושאים לא נשמרים, `/api/joke` לא במטמון | בדיקות 8, 11 (+ `Cache-Control: no-store` מ-Milestone 2) |
| הכול באותו מסך, בלי מודאלים/תפריטים/דפים | בדיקה ויזואלית בכל המצבים |
