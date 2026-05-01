# Forma Studio Web v2.0 — Sprint 1.6 + Sprint 1.7 合併規劃書

災前定義：
Sprint 1.6：116 中文摘要 — 折疊狀態快速理解 prompt。
Sprint 1.7：116 全文翻譯 + 翻譯工具 — 展開卡顯示中文全文與英文可複製區。

現況基準：
HEAD `6cd1b02` 已完成 Sprint 1.5。
`web/prompt-library/translations-zh.json` 目前是 schema=2，含 116 titles + 116 summaries。
17 個 category JSON 含 116 條英文 prompt，中文全文翻譯沒有備份，必須重新產生。

本規劃只描述後續執行方式。
本次不修改 UI、不改 JSON schema、不執行翻譯。

## §一、Sprint 1.6 + 1.7 範圍
1. 用 Codex CLI 讀取 17 個 category JSON，產生 116 條繁體中文全文翻譯。
2. 將 `translations-zh.json` 升到 schema=3，保留 `titles`、`summaries`，新增 `prompts`。
3. 折疊卡片 preview 優先顯示 `summaries[id]`，無摘要時 fallback 英文截斷。
4. 展開卡片顯示 `prompts[id]` 中文全文，再顯示英文原文可複製區。
5. 搜尋納入中文 title、summary、prompt translation，同時保留英文 title/prompt。
6. `複製 prompt` 與 `套用到 Claude Design` 都只使用英文 prompt。
7. v1.1 凍結不變，`web/forma-studio.html` 必須 diff = 0。
8. 新增 `tests/sprint1-6-1-7-verify.spec.js`，驗證資料、UI、搜尋、複製與 fallback。

範圍外：不修改 17 個 category JSON；不做 runtime lazy 翻譯；不新增後端或遠端 API 依賴；不做 fuzzy search、拼音搜尋、繁簡查詢擴展；不把中文翻譯當作 AI 生圖的 canonical prompt。

## §二、變更清單
### 2.1 `translations-zh.json` schema=3
目標檔案：
- `web/prompt-library/translations-zh.json`

目前：
- `schema_version: 2`
- `titles`: 116 筆。
- `summaries`: 116 筆。
- 無 `prompts`。

目標：
- `schema_version: 3`
- `titles`: 116 筆。
- `summaries`: 116 筆。
- `prompts`: 116 筆。
- 三組 key 都要與 116 個 prompt id 一對一。

建議結構：
```json
{
  "schema_version": 3,
  "note": "中文標題 + 中文摘要 + 中文全文翻譯。實際生圖請使用英文 prompt；中文版本供使用者理解內容。",
  "translation_method": "codex-cli",
  "translation_date": "2026-05-01",
  "titles": { "id": "中文標題" },
  "summaries": { "id": "中文摘要" },
  "prompts": { "id": "中文全文翻譯" }
}
```

Q3 推薦：
- 加 `translation_method`，標明資料由 Codex CLI 批次產生。
- 加 `translation_date`，方便日後追蹤。
- `model_used` 可選，不建議硬性要求，避免寫入不準確的執行環境資訊。
- 不加 per-prompt confidence、source snapshot、checksum；目前資料量小，維護成本大於收益。

### 2.2 翻譯策略
Q1 候選評估：
- 候選 A：Codex CLI 批次翻譯。推薦。
- 候選 B：Node script 在 v2 載入時 lazy 翻譯。不推薦。
- 候選 C：跳過全文翻譯，只做 UI 機制。不推薦作為 1.6 + 1.7 合併方案。

推薦候選 A 的理由：
- 符合使用者授權：用 Codex CLI 處理翻譯，不另開 OpenAI API。
- 翻譯是建置前資料，不造成使用者端等待或 runtime 成本。
- 可分批重跑失敗項，品質與可恢復性最好。
- 可在 commit 前用 schema 驗證確保 116 條完整。

不採候選 B：
- 需要網路、金鑰與 runtime 成本。
- 靜態網站會變成外部服務依賴。
- 使用者打開 Prompt Lab 時會遭遇延遲與失敗面。

不採候選 C：
- 只能完成 Sprint 1.6 與部分 Sprint 1.7 容器。
- 不能滿足「展開卡顯示中文全文」。
- 之後仍要再做一次 schema migration。

成本估計：
- 目前英文 prompt 總長約 98,663 字元。
- 約 30k-45k input tokens。
- 中文全文輸出預估 65k-95k output tokens。
- 加上 system prompt、批次 JSON 包裝、驗證與重跑 overhead，總計約 140k-220k Codex CLI tokens。
- 建議每批 10-20 條，較容易處理 JSON parse 失敗與單筆重跑。

### 2.3 v2 loader 新增點
現有相關函式：
- `loadTitleTranslations()`
- `loadPromptLibrary()`
- `PromptLabTab()`
- `PromptLabCard()`

後續實作建議：
- 將 `loadTitleTranslations()` 擴充或改名為 `loadZhTranslations()`。
- fetch path 保持 `./prompt-library/translations-zh.json`。
- fetch option 保持 `cache:'no-store'`。
- 回傳 `{ titles, summaries, prompts, schemaVersion }`。
- schema=2 有效，`prompts` fallback `{}`。
- schema=3 正常讀取三組欄位。
- unknown schema `console.warn`，但仍嘗試讀已知欄位。
- 404、malformed JSON、欄位型別錯誤都 fallback 空 maps，不讓 Prompt Lab crash。

### 2.4 normalize / state 新增點
normalized prompt item 新增：`titleZh`、`summaryZh`、`promptZh`、`englishPrompt`、`previewText`、`searchText`。

規則：
- `titleZh = translations.titles[id] || null`
- `summaryZh = translations.summaries[id] || null`
- `promptZh = translations.prompts[id] || null`
- `englishPrompt = promptText`
- `previewText = summaryZh || 英文 prompt 前 180 字`
- `searchText` 拼接中英文 title、summary、prompt、category、industries、use cases、credit、source author。

state 建議：
- 不新增獨立 translations state。
- translations 在 loader 階段參與 normalize。
- UI 只讀 normalized item，避免二次 reflow。

### 2.5 卡片 UI
折疊狀態：
- 保留 Sprint 1.5 的中文主標 + 英文副標。
- preview 位置顯示中文 summary。
- 控制 2-3 行，建議 `line-clamp-3` 或等效最大高度。
- 無 summary 時 fallback 英文 preview。

展開狀態：
- 中文全文 prompt 作為視覺主區。
- 英文 prompt 作為次要灰色區。
- 英文區標註「英文原文（可複製）」。
- `複製 prompt` 只複製英文。
- `套用到 Claude Design` 只套用英文。
- attribution 與 source metadata 保留。

Q4 推薦：
- 採用「折疊中文摘要、展開中文全文 + 英文原文」。
- 不做語言 toggle，因為雙語同時可見更符合快速理解與複製使用。
- 不讓複製按鈕複製中文，維持英文 prompt 是 canonical input。

### 2.6 搜尋擴充
Q5 推薦：
- `searchText` 加入 `summaries[id]` 與 `prompts[id]`。
- 中文摘要短，加入搜尋沒有效能問題。
- 中文全文預估 60k-90k 字元，加上現有英文總量後約 180k-230k 字元級別。
- 116 筆資料用 `includes()` 同步比對可接受。
- 不需要 debounce、索引、Web Worker。

風險：
- 中文全文會讓常見詞命中更多結果。
- 這是探索型 prompt library 可接受的結果。
- 若未來 prompt 數量到數千筆，再評估加權排序或索引。

### 2.7 失敗回退
Q6 推薦：
- translations 404：顯示英文 title、英文 preview、英文展開內容。
- schema=2：顯示中文 title + summary；展開中文全文缺席，fallback 英文。
- schema=3 但缺 `prompts`：等同 schema=2。
- 個別缺 summary：該卡 preview fallback 英文截斷。
- 個別缺 promptZh：該卡展開 fallback 英文，不印 console error。
- unknown schema：`console.warn`，不 crash。
- malformed JSON：`console.warn`，所有 translation maps 為空。
- 不顯示 `undefined`、`null`、空框或錯誤卡片。

## §三、執行步驟
### Step 0：確認基準
- 確認工作目錄為 `$HOME/Projects/forma-studio-web`。
- 執行 `git rev-parse HEAD`，預期基準為 `6cd1b02`。
- 執行 `git status --short`。
- 若有無關變更，不覆蓋、不回復。
- 確認後續實作不修改 `web/forma-studio.html`。

驗證：`git status --short` 可解讀，且 `web/forma-studio.html` 不在變更清單。

### Step 1：收集 116 條 prompt
- 讀 `web/prompt-library/gallery-index.json`。
- 依 `categories[].file` 讀取 17 個 category JSON。
- 收集 `{ id, title, prompt, category }`。
- 驗證 category count = 17。
- 驗證 prompt count = 116。
- 驗證 unique id count = 116。
- 驗證每筆 prompt 非空。

### Step 2：Codex CLI 分批翻譯
- 每批 10-20 條。
- 每批輸入 id + 英文 prompt。
- 使用 §四 SYSTEM_PROMPT。
- 要求 JSON object 輸出：`{ "id": "繁體中文全文翻譯" }`。
- JSON parse 失敗時重跑該批。
- 單筆空翻譯時重跑該筆。
- 合併所有批次成 `prompts` map。

驗證：所有 key 都存在於 116 ids；沒有 duplicate、空字串或 extra key。

### Step 3：升級 translations
- 讀現有 schema=2 檔案。
- 保留 `titles`。
- 保留 `summaries`。
- 新增 `prompts`。
- 設 `schema_version` 為 3。
- 更新 `note`。
- 加 `translation_method: "codex-cli"`。
- 加 `translation_date: "2026-05-01"`。
- 使用 pretty JSON，保留中文可讀。

驗證：JSON parse 成功；titles、summaries、prompts 都是 116；三組 key missing = 0、extra = 0。

### Step 4：翻譯品質抽查
- 抽查長 prompt 5 筆。
- 抽查短 prompt 5 筆。
- 抽查 UI/UX 類 3 筆。
- 抽查中文原文 prompt 3 筆。
- 抽查日文、韓文、西文 prompt 各 1 筆，如果資料中存在。
- 檢查 in-image 引號文字完整保留。
- 檢查尺寸、比例、鏡頭、色溫與品牌名沒有被翻掉。

驗證：發現問題只重翻問題 id；重翻後再跑 schema integrity。

### Step 5：改 loader 與 normalize
- 擴充 translations loader。
- 支援 schema=2 / schema=3 / unknown schema。
- 新增 `summaryZh`、`promptZh`、`englishPrompt`。
- `previewText` 改為 summary 優先。
- `searchText` 加入 summary 與 promptZh。
- 保留英文 prompt 作為 canonical data。

驗證：搜尋 `橡木` 與 `chess` 都命中；清空搜尋回到 116。

### Step 6：改卡片 UI
- 折疊時可見中文摘要。
- 摘要控制 2-3 行。
- 展開時可見中文全文。
- 展開時可見英文原文區。
- 複製按鈕只複製英文。
- 套用到 Claude Design 只套用英文。

驗證：折疊卡可見 summary；展開卡可見中文全文與英文原文；clipboard 與 Claude Design textarea 都不含中文全文。

### Step 7：新增 spec
- 新增 `tests/sprint1-6-1-7-verify.spec.js`。
- 以 `tests/sprint1-5-verify.spec.js` 為基底。
- 保留 Sprint 1.5 主要回歸。
- 新增 Sprint 1.6 / 1.7 測試。
- report 寫到 `/tmp/forma-sprint1-6-1-7-screenshots/report.json`。
- screenshots 寫到 `/tmp/forma-sprint1-6-1-7-screenshots`。

驗證：`node tests/sprint1-6-1-7-verify.spec.js` 可直接執行；失敗時有 report 與 screenshot。

### Step 8：必跑驗收
- JSX parse `web/forma-studio-v2.html`。
- JSON parse `web/prompt-library/translations-zh.json`。
- schema=3 integrity。
- prompt id bijection。
- v1.1 diff = 0。
- Playwright WebKit 執行 `tests/sprint1-6-1-7-verify.spec.js`。
- console errors = 0。
- page errors = 0。

### Step 9：commit / push
- 所有驗收通過後 commit。
- commit 後立刻 push GitHub。
- 若 push 失敗，回報原因與 commit hash。

允許後續實作變更：`web/prompt-library/translations-zh.json`、`web/forma-studio-v2.html`、`tests/sprint1-6-1-7-verify.spec.js`。
不允許後續實作變更：`web/forma-studio.html`、17 個 category JSON、既有 spec，除非後續任務明確要求。

## §四、翻譯品質指引
後續 Codex 翻譯任務可直接使用以下 SYSTEM_PROMPT。

```text
你是專業的設計、攝影、UI、視覺生成 prompt 繁體中文翻譯員。
任務是把英文或多語圖像生成 prompt 完整翻譯成繁體中文，供台灣使用者快速理解。
英文原文仍是實際給 AI 生圖的 canonical prompt；你的翻譯不得改寫原意。

規則：
1. 使用繁體中文與台灣常用語，不使用簡體中文詞彙；原文已是簡體中文時，轉為自然繁體中文。
2. 忠實完整翻譯，不省略構圖、主體、材質、色彩、光線、鏡頭、比例、字體、排版、情緒與品質要求。
3. in-image 文字必須保留原文與原引號內容，不翻譯、不改大小寫、不改標點，例如 "AURAE"、"Total balance $12,480.36"。
4. 尺寸、比例、解析度、鏡頭、色溫、焦段與技術參數保留原文格式，例如 1290x2796、3:4、9:16、28mm lens、4200K、f/1.8。
5. 品牌名、產品名、人物名、虛構品牌、平台名、模型名、專案名保留原文，例如 Apple、Stripe、AURAE、HELIX OPS、NOVA VAULT。
6. 設計、攝影、電影、UI 專有術語第一次出現時可用「中文（English term）」格式，之後使用中文即可，例如「淺景深（shallow depth of field）」。
7. 若原文要求畫面中的文字必須是某語言，必須保留該要求；不要把畫面內文字改成中文。
8. 若原文是日文、韓文、西文或中文 prompt，也要翻成繁體中文理解版；但畫面內指定文字、引號內文字與專有名詞保留。
9. 不新增原文沒有的限制、風格或品牌；不刪除原文的負面要求，例如 avoid、do not、no gradients。
10. 保留 prompt 的段落結構；長 prompt 可用自然中文段落，但不要整理成條列，除非原文就是條列。
11. 輸出只包含翻譯內容，不加前言、註解、評語、Markdown 標題或程式碼框。
12. 翻譯語氣要像專業設計 brief，精準、自然、可讀，不要過度文學化。
```

批次輸出格式：
```json
{
  "prompt-id-001": "繁體中文全文翻譯",
  "prompt-id-002": "繁體中文全文翻譯"
}
```

品質檢查：每個輸出 key 必須等於輸入 id；每個 value 必須是非空字串；不得回傳陣列、explanation、英文原文；不得把 prompt id 翻譯；原文極短時照原意翻譯，不補寫額外細節。

資料注意事項：EvoLink prompt 有些原文已是簡體中文，需轉成繁體中文；日文、韓文或西文 prompt 應翻為繁體中文理解版；若原文要求畫面生成簡體中文字，該要求不可改成繁體中文字；名人、品牌、虛構品牌只保留名稱，不做額外評論。

## §五、Playwright 驗收 spec 設計
檔名：
- `tests/sprint1-6-1-7-verify.spec.js`

基礎設定：
- 使用 Node + Playwright WebKit。
- 不依賴外部網路。
- route fulfill 從 repo `web` 目錄讀檔。
- report 寫 `/tmp/forma-sprint1-6-1-7-screenshots/report.json`。
- screenshots 寫 `/tmp/forma-sprint1-6-1-7-screenshots`。

必保留回歸：v1.1 frozen smoke、v2 tabs smoke、Prompt Lab load all、英文搜尋 `chess`、category chip `商業攝影`、expand/copy、apply to Claude Design、mobile layout、Sprint 1.5 bilingual title rendering、Sprint 1.5 中文 title 搜尋。

新增 Sprint 1.6 tests：搜尋 `橡木` 結果 > 0 且 < 116；結果包含日式極簡客廳相關卡；卡片折疊時可見 `橡木地板`；preview 優先顯示中文摘要；mobile summary 不造成水平 overflow。

新增 Sprint 1.7 tests：schema=3；`prompts` count = 116；三組 key missing = 0、extra = 0；展開卡可見中文全文與「英文原文（可複製）」；英文原文區包含原始 prompt 前段；clipboard 與 Claude Design textarea 只包含英文。

新增 fallback tests：schema=2 無 `prompts` 不 crash；missing prompt fallback 英文；missing summary fallback 英文截斷；schema=99 warning but no crash；invalid JSON 時 Prompt Lab 仍載入 116 筆。

Q7 補充驗收：必跑 JSX parse、v1.1 diff = 0、Playwright WebKit、schema=3 / 116 prompts / 0 missing、clipboard 英文-only、apply 英文-only、schema=2 fallback、mobile overflow、console errors = 0、page errors = 0。

成功定義：`report.failed.length === 0`；`consoleErrors.length === 0`，但預期的 `console.warn` 不算 error；`pageErrors.length === 0`；`web/forma-studio.html` diff 為空。

## §六、commit message 草稿
建議單一 commit：
```text
feat: add zh prompt summaries and full translations
```

建議 body：
```text
- upgrade translations-zh.json to schema v3 with 116 full prompt translations
- show zh summaries in collapsed Prompt Lab cards
- show zh full prompt plus English copy area in expanded cards
- include zh summaries and full prompts in Prompt Lab search
- add Sprint 1.6/1.7 WebKit verification spec
```

使用者規則：Codex 寫規格；Claude 執行；驗收通過後 commit；commit 後立刻 push GitHub。

## §七、不做的事
- 不修改 `web/forma-studio.html`。
- 不修改 17 個 category JSON。
- 不把中文 prompt 當成 clipboard 預設內容。
- 不把中文 prompt 套用到 Claude Design。
- 不做 runtime lazy 翻譯，不要求 `OPENAI_API_KEY`，不新增 Node runtime 翻譯服務、後端或外部 npm dependency。
- 不做 fuzzy search、拼音搜尋、繁簡自動查詢擴展或搜尋排序加權。
- 不做 per-card language toggle、翻譯編輯 UI 或翻譯品質人工審稿介面。
- 不做 v1.1 功能回填。
- 不修改既有 Sprint 1.5 規劃書。
- 不把 screenshots 或 report 寫進 repo。
- 不在本規劃階段執行程式碼修改或翻譯。

## Q1-Q7 決策摘要
Q1：推薦 Codex CLI 批次翻譯；品質與可驗證性最好，估計 140k-220k Codex CLI tokens。

Q2：採 §四 SYSTEM_PROMPT；重點是繁體中文、完整忠實、保留 in-image 文字、尺寸、參數、品牌名。

Q3：schema=3 採 `titles + summaries + prompts`；建議加 `translation_method` 與 `translation_date`，`model_used` 可選。

Q4：折疊顯示中文 summary；展開顯示中文全文主區 + 英文原文可複製區；複製與套用只用英文。

Q5：搜尋納入中文 summary 與 prompt translation；116 筆資料量下記憶體與速度都可接受。

Q6：schema=2、單筆缺漏、unknown schema、malformed JSON 都 fallback，不 crash；個別缺翻譯不印 console error。

Q7：新增 schema=3、中文摘要、中文全文、英文-only clipboard、英文-only apply、fallback、mobile overflow 測試。
