# 教案下載預留資料夾

教案完成後，請將PDF命名為 `lesson-plan.pdf` 並放到此資料夾。

然後在網站根目錄的 `app.js` 中找到：

```js
const LESSON_PLAN_FILE = '';
```

改為：

```js
const LESSON_PLAN_FILE = 'assets/docs/lesson-plan.pdf';
```

重新上傳 `app.js` 和教案PDF至GitHub後，網站上的「教案下載（尚未提供）」會自動變成「下載正式教案」。

教案尚未完成時，不必放空白PDF。
