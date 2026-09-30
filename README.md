# Plan Exec — by Ofek Levy

**ביצוע תכנית מאושרת עד הסוף, עם מעקב, הוכחות וביקורת על מה שבאמת בוצע.**

סקיל עצמאי ל־Codex, Claude Code, Cursor ולעוזרי קוד התומכים ב־Agent Skills.
הוא נועד לצמצם עצירות מיותרות, דילוגים ודיווחים על השלמה שלא נבדקה.

## התקנה דרך קישור

העתיקו לעוזר הקוד שלכם:

```text
התקן אצלי את הסקיל plan-exec מהריפו הזה לפי הוראות ההתקנה ב-README:
https://github.com/ofeklevy11/plan-exec
התקן אותו עבור העוזר שבו אנחנו עובדים ואמת שכל הקבצים הותקנו.
```

זו בקשת התקנה; עצם פתיחת הקישור בדפדפן אינה מתקינה דבר. העוזר צריך גישה
לרשת ולקבצים והרשאה להתקין. לאחר ההתקנה השתמשו בסקיל בשיחה חדשה או רעננו
את רשימת הסקילים לפי העוזר שלכם.

## התקנה בפקודה אחת

נדרשים Node.js 18 ומעלה, npm ו־Git. אין צורך במפתח API נוסף.
הפקודות משתמשות ב־[Skills CLI](https://github.com/vercel-labs/skills).

**Codex:**

```bash
npx --yes skills add https://github.com/ofeklevy11/plan-exec --skill plan-exec --agent codex --global --copy --yes
```

**Claude Code:**

```bash
npx --yes skills add https://github.com/ofeklevy11/plan-exec --skill plan-exec --agent claude-code --global --copy --yes
```

**Cursor:**

```bash
npx --yes skills add https://github.com/ofeklevy11/plan-exec --skill plan-exec --agent cursor --global --copy --yes
```

לכלי אחר, הריצו `npx --yes skills add https://github.com/ofeklevy11/plan-exec`
ובחרו את העוזר שלכם. אם סקיל באותו שם כבר מותקן, בדקו אותו לפני עדכון.

**החלופה המובנית של Codex:** בקשו מ־`skill-installer` להתקין
מ־`ofeklevy11/plan-exec`, מהנתיב `skills/plan-exec`.
אפשר לתת לו גם את [הקישור הישיר לתיקיית הסקיל](https://github.com/ofeklevy11/plan-exec/tree/main/skills/plan-exec).

## שימוש

אחרי אישור תכנית, כתבו ב־Codex:

```text
השתמש ב-$plan-exec. התכנית בקובץ PLAN.md מאושרת.
בצע אותה במלואה, אל תדלג על שלבים, ואמת כל דרישה לפני דיווח על השלמה.
```

ב־Claude Code אפשר להשתמש ב־`/plan-exec`; בכלי אחר השתמשו בתחביר הסקילים שלו
או בקשו במפורש להשתמש ב־`plan-exec`.

הסקיל:

1. קורא את התכנית המאושרת ומחלץ את כל ההתחייבויות, כולל תוספות מאוחרות.
2. יוצר `PLAN-LEDGER.md` עם דרישה, בדיקת קבלה, ראיה וסטטוס לכל פריט.
3. מבצע לפי התלויות וממשיך בלי בקשות שגרתיות לאישור המשך.
4. בודק ראיות באמצעות `ledger-check.mjs` וביקורת מלאה מול התכנית המקורית.
5. מתקן חוסרים ובודק שוב עד שתי ביקורות נקיות ברצף, עם תקרה של ארבעה סבבים.
6. מדווח גם על מה שלא בוצע ועל מה שנותר חסום או לא מוכח.

## גבולות מדויקים

זהו סקיל של הוראות עבודה, לא מנגנון שמבטיח ציות מושלם או מונע כל עצירה.
הוא מתחיל אחרי אישור מפורש של תכנית. הוא מאפשר עצירה כשחסרים פרטי גישה,
כשיש שער אנושי נדרש, כשנחסמה כל ההתקדמות או כשפעולה חיצונית אינה מורשית.
הוא אינו מעניק הרשאה לפרסם, למחוק, לשלם או לשלוח הודעות בשם המשתמש.

בודק ה־ledger מאמת מבנה וראיות רשומות; הוא אינו מחליף ביקורת על איכות הראיות
או מוכיח שפריט חסום הושלם. לאחר ארבעה סבבי ביקורת, חוסרים נשארים גלויים בדוח.

## What this is

A standalone Agent Skill for executing explicitly approved plans with a file-backed
commitment ledger, evidence checks, completeness audits, and a bounded fix loop.
No companion skills are required. Runtime code is limited to a dependency-free Node.js
ledger checker. Install with the commands above; invoke `$plan-exec` in Codex or the
skill syntax supported by your agent. Installation does not execute a project plan.

## Files

```text
skills/plan-exec/
  SKILL.md              Execution workflow
  AUDIT-PROTOCOL.md     Completeness audit
  LEDGER-TEMPLATE.md    Ledger template
  ledger-check.mjs      Mechanical evidence gate
  agents/openai.yaml    Codex display metadata
```

Packaged from Ofek's existing `plan-exec`, preserving its execution and audit workflow
while making paths portable and companion skills optional.

MIT License. Created by Ofek Levy.
