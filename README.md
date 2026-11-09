# 漂洋過海尋客家——印尼客家文化之旅

高中本土語文（客語）第八課〈行讀客家世界：印尼客家之旅〉，45分鐘互動式教學網站。

## 如何使用（不需要安裝程式）

1. 解壓縮整個專案資料夾。
2. 直接使用Chrome、Edge或Firefox開啟 `index.html`。不需要連網或本地伺服器。
3. 按「下一步」依教學流程進行；左側章節可跳轉；按「返回地圖」可回到開場。
4. 課文可切換「海陸／四縣／雙腔」，並可開關拼音、放大字體。網站中的羅馬拼音一律小寫。
5. 使用 `worksheet.html` 開啟可列印的A4單面學習單草稿。

## 上傳到GitHub Pages

1. 登入GitHub，建立新repository，例如 `hakka-indonesia-lesson`。免費帳戶建議使用公開儲存庫。
2. 解壓縮ZIP，**將裡面的 `index.html`、`styles.css`、`app.js`、`content.js`、`worksheet.html` 等全部上傳到儲存庫根目錄**，連同 `assets` 資料夾；不要只上傳ZIP檔，也不要多套一層外部資料夾。
3. 開啟儲存庫的 **Settings → Pages → Build and deployment**。
4. 在 **Source** 選 **Deploy from a branch**；Branch選 **main**，目錄選 **/(root)**，按 **Save**。
5. 等GitHub發布後，網址會類似 `https://你的帳號.github.io/hakka-indonesia-lesson/`。

GitHub官方說明：<https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site>

## 專案檔案

- `index.html`：網站入口，頁面框架。
- `styles.css`：投影版面與視覺樣式。
- `content.js`：14段雙腔漢字、拼音、8張詞彙卡及資料來源。**若要修改拼音，主要編輯這個檔案。**
- `app.js`：教學章節導覽、地圖、雙腔切換、互動與音訊播放功能。
- `worksheet.html`：可列印A4單面學習單草稿。
- `.nojekyll`：讓GitHub Pages直接發布靜態檔案。
- `assets/audio/`：預留授權錄音位置。
- `assets/images/`：預留實景照片位置。

## 上課操作捷徑

| 動作 | 操作 |
|---|---|
| 下一步 | 右方向鍵／PageDown／畫面按鈕 |
| 上一步 | 左方向鍵／PageUp／畫面按鈕 |
| 全螢幕 | F鍵／右上按鈕 |
| 詞彙註解 | 點課文有底線的詞彙或詞彙列 |
| 關閉註解 | Esc或右上× |
| 回地圖 | 左下角「返回地圖」 |

## 尚待補入的正式教學素材

### 音檔

目前**未內建**臺灣海陸客語與山口洋客語的真實錄音，避免用來歷不明或不相符的材料冒充。

**最簡單的臨時用法：** 到「海外客語」頁，按選擇檔案，從本機挑選一段可播放的MP3或WAV；本機資料不會上傳到任何伺服器。重新整理網站後需重新選取。

**正式版固定音檔：**
1. 將取得授權的音訊放入 `assets/audio/`，例如：
   - `assets/audio/taiwan-hailu.mp3`
   - `assets/audio/singkawang-hakka.mp3`
2. 在 `app.js` 頂部找到：
   ```js
   const BUILTIN_AUDIO = {tw:'', id:''};
   ```
3. 改成：
   ```js
   const BUILTIN_AUDIO = {
     tw:'assets/audio/taiwan-hailu.mp3',
     id:'assets/audio/singkawang-hakka.mp3'
   };
   ```
4. 重新整理即可。網站會使用瀏覽器內建音訊播放器。

### 地圖與圖片

- 開場地圖是**相對方位示意圖**，不是精確國界、航線，也不是客家人口比例地圖。
- 地圖光暈只表示教學要介紹的地區，**不表示人口密度**。
- 粄食圖目前為**示意插畫**，尚非實景比較照片。
- 節慶目前用符號與簡短說明，尚未嵌入授權照片／影片。
- 若在公開發表前加入圖片或影片，建議將檔案放入`assets/images/`，並保留授權與來源註記。

## 內容對照與注意事項

1. 課文漢字分別儲存海陸與四縣版本。海陸「最／盡／流利／所以／了解／城市／樹乳樹」及四縣「盡／異／流掠／故所／發現／城鎮／樹乳仔」分別對應。
2. 羅馬拼音依授課教師最後一次提供的雙腔版本整理，**一律使用小寫**；程式不會自行轉換調值或替換詞語。
3. 歷史上臺灣與印尼的客家移民多有不同遷移路線；開場飛機動畫只代表**本堂課的虛構旅行**。
4. 印尼與臺灣的語言政策在時代背景與對象上有差異，不應視為完全相同。
5. 菜粄的地方羅馬字拼寫常見 `Choi Pan`／`Chai Kwe`；菜粄通常是鹹食，**不應因南洋某些甜點使用椰糖、椰奶，就概括為南洋客家粄食全偏甜**。
6. 本版本為**可操作網站初版**，不是所有圖片／音檔均已完備的正式教學素材。

## 主要查核來源

- 印尼中央統計局（BPS），2026年年中人口估計：<https://www.bps.go.id/en/statistics-table/2/MTk3NSMy/mid-year-population->
- 印尼教育部地方語言資料庫：<https://bahasa.data.kemdikbud.go.id/>
- 蘭芳公司研究（World History Connected）：<https://worldhistoryconnected.press.uillinois.edu/17.3/Eng.html>
- 山口洋Choi Pan（印尼觀光官方網站）：<https://www.indonesia.travel/id/id/destination/kalimantan/west-kalimantan/singkawang>
- 臺灣客家米食（客家委員會）：<https://webc.hakka.gov.tw/findhakkafood/rice_list_cht.html>
- 苗栗𪹚龍（客家委員會）：<https://cloud.hakka.gov.tw/Details?p=50761&pid=256282>
- 北埔油笐火（客家委員會）：<https://www.hakka.gov.tw/chhakka/app/data/view?id=25&module=hotnews&serno=4bb8a3bf-dfe4-4b40-aba4-d68d44c0f608>

本專案使用原生HTML、CSS、JavaScript，沒有外部函式庫、分析追蹤或後端伺服器。


## 實景照片與來源（第四版）

網站以Wikimedia Commons所收錄的實景照片作為圖像素材，並在照片下方及「資料與圖片來源」中標示出處。照片由外部網址載入；需要網路連線才能顯示。若需完全離線展示，請由各照片來源頁下載合適尺寸並存入`assets/images/`，再把`app.js`中`PHOTO_SOURCES`的`url`改成相對路徑。

臺灣菜包：客家委員會（OGDL1.0）；印尼邦加菜粄：Cun Cun（CC BY-SA 4.0）；山口洋廟宇：Wibowo Djatmiko（CC BY-SA）；苗栗𪹚龍：Wikimedia Commons；山口洋Tatung：Rudi Sugianto（CC BY-SA）；臺灣燈節：HC Lin（CC BY）。北埔油笐火暫以客委會官方照片頁連結呈現，未嵌入未確認授權的照片。

GitHub Pages是公開網站，即使網站用於非營利教學，也不會自動變成非公開或取得全部照片重製權；本版優先使用可標示來源的開放授權照片。
