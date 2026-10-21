# תוכנית — Milestone 1: הקמת פרויקט ומסך ראשי

**מקורות:** `MILESTONES.md` (Milestone 1), `PRD.md`, `DESIGN.md` + `wireframes.png` / `mockups.png` / `style-guide.png`, `ARCHITECTURE.md` (סעיפים 1, 2.2, 2.6, 2.8, ADR-3).

**מטרה:** אפליקציית React + TypeScript + Vite שרצה מקומית ומציגה את המסך היחיד המעוצב — כותרת, שדה נושא, כפתור "צור בדיחה" וכרטיס בדיחה — **בלי** חיבור ל-AI ובלי בדיחות מזויפות.

**לא נכלל ב-Milestone הזה:** תיקיית `api/`, OpenAI, `.env` / `.env.example` (אין עדיין משתנים — ייווצרו ב-Milestone 2), `vite-plugin-pwa` / Manifest / Service Worker / אייקוני אפליקציה (Milestone 3), מצבי טעינה/שגיאה/Offline (Milestone 3), Vercel (Milestone 4).

---

## 1. הקמת הפרויקט

סביבה קיימת: Node 24, npm 11.

| קובץ | תוכן |
|---|---|
| `package.json` | שם `joke-in-a-click`, `"type": "module"`, `private: true`. סקריפטים: `dev` = `vite`, `build` = `tsc -b && vite build`, `preview` = `vite preview`, `typecheck` = `tsc -b --noEmit` (או מקביל). |
| תלויות | `react`, `react-dom`, `@fontsource/heebo`, `@fontsource/assistant` |
| תלויות פיתוח | `vite`, `@vitejs/plugin-react`, `typescript`, `@types/react`, `@types/react-dom` |
| `vite.config.ts` | `plugins: [react()]` בלבד. `server.host: true` כדי שניתן יהיה לפתוח גם מהטלפון ברשת הביתית (אופציונלי לבדיקה). |
| `tsconfig.json` + `tsconfig.app.json` + `tsconfig.node.json` | לפי תבנית Vite הסטנדרטית ל-React-TS, `strict: true`. |
| `index.html` | `<html lang="he" dir="rtl">`, `<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">`, `<meta name="theme-color" content="#F7AEB8">`, `<title>בדיחה בלחיצה</title>`, `<div id="root">`. |
| `src/vite-env.d.ts` | הפניה סטנדרטית ל-`vite/client`. |

- היצירה ידנית (לא דרך `npm create vite`) כדי לא להוסיף קבצי דוגמה מיותרים (לוגו React, ESLint וכו').
- `.gitignore` כבר מכסה `node_modules/` ו-`dist/` — אין צורך בשינוי.
- תיקיית `api/` לא נוצרת עכשיו; המבנה (`src/` ל-Frontend, `api/` ל-Backend בהמשך) מתועד ב-ARCHITECTURE ממילא.

## 2. מבנה קבצים

```text
index.html
src/
  main.tsx              # mount + import fonts + global CSS
  App.tsx               # the single screen
  App.css               # all styles (plain CSS, tokens in :root)
  devPreview.ts         # dev-only long-text samples (see §6)
  assets/
    kitten.jpg          # header photo (free license)
    kitten-CREDITS.md   # source URL, photographer, license
```

אין צורך בפיצול לרכיבים נוספים — מסך אחד, קומפוננטה אחת. אם `App.tsx` מתארך, מותר לפצל לרכיב `JokeCard` קטן; לא יותר.

## 3. גופנים (ADR-3)

- התקנת `@fontsource/heebo` ו-`@fontsource/assistant` — קובצי הגופן נארזים בתוך ה-Build ונטענים מאותו Origin, **בלי** Google Fonts.
- ב-`main.tsx` לייבא רק את המשקלים הדרושים: Heebo 400 + 700 (ו-500 אם נדרש לשאלה/כפתור), Assistant 400.
- `font-family: 'Heebo', 'Assistant', system-ui, sans-serif`.

## 4. צילום החתלתול

- לחפש ב-Unsplash או Pexels צילום חתלתול חמוד שמתאים לאווירת ה-Mockup (רצוי רקע ורוד/בהיר, חתלתול מביט קדימה).
- **לפני ההורדה — לעצור ולהציג למשתמשת את הקישור, שם הצלם, הרישיון וגודל הקובץ, ולבקש אישור.**
- לשמור ב-`src/assets/kitten.jpg`, מוקטן לרוחב סביר (כ-800px, עד ~150KB).
- `src/assets/kitten-CREDITS.md`: כתובת המקור, שם הצלם, סוג הרישיון (Unsplash License / Pexels License) ותאריך ההורדה.
- אייקוני האפליקציה ייגזרו מאותו צילום ב-Milestone 3 — לא עכשיו.

## 5. המסך — מבנה ותוכן

מלמעלה למטה, עמודה אחת ממורכזת, `max-width` כ-440px (במחשב: אותה עמודה צרה במרכז).

1. **אזור כותרת (header):** רקע Blush Pink עם קשת/גל תחתון רך לעבר הרקע הבהיר (כמו ב-Mockup, ב-CSS בלבד).
   - `<h1>` "בדיחה בלחיצה" — Heebo Bold 36px, צבע Charcoal, ממורכז.
   - תמונת החתלתול מתחת לכותרת, `alt="חתלתול חמוד"`.
   - קישוטים: כמה לבבות וקווי "ניצוץ" קטנים כ-SVG inline או תווים, `aria-hidden="true"`, ללא אינטראקציה.
   - **אין** אייקון תפריט.
2. **שאלה + שדה נושא:**
   - `<label for="topic">` "על מה תרצה בדיחה?" — H2, Heebo Bold 24px, Charcoal, ממורכז.
   - `<input id="topic" type="text" maxLength={100}>`, placeholder "לדוגמה: חתולים, עבודה, טכנולוגיה...", רקע לבן, מסגרת ורודה דקה, פינות 16–24px, יישור לימין.
   - אייקון טביעת כף קטן בצד השמאלי של השדה כקישוט בלבד (`aria-hidden`, `pointer-events: none`).
   - מתחת לשדה: מונה `{topic.length}/100` — Caption 14px, צבע Cocoa, מיושר לשמאל כמו ב-Mockup. מקושר ל-input ב-`aria-describedby`.
3. **כפתור "צור בדיחה":** רוחב כמעט מלא, צורת קפסולה, רקע Strong Pink `#E0507A` (מותר גרדיאנט עדין סביבו), טקסט לבן Bold, צל רך, אייקון ניצוצות קטן לצד הטקסט, קווי ניצוץ דקורטיביים בצדדים (`aria-hidden`).
4. **כרטיס בדיחה:** רקע Pale Pink, פינות ~24px, צל עדין, ללא כותרת אזור.
   - **מצב ריק:** אייקון סמיילי (SVG inline) עם קווי ניצוץ + הטקסט "הבדיחה תופיע כאן לאחר הלחיצה" (צבע Cocoa כהה מעט מ-`#8B5E4D` לשמירת ניגודיות על ורוד, או Charcoal), לבבות דקורטיביים בפינות.
   - **אזור טקסט בדיחה** (ישמש ב-Milestone 2): `<p dir="auto">` עם `white-space: pre-wrap`, `overflow-wrap: anywhere`, `word-break: break-word` — כדי שטקסט אנגלי יוצג LTR, טקסט ארוך יגלוש לשורות, וללא גלילה אופקית. הכרטיס גדל לגובה והעמוד נגלל אנכית.
   - `aria-live="polite"` על הכרטיס (מוכן לשלבים הבאים).

## 6. התנהגות ב-Milestone 1

- **State:** `topic: string` בלבד (`useState`). ה-State `joke` מוגדר כ-`string | null` ונשאר `null` בשימוש רגיל.
- **שדה נושא:** `maxLength={100}` מונע הקלדת תו 101 (גם בהדבקה); המונה מתעדכן בכל שינוי. לשקול שימוש ב-`[...topic].length` מול `maxLength` — `maxLength` של הדפדפן סופר יחידות UTF-16, ולכן המונה יספור `topic.length` כדי להיות עקבי איתו.
- **כפתור:** `disabled` במצב הזה. מתחתיו טקסט Caption קטן **רק בסביבת פיתוח** (`import.meta.env.DEV`): "יצירת בדיחות תחובר בשלב הבא". הכפתור המושבת עדיין צריך להיראות כמו ב-Mockup (אטימות מופחתת מעט בלבד), כדי שניתן יהיה לבדוק את העיצוב.
- **בדיקת טקסט ארוך (פיתוח בלבד):** `src/devPreview.ts` מחזיר טקסט בדיקה לפי פרמטר כתובת, ופועל רק כש-`import.meta.env.DEV`:
  - `?preview=long-he` — פסקה ארוכה בעברית.
  - `?preview=long-en` — פסקה ארוכה באנגלית, כולל מילה ארוכה מאוד ללא רווחים (לבדיקת גלישה).
  - הטקסט מתחיל ב-"[טקסט בדיקה לפיתוח]" כדי שלא ייראה כבדיחה של GPT-5. ב-Build של Production הקוד הזה לא פעיל.

## 7. CSS (`src/App.css`)

- משתני צבע ב-`:root`: `--blush-pink #F7AEB8`, `--pale-pink #FBD6DC`, `--cream #FFF4ED`, `--charcoal #2E2424`, `--cocoa #8B5E4D`, `--cocoa-dark` (גוון כהה יותר לטקסט על ורוד, לבדוק ניגודיות ≥ 4.5:1), `--white #FFFFFF`, `--strong-pink #E0507A`.
- טיפוגרפיה: H1 36px/700, H2 24px/700, Body 16px/400, Caption 14px/400.
- רדיוסים 16–24px; כפתור `border-radius: 999px`; צללים רכים (`0 6px 20px rgba(224,80,122,.18)` וכד').
- `body`: רקע Cream/ורוד בהיר, `margin: 0`, `overflow-x: hidden` כרשת ביטחון — אך הפריסה עצמה לא אמורה לחרוג (`box-sizing: border-box` לכולם, תמונה `max-width: 100%`).
- `padding` צדדי ~16–20px; `env(safe-area-inset-*)` לשוליים העליונים/תחתונים.
- מצב `:focus-visible` ברור לשדה ולכפתור.
- ללא Dark Mode (לא מוגדר ב-DESIGN).

## 8. בדיקות עצמיות (לפני סימון 🟡)

1. `npm install` ו-`npm run build` — ללא שגיאות TypeScript או Build.
2. `npm run dev`, פתיחה בדפדפן הפנימי בהדמיית מובייל (375×812 ו-360×740):
   - ארבעת הרכיבים מופיעים בסדר הנכון, אין תפריט, המראה דומה ל-Mockup.
   - `document.documentElement.dir === 'rtl'`, טקסטים בעברית ומיושרים נכון.
   - הקלדה/הדבקה של 101 תווים → נשמרים 100; המונה מראה `100/100`; מחיקה מעדכנת את המונה.
   - `scrollWidth <= clientWidth` (אין גלילה אופקית), גם עם `?preview=long-he` ו-`?preview=long-en`; טקסט האנגלית מוצג LTR.
   - הגופנים נטענים מקומית — אין בקשות רשת ל-`fonts.googleapis.com` / `fonts.gstatic.com`.
3. חיפוש ב-Repository אחר `sk-`, `OPENAI`, `api_key` — אין סודות.
4. צילום מסך לבדיקה מול ה-Mockup, תיקון פערים בולטים.
5. סגירת שרת הפיתוח בסיום.

## 9. סיום

- עדכון `CLAUDE.md` → "פקודות הרצה": הרצה `npm run dev`, בדיקות "אין" (בדיקת טיפוסים: `npm run build`).
- סימון 🟡 ליד כותרת Milestone 1 ב-`MILESTONES.md`.
- ללא commit.

## Definition of Done (מתוך MILESTONES.md) — איך נבדק

| תנאי | בדיקה |
|---|---|
| הפרויקט מותקן, נבנה ללא שגיאות TypeScript ונטען מקומית | §8.1 + §8.2 |
| ארבעת הרכיבים במסך יחיד, פריסה דומה למקורות העיצוב, ללא תפריט | צילום מסך מול Mockup/Wireframe |
| עברית ו-RTL; 100 תווים מתקבלים, תו 101 לא; המונה מתעדכן | הקלדה/הדבקה בדפדפן |
| אין גלילה אופקית במובייל; ניתן לבדוק טקסט ארוך בפיתוח | `?preview=long-he` / `long-en` + בדיקת `scrollWidth` |
| אין מפתחות API או סודות בקוד / Repository | חיפוש בקבצים (§8.3) |
