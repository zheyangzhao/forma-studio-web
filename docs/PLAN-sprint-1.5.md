# Forma Studio Web v2.0 — Sprint 1.5 規劃書

災前定義：Sprint 1.5：116 條中文標題 — 卡片中英雙語顯示，搜尋納入中文。

參考來源：災前 `CHANGELOG.md` §Sprint 1.5、`response_2932...md`、`response_2904...md`、災前 `sprint1.5A-verify.spec.js`、`translations-zh.json`。

本規劃只描述 Sprint 1.5；不直接修改程式碼，不替 Claude / Codex 實作 diff。

## §一、Sprint 1.5 範圍
1. 將災前備份 `translations-zh.json` 納入 v2 prompt library。
2. v2 Prompt Lab 載入 prompts 時同步取得中文標題，normalize 成 `titleZh`。
3. 卡片標題改為中文主標、英文副標，prompt 本文仍保持原英文。
4. 搜尋範圍加入中文標題與中文分類名稱，支援中文 query 直接命中。
5. v1.1 完全凍結；`web/forma-studio.html` 不得有任何 diff。

範圍邊界：
- 只做中文標題。
- 中文摘要保留給 Sprint 1.6。
- 中文全文翻譯保留給 Sprint 1.7。
- 不重寫 Prompt Lab 架構。
- 不更動既有 prompt category JSON 結構。
- 不新增遠端依賴或 build step。
- 不寫任何 repo 工作目錄外的輸出檔。

## §二、變更清單
### 2.1 新增資料檔
新增檔案：
- `web/prompt-library/translations-zh.json`

來源：
- `/Users/jeyengjau/forma-rebuild/translations-zh.json`

資料要求：valid JSON；`schema_version === 2`；`titles` 有 116 個 key；`summaries` 可保留但 Sprint 1.5 不讀取、不顯示；title key 與目前 116 個 prompt id 一對一，missing / extra 都必須為 0。

### 2.2 v2 loader 新增點
修改目標：
- `web/forma-studio-v2.html`
- `loadPromptLibrary()`

Q1 推薦：候選 A，與 gallery-index 同一輪載入 translations。

理由：
- `gallery-index.json` 仍是硬依賴。
- category JSON 仍依 index categories 並行 fetch。
- `translations-zh.json` 是軟依賴。
- translations 失敗只 `console.warn`，不得讓 Prompt Lab crash。
- translations 載入成功後，在 normalize prompt 時查表取得 `titleZh`。

不推薦候選 B：lazy 後合併會造成首屏先英文再跳中文，且 116 筆小 JSON 不值得增加 state 與 re-render 分支。

不推薦候選 C：categories 必須依 index 才知道檔案清單，translations 也不應與 categories 綁成同一個 all-or-nothing。

失敗回退：
- translations 404：顯示英文 title，無 UI error。
- translations malformed：顯示英文 title，`console.warn`，無 crash。
- translations schema 不符：顯示英文 title，可 warning。
- 少數 key 缺漏：該卡英文 fallback，其餘卡仍顯示中文。
- 多餘 key：忽略，可 warning。
- gallery-index 或 category JSON 失敗：保留現有「提示詞庫載入失敗」。

### 2.3 state / normalize 新增點
`PromptLabTab` 不需要新增獨立 translations state；translation 是 normalize 階段的靜態查表，UI 只需讀 normalized item 的 `titleZh`，搜尋只需讀 `searchText`。

Q2 推薦 normalize：
- normalized prompt item 加入 `titleZh`。
- key 使用既有 prompt id，也就是 `{categorySlug}-{no}`。
- 實作上優先用 `p.id`。
- `p.id` 不存在時 fallback 到 `${meta.slug}-${p.no || idx + 1}`。
- 查不到中文時 `titleZh = null`。
- UI 用 `titleZh || title` 作為主標。
- 英文副標只在 `titleZh` 存在時顯示。
- 可另加 `translationKey` 或 `hasTitleZh` 便於 debug。

`searchText` 必須拼接：
- 英文 `title`。
- 中文 `titleZh`。
- 原始 `prompt`。
- `data.category`、`data.title_zh`。
- `meta.category`、`meta.title_zh`。
- `categoryTitleZh`。
- industries、useCases、credit、source author。

中文摘要不加入 `searchText`，避免提前實作 Sprint 1.6，也避免驗收無法判斷中文 query 是命中 title 還是 summary。

### 2.4 卡片 UI 新增點
修改目標：
- `PromptLabCard()`

Q3 推薦：候選 A，中文主標 + 英文小字副標。

規則：
- 中文主標：較大、較粗、白色或接近白色。
- 英文副標：較小、低對比灰色。
- 不做同權重雙行。
- 不做 toggle。
- 不新增大型說明 banner。
- 有 `item.titleZh`：第一行顯示中文，第二行顯示英文 `item.title`。
- 無 `item.titleZh`：只顯示英文 `item.title`。
- 保留 category label、編號 badge、metadata chips、prompt preview。
- 副標不得撐破卡片。
- mobile viewport 不得橫向溢出。

這是最小變更，也最符合 Truly-Neutral 的低干擾精神。

### 2.5 搜尋邏輯新增點
Q4 推薦：
- 保留 `query.trim().toLowerCase()`。
- 中文沒有大小寫，`toLowerCase()` 不會破壞中文。
- 中文 query 直接用 includes。
- `searchText` 加入中文 title 與中文 category title。
- aria-label 維持 `搜尋提示詞`，避免破壞現有測試。
- placeholder 可維持或微調為中英都可搜尋。

搜尋預期：`介面` 命中 `ui-ux-mockups-102`；`儀表板` 命中 `ui-ux-mockups-103`；`Mobile Budgeting` 與 `dashboard` 仍可用英文命中；中文分類名仍可搭配 category chip 正常過濾。

搜尋不做：拼音、繁簡轉換、斷詞、fuzzy search、summary search。

### 2.6 不破壞點
必須保持：Prompt Lab 總數 116；18 個分類 chip；category filter；英文搜尋 `chess`；展開 / 收合；複製 prompt；套用到 Claude Design；attribution；mobile 無橫向 scroll；v1.1 不新增 Prompt Lab tab；v1.1 diff 為 0。

## §三、執行步驟
### Step 0：確認工作樹
- 驗證 `git status --short`。
- 確認目前在 Sprint 1 後續分支。
- 若工作樹有無關變更，先停下確認，不覆蓋。

### Step 1：複製 translations JSON
- 將 `/Users/jeyengjau/forma-rebuild/translations-zh.json` 複製到 `web/prompt-library/translations-zh.json`。
- 驗證 JSON parse 成功、`schema_version === 2`、titles count 116、summaries count 116。

### Step 2：做 prompt id 對照驗證
- 讀 `web/prompt-library/gallery-index.json`。
- 依 index 讀 17 個 category JSON。
- 收集所有 prompt id。
- 對照 `translations-zh.json.titles`。
- 驗證 prompt id unique count 116、title key count 116、missing 0、extra 0。
- 任一項失敗時先停止，不進入 UI 實作。

### Step 3：擴充 loader
- 在 `loadPromptLibrary()` 新增 translation fetch。
- translations fetch 使用 `./prompt-library/translations-zh.json`。
- translations fetch 使用 `cache:'no-store'`。
- translations parse 包在 try/catch。
- catch 時回傳空 titles map 並 `console.warn`。
- 正常時將 titles map 傳入 normalize。

### Step 4：擴充 normalize
- 計算 `id` 後查 `titles[id]`。
- 在 item 上加入 `titleZh`。
- 在 item 上可加入 `translationKey` 便於 debug。
- 修改 `searchParts`，加入 `titleZh` 與 `categoryTitleZh`。
- 驗證 `ui-ux-mockups-102.titleZh` 為 `Mobile Budgeting App 介面 mockup`。
- 驗證 `ui-ux-mockups-103.titleZh` 為 `Desktop 營運儀表板`。

### Step 5：調整卡片標題 UI
- `PromptLabCard()` title block 改為中文主標、英文副標。
- 無中文時維持原英文 title 單行主標。
- 驗證前兩張 UI/UX 卡片都可見中文與英文。
- 驗證 mobile 寬度 390 不溢出。

### Step 6：新增 Sprint 1.5 Playwright spec
- 新增 `tests/sprint1-5-verify.spec.js`。
- 以 `tests/sprint1-verify.spec.js` 為基底。
- 不取代、不修改 `tests/sprint1-verify.spec.js`。
- 保留原 8 個 smoke / regression 測試。
- 新增 4-6 個 Sprint 1.5 專屬測試。
- report 寫到 `/tmp/forma-sprint1-5-screenshots/report.json`。
- screenshots 寫到 `/tmp/forma-sprint1-5-screenshots`。

### Step 7：跑語法、資料、UI 驗收
必跑：
- `@babel/parser` JSX 驗證 `web/forma-studio-v2.html`。
- JSON parse 驗證 `web/prompt-library/translations-zh.json`。
- prompt id 與 title key bijection 驗證。
- WebKit Playwright 真實打開 `forma-studio-v2.html`。
- 執行 `tests/sprint1-5-verify.spec.js`。
- `git diff main -- web/forma-studio.html` 必須為空。

通過條件：parser 0 error；translations valid JSON；116/116 對應完整；baseline 8 test 通過；Sprint 1.5 新增 test 通過；console errors 0；page errors 0；`web/forma-studio.html` 不出現在 diff。

### Step 8：確認 diff 範圍與提交
允許後續實作變更：`web/prompt-library/translations-zh.json`、`web/forma-studio-v2.html`、`tests/sprint1-5-verify.spec.js`。

不允許後續實作變更：`web/forma-studio.html`、既有 prompt category JSON、`tests/sprint1-verify.spec.js`、與 Sprint 1.5 無關的 docs。

提交：
- 所有驗收通過後 commit。
- commit 後依既定規則立刻 push GitHub。

## §四、Playwright 驗收 spec 設計
建議檔名：
- `tests/sprint1-5-verify.spec.js`

設計原則：使用 WebKit；route fulfill 讀 repo `web` 目錄；不啟動外部網路；每個測試失敗時截圖；保留 Sprint 級回歸，不覆蓋舊 spec。

Baseline 8 test 保留：
1. v1.1 frozen smoke：打開 `forma-studio.html`，驗證既有 tabs，確認沒有 `提示詞庫`。
2. v2 existing tabs smoke：打開 `forma-studio-v2.html`，驗證 v2 tabs 可切換。
3. Prompt Lab load all：驗證 116 prompts、來源、license、category chips。
4. 英文搜尋 chess regression：搜尋 `chess`，結果大於 0 且小於 116。
5. category chip regression：點 `商業攝影`，命中仍為 4。
6. expand and copy regression：展開卡片、看到 attribution、複製 prompt。
7. apply to Claude Design regression：套用 chess prompt 後 textarea 仍是英文 prompt。
8. mobile layout regression：390 x 844 下 card 不超出 viewport。

Sprint 1.5 新增 6 test：
1. translations JSON integrity。
2. card bilingual title rendering。
3. 中文搜尋 `介面`。
4. 中文搜尋 `儀表板`。
5. translation 404 fallback。
6. translation malformed fallback。

新增 test 詳細預期：
- JSON integrity：`schema_version === 2`，titles 116，summaries 116，prompt id 與 title key 一對一。
- bilingual rendering：同一張 `.prompt-lab-card` 內可見 `Mobile Budgeting App 介面 mockup` 與 `Mobile Budgeting App Mockup`。
- 搜尋 `介面`：結果含 mobile budgeting app，命中數大於 0 且小於 116。
- 搜尋 `儀表板`：結果含 desktop dashboard，命中數大於 0 且小於 116。
- 404 fallback：translations route 回 404 時仍顯示 116 prompts，英文 title 可見，無 page error。
- malformed fallback：translations route 回 malformed JSON 時仍顯示 116 prompts，英文 title 可見，無 page error。

Q6 補強：補 translations schema_version、prompt id 與 title key bijection、404 fallback、malformed fallback、apply to Claude Design regression、mobile layout regression、console warn 與 console error 分流。

## §五、commit message 草稿
建議 commit message：

`feat(prompt-lab): add Sprint 1.5 bilingual Chinese titles`

中文版本：

`feat(prompt-lab): Sprint 1.5 中文標題與中文搜尋`

## §六、不做的事
本 Sprint 不做：
- 不顯示中文摘要，不把中文摘要加入搜尋，不做 prompt 全文中文翻譯。
- 不切換 prompt 本文語言，不新增語言 toggle，不新增大型說明 banner。
- 不修改 v1.1，不修改 `web/forma-studio.html`。
- 不修改既有 prompt category JSON，不改 `gallery-index.json` 結構。
- 不改來源 attribution、複製 prompt、套用到 Claude Design 行為。
- 不加入繁簡轉換、fuzzy search、遠端 API、build step。
- 不取代 `tests/sprint1-verify.spec.js`。
- 不寫任何使用者桌面路徑。

## Q1-Q6 決策摘要
Q1：推薦候選 A。
- translations 與 Prompt Lab loader 同一輪處理；index 與 category JSON 是硬依賴；translations 是軟依賴；translation 失敗時顯示英文版並 `console.warn`。

Q2：normalize 加 `titleZh`。
- key 使用 prompt id；`searchText` 拼接 `title + titleZh + prompt + categoryTitle + categoryTitleZh` 等既有欄位；無中文時 `titleZh = null`；UI fallback 到英文 title。

Q3：推薦候選 A。
- 中文大字主標；英文小字灰色副標；不做同權重雙行；不做 toggle；最小變更，符合 Truly-Neutral 的低干擾方向。

Q4：搜尋維持 includes。
- `query.toLowerCase()` 對中文安全；中文 query 直接 includes；`searchText` 加入中文 title 與中文 category title；不做拼音、繁簡、分詞、fuzzy。

Q5：失敗回退。
- 404：英文 title fallback，無 UI error；malformed：英文 title fallback，`console.warn`，無 crash；缺 key：單卡英文 fallback；多 key：忽略並 warning。

Q6：驗收標準。
- 必跑 `@babel/parser` JSX 驗證、`git diff main -- web/forma-studio.html` 等於空、WebKit Playwright baseline 8 test。
- 新增中文搜尋 `介面` / `儀表板`、雙語卡片渲染、116 key bijection、404 / malformed fallback。
- 補上英文搜尋、copy、apply、mobile regression，避免雙語改動破壞既有行為。
