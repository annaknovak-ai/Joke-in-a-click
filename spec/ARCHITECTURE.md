# ARCHITECTURE — בדיחה בלחיצה

**תאריך מחקר:** 21 באוקטובר 2026  
**מסמך מקור:** `PRD.md`  
**סטטוס:** ארכיטקטורה נבחרת למימוש

## 1. Technology Stack שנבחר

| רכיב | טכנולוגיה | תפקיד |
|---|---|---|
| Frontend | React + TypeScript | מסך יחיד, ניהול מצב טעינה/שגיאה והצגת בדיחות |
| Build / Dev | Vite | כלי פיתוח ובניית Frontend סטטי |
| Styling | CSS רגיל | עיצוב צבעוני, קליל, רספונסיבי ו-RTL ללא ספריית UI כבדה |
| PWA | `vite-plugin-pwa` (מבוסס Workbox) | Web App Manifest, Service Worker ומטמון Offline לקובצי הממשק |
| Backend | TypeScript ב-Node.js, באמצעות Vercel Function | Endpoint מוגן ליצירת בדיחה וקריאה ל-OpenAI; ללא שרת Express קבוע |
| AI | OpenAI SDK הרשמי ל-Node.js, Responses API, מודל `gpt-5` | יצירת טקסט הבדיחה |
| Hosting | Vercel | אירוח אתר סטטי ו-Serverless Function באותו Domain, HTTPS ו-Deployment |
| Source Control | Git + GitHub | Repository יחיד ותיעוד שינויים |
| סודות | Vercel Environment Variables / `.env` מקומי (עם `.env.example` ללא ערכים) | מפתח API ב-Backend בלבד |
| Database / Authentication | לא נדרשים | אין נתונים לשימור ואין חשבונות משתמשים |

### נימוקים לבחירה

- **React + Vite:** שילוב מוכר, מתועד ונוח לכלי AI. נבחנו גם Vue ו-Next.js; לפרויקט של מסך יחיד ללא SEO דינמי, ניהול משתמשים או Server-Side Rendering, React עם Vite פשוט יותר מ-Next.js, ונהנה מאקוסיסטם רחב. TypeScript מאפשר לשתף טיפוסים בין צד לקוח וצד שרת.
- **Vercel Function במקום Express Server:** נבחנה חלופה של Express בשרת מתמשך, וגם Functions במסגרת Next.js. Endpoint יחיד קל למימוש כ-Function ללא תחזוקת שרת או Framework נוסף. Vercel תומך ישירות בפרויקט Vite ובתיקיית `api/`.
- **Vercel במקום פיצול GitHub Pages + Backend חיצוני:** GitHub Pages מתאים ל-Frontend סטטי בלבד, אך כאן נדרש Backend ששומר סוד. פריסה מאוחדת ב-Vercel מקטינה מורכבות, מאפשרת Endpoint מאותו Origin ומבצעת פריסות אוטומטיות מ-GitHub. נבחנה גם חלופת Cloudflare Pages/Workers; Vercel נבחר בזכות נתיב הפריסה הישיר המועדף ובשל תמיכת Node.js.
- **PWA באמצעות vite-plugin-pwa:** נבחנו Service Worker ידני והפלגין; הפלגין מפחית תחזוקת Manifest ומדיניות caching. אין צורך בתוספות Offline לשמירת בדיחות.
- **OpenAI Responses API:** ממשק רשמי ליצירת טקסט ב-GPT-5; אין צורך ב-Agent, ב-RAG או בשירותי AI נוספים.
- **ללא Database, Redis, Supabase, Blob Storage, Authentication או ORM:** אין דרישה לשמירת משתמשים, בדיחות או קבצים.

### סיכונים ומגבלות חשובים

1. **מודל `gpt-5` מסומן Deprecated** בתיעוד הרשמי נכון למועד המחקר. הוא נשאר הבחירה המחייבת לפי ה-PRD; אין מעבר אוטומטי ל-GPT-5 Mini, GPT-6 או למודל אחר. אם המודל אינו זמין לחשבון או מוסר מה-API, יש להציג כשל ולהעלות החלטת מוצר חדשה. מומלץ לוודא גישה מעשית לחשבון OpenAI לפני פריסה.
2. **אין הגבלת מספר בדיחות או Rate Limiting של המוצר.** כל בקשה מוצלחת מחייבת בדרך כלל תשלום לפי Tokens, ואף משתמש אנונימי יכול לצרוך תקציב. קיימות עדיין מגבלות ותקרות של ספקי Hosting ו-OpenAI; לכן לא ניתן להבטיח אינסוף בקשות בפועל. ניתן להשתמש בהתראות תקציב וניטור עלויות *תפעוליים* בלי להטיל מכסה על משתמשים; אם מתגלה שימוש לרעה, אין להוסיף חסימת קצב עסקית ללא שינוי ב-PRD.
3. **התאמת iPhone/Chrome ל-PWA:** ב-iOS התקנה למסך הבית דרך Chrome תלויה ביכולות הדפדפן וגרסת iOS; תפריט שיתוף ו-Add to Home Screen עשויים להחליף את חלונית ההתקנה שקיימת ב-Android. נדרשת בדיקה במכשיר אמיתי. אין להבטיח חוויית התקנה זהה בשני המכשירים.
4. **Vercel Functions:** קיימים Timeout, תקרות שימוש ותנאי תוכנית. במקרה של עיכוב ארוך של OpenAI תוחזר שגיאה. Vercel Hobby מיועד לשימוש אישי לא מסחרי בלבד; הפרויקט מוגדר כשימוש אישי/לימודי, ולכן Hobby מתאים. אם ייעשה שימוש מסחרי — תידרש תוכנית בתשלום.
5. **איכות הבדיחה ושפה:** זיהוי שפת הנושא והיענות המודל הן הסתברותיות. המשתמש יכול להזין טקסט בשפות מעורבות; ה-Prompt יורה למודל להשתמש בשפה הדומיננטית של הנושא.

## 2. ארכיטקטורת המערכת

### 2.1 מבנה כללי

```text
Android / iPhone Chrome (או PWA מותקנת)
      |
      | HTTPS: Static Assets + POST /api/joke
      v
Vercel (אותו Origin)
      |                         
      +-- Static React/Vite app  
      |    +-- מסך יחיד RTL
      |    +-- Service Worker + Cache למעטפת Offline
      |    +-- State זמני בזיכרון
      |
      +-- Node.js Serverless Function: /api/joke
               +-- אימות קלט / טיפול שגיאות
               +-- System instructions
               +-- OpenAI SDK (Secret בשרת)
                         |
                         v
                    OpenAI Responses API
                      model: gpt-5
```

ה-Frontend אינו שולח בקשות ישירות ל-OpenAI. רק ה-Backend מכיר את ה-API Key. כל רכיבי המערכת באותו Vercel Project ובאותו Origin. אין שרת מתמשך ואין בסיס נתונים.

### 2.2 חלוקה ל-Modules ולשכבות

| שכבה / Module | אחריות |
|---|---|
| Presentation | כותרת "בדיחה בלחיצה", קלט נושא עד 100 תווים, לחצן יצירה, אזור בדיחה, חיווי טעינה ושגיאה; פריסה למובייל ו-RTL |
| Client State | נושא נוכחי, בדיחה אחרונה, `idle/loading/success/error/offline` ונעילת לחצן בעת קריאה |
| Client API | `fetch('/api/joke')`, בדיקת תשובות, שגיאות תקשורת; ללא מפתח OpenAI |
| PWA Runtime | Manifest, Service Worker, מטמון לקובצי האפליקציה ועמוד הראשי לפתיחה Offline |
| API Boundary | `POST /api/joke`, בדיקת Method, JSON וגודל הקלט, תשובה בפורמט אחיד |
| Joke Generation | System Prompt מוגדר בשרת, בניית בקשה, שליחת בקשה חדשה ועצמאית ל-GPT-5 וחילוץ הבדיחה |
| Configuration | טעינת מפתח OpenAI בשרת בלבד וטיפול במקרה שהוא חסר |

אין הצדקה להוספת שכבת Repository, CQRS, Queue, Event Bus או Microservices.

### 2.3 Data Model ושמירת נתונים

אין אחסון מתמשך של מידע עסקי. כל נתוני המשתמש קיימים בזיכרון Frontend כל עוד המסך פתוח:

- `topic: string` — נושא נוכחי (0–100 תווים; `""` = בדיחה כללית).
- `joke: string | null` — הבדיחה המוצגת האחרונה בלבד.
- `status: 'idle' | 'loading' | 'success' | 'error' | 'offline'` — מצב הממשק.
- `errorMessage: string | null` — הודעה בעברית, אם יש.

אין `localStorage` לבדיקות היסטוריה או להתמדה של בדיחות, ואין Cookies ל-Session. Cache של Service Worker מיועד **לקובצי המעטפת בלבד**, לא לתגובות AI, נושאים או בדיחות. רענון רגיל יכול לאפס את הנושא והבדיחה; לא נדרשת המשכיות בין ביקורים.

### 2.4 API ציבורי של האפליקציה

**Endpoint:** `POST /api/joke`  
**Content-Type:** `application/json`  
**Body:**

```json
{ "topic": "חתולים" }
```

`topic` הוא string אופציונלי (אפשר גם מחרוזת ריקה או שדה חסר). השרת יבצע `trim`; רווחים בלבד שקולים לנושא ריק. התוכן חייב להיות באורך עד 100 תווים לאחר ניקוי רווחי קצה; השרת יאמת גם ללא הסתמכות על הגבלת ה-UI. אין להרחיב אורך קלט דרך API ישיר.

**הצלחה — `200`:**

```json
{ "joke": "למה החתול התיישב ליד המחשב? כי הוא רצה לתפוס את העכבר!" }
```

**כשל קלט — `400`:**

```json
{ "error": "INVALID_TOPIC", "message": "יש להזין נושא באורך של עד 100 תווים" }
```

**כשל יצירה — `502` (או `503` לשירות שאינו זמין):**

```json
{ "error": "GENERATION_FAILED", "message": "לא הצלחנו ליצור בדיחה כרגע. אפשר לנסות שוב." }
```

- בקשה בשיטה שאינה `POST`: `405` עם שגיאה אחידה.
- JSON לא תקין, טיפוס לא נכון או קלט גדול מדי: `400` / `413` בהתאמה; הגדרת גבול גודל גוף בקשה קטן התואם 100 תווים, בנוסף לאימות שדה.
- `Cache-Control: no-store` לתשובות `/api/joke`, כולל הצלחות וכשלים.
- אין Retry אוטומטי בשרת, כדי להימנע מחיובי AI כפולים; ניסיון חוזר מתבצע ביוזמת המשתמש.
- אין צורך ב-CORS פתוח: ה-Frontend פונה ל-API מאותו Origin. ניתן לדחות `Origin` חיצוני כאשר הכותרת קיימת, אך אין לראות בכך Authentication או הגנה מפני שימוש בתוכנות חיצוניות.
- בהיעדר Authentication ה-Endpoint פומבי. אין להסתמך על הסתרת כתובת ה-Endpoint כעל אבטחה.

### 2.5 יצירת בדיחה ב-OpenAI

- להשתמש ב-OpenAI SDK הרשמי ב-Backend וב-`client.responses.create` עם `model: 'gpt-5'`, `store: false`, `reasoning: { effort: 'minimal' }` ובקשת Text בלבד. רמת חשיבה מינימלית נבחרה כדי לקצר את זמן ההמתנה ולהוזיל כל בדיחה (ראה ADR-2).
- להשתמש ב-`instructions` קבועים ומבודדים מהקלט: לייצר בדיחה חדשה המתייחסת לנושא; כשאין נושא, בדיחה כללית בעברית; עם נושא — בשפה הדומיננטית של הנושא; הבדיחה מתאימה לכל גיל ואינה פוגענית, גם כשהנושא רגיש; אין סגנון או אורך קבועים.
- להעביר את הנושא בתור **נתון משתמש** ולא כהוראות מערכת; להבהיר ל-AI שאין לבצע הוראות מוטמעות בנושא המשנות את תפקידו או דורשות לחשוף סודות.
- כל לחיצה מייצרת קריאה עצמאית ללא Conversation ID וללא צבירת היסטוריה. בקשה חוזרת עשויה להפיק בדיחה דומה, אך יש לבקש גיוון; לא ניתן להבטיח ייחוד מוחלט ללא היסטוריה.
- לבדוק ש-`output_text` הוא string שאינו ריק; אם חסר או אם ה-API מחזיר שגיאה, להחזיר שגיאה אחידה ללקוח.
- להגדיר Timeout ברמת הבקשה ל-OpenAI, למשל 45 שניות, ומגבלת ביצוע ב-Vercel גבוהה ממנו (למשל 60 שניות, בכפוף לתוכנית). אין להציב מגבלה קשיחה על אורך הטקסט של הבדיחה ברמת המוצר. מגבלות טכניות של המודל והספק עדיין חלות.
- לא לשמור נושא, בדיחה או תגובת מודל בלוגים. ניתן לרשום מטא-נתונים לא-רגישים (קוד שגיאה, משך פעולה) לצורך אבחון.

### 2.6 Data Flow ו-UX

1. המשתמש פותח את האתר או את ה-PWA; רכיבי ה-UI נטענים מהשרת או מ-Cache מקומי.
2. הנושא מוקלד (עד 100 תווים), או נשאר ריק.
3. לחיצה על לחצן יצירת הבדיחה משנה את המצב ל-`loading`, מציגה **"מכין לך בדיחה..."** ומשביתה את הלחצן.
4. Frontend שולח בקשת `POST /api/joke` ללא API Key.
5. Backend מאמת קלט, מכין הוראות ופונה ל-OpenAI עם הסוד הסביבתי.
6. בהצלחה מתקבלת הבדיחה; Frontend מחליף את הבדיחה הקודמת, מסתיר את הודעת הטעינה ומאפשר לחיצה חדשה.
7. בכשל נשמרת היכולת לנסות שוב ומוצגת הודעת שגיאה בעברית. אין למחוק את הנושא שהמשתמש הזין. בדיחה קודמת, אם קיימת, תישאר מוצגת עד להחלפה מוצלחת.
8. בהיעדר אינטרנט האפליקציה עדיין נפתחת מתוך Cache; ניסיון לייצר מציג **"נדרש חיבור לאינטרנט כדי ליצור בדיחה"**, ללא ניסיון לייצר תשובה מזויפת Offline.

**נגישות בסיסית:** תווית נושא מקושרת לשדה; כפתור ניתן לשימוש במגע ובמקלדת; `aria-live` מתון לחיווי טעינה/שגיאה ותוכן בדיחה; ניגודיות וטקסט קריא; שימוש ב-`dir="rtl"` לאתר והצגת בדיחה בהתאם לשפה שזוהתה, באמצעות `dir="auto"` על אזור הבדיחה. הטקסט מוצג כטקסט פשוט, לא כ-HTML שמיוצר על ידי AI.

### 2.7 PWA, תמיכה במכשירים ו-Offline

- Web App Manifest כולל `name` ו-`short_name`: **"בדיחה בלחיצה"**, `lang: "he"`, `dir: "rtl"`, `display: "standalone"`, `start_url: "/"`, `scope: "/"`, צבעי Theme ואייקוני PNG 192×192 ו-512×512 (לרבות Maskable במידת האפשר).
- `theme_color`: Blush Pink `#F7AEB8` (לפי DESIGN). האייקונים נגזרים מצילום החתלתול.
- Service Worker דרך `vite-plugin-pwa` יקבע Precache ל-HTML, JS, CSS, אייקונים, תמונת החתלתול וקובצי הגופנים (Heebo, Assistant), שנכללים בפרויקט עצמו ואינם נטענים מ-Google Fonts (ראה ADR-3). יש לתמוך בטעינת `/` במצב Offline גם לאחר התקנה/טעינה מקוונת ראשונה מוצלחת.
- **לא** לבצע caching ל-`/api/*` או לקריאות OpenAI; כל יצירת בדיחה מחייבת בקשה חיה.
- שימוש ב-HTTPS של Vercel; ב-Development, `localhost` נחשב Secure Context בהקשרים רלוונטיים.
- תהליך עדכון Service Worker יבטיח שקובצי המעטפת מתעדכנים בצורה תקינה; אין להחליף קבצים באמצע בקשה פעילה.
- הבדיקה הנדרשת היא Chrome ב-Android וב-iPhone, במכשירים וגרסאות iOS נתמכים. תמיכה ב-iPhone אינה מבטיחה Prompt התקנה אוטומטי: התקנה דרך תפריט Share / Add to Home Screen כאשר נתמכת.
- ללא דרישה להתאמה ל-Desktop או ל-Firefox/Safari כממשק גלישה נתמך, אף שמנגנוני iOS עשויים להשתמש בתשתית מערכת משותפת.

### 2.8 Authentication, אבטחה ופרטיות

- אין מערכת Login, Cookies של Authentication או הרשאות משתמש.
- `OPENAI_API_KEY` הוא Server-only Environment Variable. אין להוסיף אותו ל-`VITE_*`, ל-HTML, ל-Repository, ל-Manifest או לתגובות API.
- ב-Vercel יש להגדיר Secret מתאים; המפתח המקומי נשמר בקובץ `.env`, שכבר מוחרג ב-`.gitignore` ואינו עולה ל-GitHub. בפרויקט נשמר `.env.example` עם שמות המשתנים בלבד.
- כל התקשורת של המשתמש מול Vercel וכל הקריאות החיצוניות מבוצעות ב-HTTPS.
- השרת בודק שוב את תקינות הקלט ואינו מריץ קוד, פקודות או HTML המגיעים מהמשתמש או מהמודל.
- להציג את הבדיחה כ-Plain Text כדי למנוע XSS. להשתמש בכותרות אבטחה מקובלות כגון `X-Content-Type-Options: nosniff`, `Referrer-Policy` ו-CSP המתאימה ל-Build; להימנע מ-CSP שמונעת Service Worker.
- לא לשמור בדיחות, כתובות דוא"ל או פרטי משתמשים באפליקציה. נתוני בקשה עדיין עוברים לשירות OpenAI לצורך יצירה, וספקי התשתית עשויים להחזיק Logs בהתאם למדיניות שלהם. `store: false` מצמצם שמירת Responses במסגרת יכולות ה-API אך אינו התחייבות לאפס עיבוד/לוגים מצד כל ספק.
- ללא Rate Limiting במוצר, בהתאם ל-PRD. להגדיר ניטור של שימוש וחיובים בחשבונות OpenAI/Vercel; לא להבטיח חסינות מוחלטת להצפת בקשות.

## 3. תשתיות, Hosting ו-Deployment

### 3.1 Repository וסביבות

- **Repository אחד ב-GitHub** כולל Frontend (`src/`), Backend (`api/`), תצורת Vite/PWA ומסמכי PRD ו-ARCHITECTURE.
- Branch `main` מייצג Production. העבודה נעשית ישירות על `main`, ללא ענפי עבודה וללא סביבת Preview נפרדת (ראה ADR-4).
- **Development מקומי:** שרת הפיתוח של Vite מפעיל את אותה פונקציה `api/joke.ts` דרך Middleware מקומי קטן, עם המפתח מקובץ `.env`. **לא נדרש חשבון Vercel ולא `vercel dev`** עד אבן דרך 4 (ראה ADR-1). אין צורך ב-Docker או במסד נתונים. בדיקות במכשירי מובייל אמיתיים ייעשו בכתובת ה-HTTPS של Production באבן דרך 4.
- **Production:** `main` עם `OPENAI_API_KEY` ב-Vercel. לאחר חיבור Vercel, כל Push ל-`main` מעלה גרסה לאוויר, ולכן לפני כל Push כזה יש לקבל אישור מפורש מהמשתמשת.

### 3.2 Build ופריסה אוטומטית

1. לחבר את GitHub Repository ל-Vercel Project אחד.
2. לבחור Framework Preset של **Vite**; Build Command: `npm run build`; Output Directory: `dist`.
3. Vercel מגיש את Build הסטטי ואת ה-Node.js Function שתחת `api/joke.ts` באותו Domain. להגביל את Function ל-Node.js Runtime ולא ל-Edge בלי צורך.
4. Push ל-`main` יוצר Production Deployment אוטומטי (לאחר אישור מפורש של המשתמשת ל-Push).
5. חיבור HTTPS מובנה ב-Vercel. אפשר להשתמש בכתובת `*.vercel.app`; Domain מותאם אישית אופציונלי בלבד.
6. הפריסה אינה כוללת Database Migrations או Provisioning של תשתיות שאינן קיימות.

### 3.3 Environment Variables

| משתנה | היכן נדרש | סוד? | הערה |
|---|---|---|---|
| `OPENAI_API_KEY` | Backend: `.env` מקומי ו-Vercel Production | כן | מפתח אחד מספיק; לעולם לא לחשוף ל-Frontend |

`gpt-5` מוגדר כקבוע בקוד Backend לפי דרישת המוצר. אם בוחרים לאחסן את שם המודל ב-Environment Variable מטעמי תחזוקה, ערך Production חייב להיות `gpt-5` ואין לשנותו ללא שינוי מאושר ב-PRD.

### 3.4 עלויות ותפעול

- **OpenAI GPT-5:** לפי עמוד המודל הרשמי שנבדק ב-21.10.2026, מחירי Text מוצגים כ-$1.25 למיליון Input Tokens, $0.125 למיליון Cached Input Tokens ו-$10 למיליון Output Tokens. המחיר בפועל נגזר מהיקף הקלט, פלט הבדיחה, Tokens פנימיים אם מחויבים ומהתעריף במועד השימוש. אין מכסה ברמת המוצר.
- **Vercel:** קיימת תוכנית Hobby לשימוש אישי לא מסחרי עם מכסות משאבים; Production מסחרי מצריך תוכנית מתאימה לפי תנאי השירות. Function משלם/צורך משאבים בהתאם למודל החיוב של התוכנית, ועשוי להיות כפוף למגבלות זמן וקריאות.
- **GitHub:** Repository ופעילות Git רגילה; לבדוק את תנאי התוכנית בהתאם לבעלות ולצרכים.
- **אין עלות Database, Storage או Authentication** כי שירותים אלה לא נדרשים.
- אין להבטיח עלות חודשית קבועה כשהשימוש פתוח וללא מכסות. יש להגדיר בחשבון OpenAI **תקרת הוצאה חודשית והתראת תקציב**. זו הגנה תפעולית על החשבון ואינה מגבלת מוצר; המשתמשת מגדירה אותה בעצמה, בהדרכה, באבן דרך 4.

## 4. החלטות טכניות מחייבות וגבולות הפתרון

- מסך Web יחיד, בעברית RTL, מותאם לנייד; ללא תפריטים ודפים נוספים.
- GPT-5 בלבד כמבוקש; אין Fallback למודל אחר.
- כל לחיצה יוצרת בקשה חדשה, גם באותו נושא; כפתור מושבת רק כל עוד בקשה קיימת בתהליך.
- ניתן לפתוח את מעטפת האפליקציה ב-Offline, אך לא להפיק בדיחה חדשה Offline.
- אין Backend מתמשך, Database, Sessions, Accounts, שמירת היסטוריית בדיחות, Analytics אישי, Queue או Storage חיצוני.
- אין הגבלה על מספר הבדיחות ולא מוסיפים Rate Limiting של מוצר.
- אין צורך ב-SSR, Next.js, Supabase, GitHub Pages או שרת Express נפרד.

## 5. מקורות רשמיים למחקר (נבדקו ב-21.10.2026)

1. [OpenAI — GPT-5 Model (יכולות, סטטוס, תמחור, Endpoints)](https://developers.openai.com/api/docs/models/gpt-5)
2. [OpenAI — Text Generation / Responses API](https://developers.openai.com/api/docs/guides/text)
3. [OpenAI — Production Best Practices](https://developers.openai.com/api/docs/guides/production-best-practices)
4. [Vercel — Vite](https://vercel.com/docs/frameworks/frontend/vite)
5. [Vercel — Vercel Functions Limits](https://vercel.com/docs/functions/limitations)
6. [Vercel — Configuring Maximum Duration](https://vercel.com/docs/functions/configuring-functions/duration)
7. [Vercel — Git Integration](https://vercel.com/docs/git)
8. [Vercel — Environment Variables](https://vercel.com/docs/environment-variables)
9. [Vercel — Hobby Plan / תנאי תוכנית](https://vercel.com/docs/plans/hobby)
10. [Vite PWA — Getting Started](https://vite-pwa-org.netlify.app/guide/)
11. [WebKit — Add to Home Screen through third-party browsers on iOS](https://webkit.org/blog/13878/web-push-for-web-apps-on-ios-and-ipados/)

> **הערת עדכניות:** מגבלות תכניות, תמחור ומדיניות זמינות מודלים משתנים. לפני Deployment יש לאמת שהמודל `gpt-5` נגיש בחשבון ושזמן ההרצה והתוכנית ב-Vercel מתאימים לשימוש המתוכנן. כל שינוי במודל שנדרש כתוצאה מ-Deprecation יחייב החלטת מוצר מפורשת.

## החלטות מרכזיות (ADRs)

### ADR-1: הרצה מקומית ללא Vercel
**הקשר:** `vercel dev` מחייב חשבון Vercel וחיבור פרויקט, אבל Vercel נדרש רק לפריסה באבן דרך 4.
**החלטה:** בפיתוח מקומי, Middleware קטן בשרת הפיתוח של Vite מפעיל את אותה פונקציה `api/joke.ts`, והמפתח נטען מ-`.env`.
**השלכות:** אין צורך בחשבון Vercel עד אבן דרך 4. אותו קוד Function רץ מקומית וב-Vercel. ייתכנו הבדלים קטנים בין הסביבות, והם ייבדקו ב-Production באבן דרך 4.

### ADR-2: GPT-5 ברמת חשיבה מינימלית
**הקשר:** GPT-5 הוא מודל "חושב". ברירת המחדל עלולה להביא להמתנה של 10–30 שניות ולעלות גבוהה יותר.
**החלטה:** `reasoning.effort = 'minimal'`. המודל נשאר `gpt-5`. אם המודל אינו זמין או מוסר — עוצרים ושואלים את המשתמשת, ללא החלפה אוטומטית.
**השלכות:** בדיחות מהירות וזולות יותר. ייתכנה ירידה קלה בתחכום ההומור.

### ADR-3: גופנים בתוך הפרויקט
**הקשר:** האפליקציה חייבת להיפתח גם ללא אינטרנט, וגופנים מ-Google Fonts לא יהיו זמינים במצב כזה.
**החלטה:** קובצי Heebo ו-Assistant נכללים בפרויקט ונשמרים במטמון של ה-Service Worker.
**השלכות:** המראה נשמר גם ב-Offline ואין תלות בשירות חיצוני. גודל ההורדה הראשונה גדל מעט.

### ADR-4: עבודה ישירה על `main` ללא Preview
**הקשר:** הפרויקט קטן ומנוהל על ידי משתמשת אחת. סביבות Preview ומפתחות נפרדים מוסיפים מורכבות.
**החלטה:** מפתח OpenAI אחד וללא סביבת Preview. לאחר חיבור Vercel, כל Push ל-`main` הוא פריסה ל-Production, ולכן נדרש אישור מפורש לפני כל Push.
**השלכות:** תהליך פשוט. אין סביבת ביניים לבדיקה, ולכן הבדיקות נעשות מקומית לפני האישור.

### ADR-5: חתימת Web Standard ל-Function וללא Retry ב-SDK
**הקשר:** אותו קובץ `api/joke.ts` צריך לרוץ גם ב-Middleware המקומי של Vite (ADR-1) וגם ב-Vercel. בנוסף, ה-SDK של OpenAI מבצע כברירת מחדל ניסיונות חוזרים אוטומטיים.
**החלטה:** ה-Function מייצאת `export default { fetch }` בחתימת `Request` → `Response`, ללא `@vercel/node`. ה-Client של OpenAI נוצר עם `maxRetries: 0` ו-Timeout של 45 שניות. גבול גוף הבקשה: 2KB (`413` מעבר לכך).
**השלכות:** אין תלות נוספת, והקוד זהה בשתי הסביבות. כשל זמני של OpenAI מוחזר מיד ללקוח, והמשתמש מנסה שוב ידנית — ללא חיוב כפול. יש לוודא באבן דרך 4 שהחתימה פועלת ב-Vercel כצפוי.

### ADR-6: עדכון Service Worker בפתיחה הבאה
**הקשר:** לפי סעיף 2.7 אין להחליף קבצים באמצע בקשה פעילה, ו-DESIGN אינו כולל חלונית "גרסה חדשה זמינה".
**החלטה:** `vite-plugin-pwa` מוגדר עם `registerType: 'prompt'` ללא רכיב UI וללא `skipWaiting`. גרסה חדשה של המעטפת נטענת ברקע ונכנסת לתוקף בפתיחה הבאה של האפליקציה.
**השלכות:** אין רענון פתאומי ואין אובדן בדיחה או בקשה באמצע שימוש. אחרי פריסה, מי שהאפליקציה פתוחה אצלו יראה את הגרסה החדשה רק אחרי סגירה מלאה ופתיחה מחדש.

### ADR-7: API מקומי גם ב-`vite preview`
**הקשר:** ה-Service Worker פועל רק על ה-Build, ולכן PWA, Offline ושגיאות צריכים להיבדק דרך `vite preview` — שבו ה-Middleware של ADR-1 לא היה פעיל.
**החלטה:** ה-Plugin המקומי מחבר את `/api/joke` גם לשרת ה-Preview. מכיוון ששרת ה-Preview אינו טוען TypeScript, נוצר בו פעם אחת שרת Vite פנימי במצב Middleware שטוען את אותו `api/joke.ts`. הפקודה: `npm run preview:pwa`.
**השלכות:** ניתן לבדוק מקומית את הגרסה שתעלה לאוויר, כולל יצירת בדיחה, בלי חשבון Vercel. עדיין ייתכנו הבדלים קטנים מול Vercel, שייבדקו באבן דרך 4.

### ADR-8: הגדרות פריסה וכותרות אבטחה ב-`vercel.json`
**הקשר:** סעיף 2.8 דורש כותרות אבטחה ו-CSP שאינה מונעת Service Worker; סעיף 2.5 דורש מגבלת ביצוע ב-Vercel גבוהה מה-Timeout של OpenAI; ADR-6 מסתמך על כך שהדפדפן יגלה גרסה חדשה של `sw.js`.
**החלטה:** קובץ `vercel.json` בשורש קובע Preset של Vite, `npm run build` ו-`dist`; `maxDuration: 60` ל-`api/joke.ts`; כותרות `X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options` ו-CSP הדוקה (`'self'` בלבד, ללא `'unsafe-inline'`, עם `worker-src 'self'`); `Cache-Control: no-cache` ל-`sw.js` ו-Cache ארוך לקובצי `/assets/` שבשמם Hash. גרסת Node.js נקבעת ב-`package.json` (`engines.node: 24.x`).
**השלכות:** ה-Build הנוכחי אינו כולל סקריפטים או סגנונות inline, ולכן ה-CSP אינה חוסמת דבר; הוספת כאלה בעתיד תחייב עדכון ה-CSP. הכותרות פעילות רק ב-Vercel, לא בהרצה המקומית.
