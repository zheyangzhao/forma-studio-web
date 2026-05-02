# Forma Studio Web v2.0 — Final Review

日期：2026-05-02

審視範圍：

- `web/forma-studio-v2.html`：6270 行。
- `web/forma-studio.html`：3422 行，v1.1 frozen。
- `tests/*.spec.js`：10 個 spec，合計 6773 行，最新 C-3/C-4/C-5 spec 記錄 `totalSteps: 68`。
- `docs/PLAN-*.md`：12 份 sprint / phase / C 系列計畫文件。
- `docs/HEALTH-CHECK-2026-05-02.md`：早上 health check 參考基準。
- Git HEAD：`6e464cd`。

方法：

- 本報告只做靜態審視與 repo 交叉檢查。
- 未執行 Playwright；未修改任何既有檔案。

## §一、整體評分（0-10）

### 1. 程式碼品質：8.0 / 10

- 優點：核心 helper、資料 loader、localStorage wrapper、Audit scoring、Prompt Lab loader 都有清楚邊界。
- 優點：C-1 到 C-5 主要改在 Smart / NLM / App bridge；v1.1 與 v2.0 透過兩個 HTML 檔案隔離。
- 扣分：單檔已到 6270 行，review 與局部修改成本明顯偏高。
- 扣分：仍有 unused component / unused state，例如 `TagSelector`、`ApiKeyBar`、Smart `done`、Design `sec2Done`。
- 扣分：跨 tab payload 機制已長成 4 套相似但不一致的 state。

### 2. 測試覆蓋：8.8 / 10

- 優點：最新 `tests/c3-c4-c5-verify.spec.js:13` 明確記錄 `totalSteps: 68`，且 C-1~C-5 都有端到端路徑測試。
- 優點：多數 spec 都有 console error / pageerror 收集。
- 扣分：同一組 baseline regression 在多個 spec 內複製，總 `await runStep` 靜態計數為 349，維護成本高。
- 扣分：缺鍵盤導覽、focus-visible、corrupted localStorage、API success mock、reduced motion、contrast regression。
- 扣分：現況不是任務文字所稱「8 個 spec、約 3500 行」，repo 實際是 10 個 spec、6773 行。

### 3. UX 一致性：8.5 / 10

- 優點：Smart 4 步資訊架構比災前線性問答更可掃描，C-3/C-4/C-5 也都採折疊、入口、預填橋接。
- 優點：`NextStepCard` 成為跨 tab 的一致提示語言。
- 扣分：Smart 內 C-3/C-4/C-5 的入口已接近資訊密度上限。
- 扣分：cyan / purple / amber / yellow 的 tone 使用仍未形成單一 tone table。
- 扣分：NLM 預填直接跳到 Step 5，對熟悉使用者有效，但對新使用者仍需要更清楚的「可回頭改」提示。

### 4. Accessibility：7.4 / 10

- 優點：主要 tab、CTA、filter、search input、Prompt Lab action 多數都有可讀文字；`PromptLabTab` search input 有 `aria-label`，見 `web/forma-studio-v2.html:4777`。
- 優點：Smart 4 區塊都有固定 id，對測試和定位友善。
- 扣分：多個 icon-only / symbol-only button 缺 `aria-label`。
- 扣分：大量 `text-slate-500` / `text-slate-600` 小字在深色背景上偏低對比。
- 扣分：`glowPulse` 沒有 `prefers-reduced-motion` fallback。

### 5. Performance：8.2 / 10

- 優點：資料量仍小，Prompt Lab loader / translations loader 有 async 邊界與 fallback，localStorage 操作也都有 try/catch。
- 扣分：Prompt Lab `visiblePrompts` 每 render filter 116 筆，見 `web/forma-studio-v2.html:4691`。
- 扣分：Design gallery derived list 每 render 計算，見 `web/forma-studio-v2.html:3722`。
- 扣分：Smart `quickAudit` 與 `similarExamples` 也在 render path 計算，見 `web/forma-studio-v2.html:2120` 和 `web/forma-studio-v2.html:2123`。

### 6. v1.1 凍結契約遵守：10 / 10

- 契約文件：`docs/CONTRACT-v1.1-frozen.md:5`。
- v1.1 檔案：`web/forma-studio.html` 仍為 3422 行；`git diff -- web/forma-studio.html` 無輸出。
- v2.0 全部功能都落在 `web/forma-studio-v2.html` 與新增 docs/tests，此項可視為完全遵守。

## §二、與 2026-05-02 早上 Health Check 的對比

早上基準：

- Health Check 總分：8.1 / 10。
- Critical：0。
- Warning：9。
- 當時範圍：`web/forma-studio-v2.html` 5501 行、7 個 spec、Phase B/Sprint 5 收尾。
- 現在範圍：`web/forma-studio-v2.html` 6270 行、10 個 spec、Phase C + C-1~C-5 已完成。

### W1. Phase C roadmap 沒有正式文件

- 早上狀態：P1 warning。
- 現在狀態：已改善。
- 證據：`docs/PLAN-phase-c.md`、`docs/PLAN-c1-c2.md`、`docs/PLAN-c3-c4-c5.md` 都已存在。
- 結論：此 warning 可關閉。

### W2. 測試檔高度複製

- 早上狀態：P1 warning。
- 現在狀態：未改善，且因新增 Phase C / C-1-C2 / C-3-C5 spec 而放大。
- 證據：`tests/c3-c4-c5-verify.spec.js:204` 仍從 Test 1 v1.1 frozen smoke 開始複製。
- 證據：`tests/c3-c4-c5-verify.spec.js:240` 仍複製 Prompt Lab load all。
- 結論：殘留 warning，建議升為 P1 cleanup。

### W3. Prompt Lab 搜尋每次 render 都重新 filter

- 早上狀態：P1 warning。
- 現在狀態：殘留。
- 證據：`web/forma-studio-v2.html:4691` 的 `visiblePrompts = prompts.filter(...)` 仍直接在 render path。
- 結論：不是 blocker，但應在 RC1 cleanup 修。

### W4. Design gallery filter 在 render path 即時計算

- 早上狀態：P1 warning。
- 現在狀態：殘留。
- 證據：`web/forma-studio-v2.html:3722`、`web/forma-studio-v2.html:3723`。
- 結論：與 W3 可同一個 memoization pass 處理。

### W5. 部分 symbol-only button 對 screen reader 不夠清楚

- 早上狀態：P1 warning。
- 現在狀態：殘留，且新增 Smart 上傳檔案清除 button 也同類。
- 證據：`web/forma-studio-v2.html:2283` 的 `×`。
- 證據：`web/forma-studio-v2.html:4000` 的 `×`。
- 證據：`web/forma-studio-v2.html:5952` 的 `✕`。
- 結論：仍是 P1 a11y cleanup。

### W6. useEffect dependency 有刻意省略

- 早上狀態：P1 warning。
- 現在狀態：殘留，且 C-5 新增一個同型態。
- 證據：`web/forma-studio-v2.html:3732` dependency 只列 `pendingDesignPrompt`。
- 證據：`web/forma-studio-v2.html:5044` dependency 只列 `pendingText`。
- 證據：`web/forma-studio-v2.html:2612` dependency 只列 `pendingNLMState`。
- 結論：目前可運作，但未來 memoize handler 或拆 component 時會變成 stale closure 風險。

### W7. 單檔 HTML 行數偏高

- 早上狀態：P1 warning，5501 行。
- 現在狀態：惡化為 6270 行。
- 證據：`web/forma-studio-v2.html:1` 到 `web/forma-studio-v2.html:6270`。
- 結論：不阻擋 RC1，但下一階段若繼續疊功能，應建立 source split / build-to-single-file 策略。

### W8. Palette 偏離 v1.1 glow DNA

- 早上狀態：P2 warning。
- 現在狀態：殘留。
- 證據：Prompt Lab send audit button 使用 purple，見 `web/forma-studio-v2.html:4643`。
- 證據：NLM Step 5 badge 有 purple，見 `web/forma-studio-v2.html:2971`。
- 證據：Smart Prompt Lab bridge 大量使用 cyan，見 `web/forma-studio-v2.html:2198`、`web/forma-studio-v2.html:2534`。
- 結論：不是功能風險，但需要 tone table。

### W9. 低對比小字較多

- 早上狀態：P2 warning。
- 現在狀態：殘留。
- 證據：Smart Step 1 說明 `text-slate-500`，見 `web/forma-studio-v2.html:2263`。
- 證據：quick audit 說明 `text-slate-500`，見 `web/forma-studio-v2.html:2418`。
- 證據：相近範例說明 `text-slate-500`，見 `web/forma-studio-v2.html:2538`。
- 結論：需要一輪 contrast pass，但不是 release blocker。

### 新增 warning：跨 tab payload schema 分裂

- 等級：P1。
- 來源：C-1~C-5 新增與擴張。
- 證據：App 目前有 4 個 bridge state，見 `web/forma-studio-v2.html:6063` 到 `web/forma-studio-v2.html:6066`。
- 影響：功能可用，但下一個 tab 或下一個 payload type 會繼續複製。

### 新增 warning：C-3 quick audit applied 狀態可能 stale

- 等級：P2。
- 來源：C-3。
- 證據：`quickAuditApplied` 在 `web/forma-studio-v2.html:1796` 建立，在 `web/forma-studio-v2.html:2189` 設為 true。
- 觀察：使用者改寫 textarea 後，此 flag 沒有明確 reset。
- 影響：button label 可能顯示「已套用補強」，但內容已經不是同一份 prompt。

### 新增 warning：README / CHANGELOG 未同步 Phase C 後現況

- 等級：P2。
- 證據：`README.md:17` 仍描述 v2 主程式 5501 行。
- 證據：`CHANGELOG.md:3` 仍說紀錄到 Phase B Sprint 4。
- 結論：文件不是本任務可改項目，但 RC1 前應補。

## §三、SmartTab 架構檢討

### 4 區塊 glow 是否改善 UX

- 結論：有改善。
- 原因：Smart 目前同時呈現輸入、判斷、分流、輸出，降低「不知道下一步在哪」的線性 wizard 問題。
- 證據：四個固定區塊 id 在 `web/forma-studio-v2.html:2170` 產生。
- 證據：Step 1 開始 active，Step 2~4 future，C-1/C-2 spec 驗證於 `tests/c3-c4-c5-verify.spec.js:920`。
- 證據：Step 3 四個 action card 明確分流，見 `web/forma-studio-v2.html:2253` 到 `web/forma-studio-v2.html:2258`。
- 對比災前線性問答：現在使用者不用完成所有問題才知道出口。
- 代價：所有區塊同時可見，資訊密度高於傳統 wizard。
- 判斷：作為 v2.0 主入口，4 區塊 glow 是正確方向。

### Step 1 state

- 主要 state：`txt`、`fileInfo`、`fileLoading`。
- 證據：`web/forma-studio-v2.html:1778` 到 `web/forma-studio-v2.html:1780`。
- 行為：文字與檔案合併送進 300ms debounce analyze。
- 證據：`web/forma-studio-v2.html:1930` 到 `web/forma-studio-v2.html:1933`。
- 評價：乾淨，可理解。
- 小問題：file remove `×` 缺 aria-label，見 `web/forma-studio-v2.html:2283`。

### Step 2 state

- 主要 state：`ai` 與手動覆寫的 `selTask`、`selDomain`、`selFW`、`selAud`、`selSub`、`selImgType`、`selImgStyle`。
- 證據：`web/forma-studio-v2.html:1781` 到 `web/forma-studio-v2.html:1789`。
- 優點：AI 判斷結果與使用者覆寫分離，UX 上可調整。
- 風險：state 數量偏多，但每個 state 都有直接 UI 對應。
- 評價：可以接受，不需要為了抽象而抽象。

### Step 3 state

- 主要 state：`routeResult`、`copyOk`。
- 證據：`web/forma-studio-v2.html:1793`、`web/forma-studio-v2.html:1794`。
- 行為：四張 action card 共用 `getPromptNow`，必要時先生成 prompt。
- 證據：`web/forma-studio-v2.html:2182`。
- 評價：路由行為集中，沒有看到三條捷徑互相覆寫的直接 bug。
- 小風險：`finishDesign` / `finishNlm` / `finishAudit` 都先 setStep(4)，再 `setTimeout` 跨 tab。
- 證據：`web/forma-studio-v2.html:2210`、`web/forma-studio-v2.html:2223`、`web/forma-studio-v2.html:2239`。
- 判斷：此設計是為了讓 Step 4 有導向結果，合理；但 timeout magic number 建議集中成 helper。

### Step 4 state

- 主要 state：`out`、`routeResult`。
- 證據：`web/forma-studio-v2.html:1790`、`web/forma-studio-v2.html:2490`。
- 優點：輸出與導向結果共存，使用者可看到「已導向」與 prompt 全文。
- 風險：`done` state 已經不參與 render。
- 證據：`web/forma-studio-v2.html:1791`、`web/forma-studio-v2.html:2099`。
- 結論：`done` 可刪，Step 狀態已足夠。

### C-3 / C-4 / C-5 是否互相打架

- C-3 快速體檢位置：Step 3 與 Step 4 之間，見 `web/forma-studio-v2.html:2413`。
- C-4 Prompt Lab chips / 相近範例位置：`web/forma-studio-v2.html:2307`、`web/forma-studio-v2.html:2534`。
- C-5 NLM 預填入口 / action card：`web/forma-studio-v2.html:2374`、`web/forma-studio-v2.html:2256`。
- 結論：三條捷徑目前不打架。
- 原因：C-3 是 optional collapse，C-4 是 discovery，C-5 是 route payload。
- 主要風險：都依賴 Smart render path 的 derived calculation，未來如果 prompt library 擴大，會同時影響輸入流暢度。

## §四、跨 tab 機制檢討

### 現有 4 個機制

- `landingNote`：跨 tab 顯示提示卡，state 在 `web/forma-studio-v2.html:6066`。
- `pendingDesignPrompt`：把 prompt 塞到 Design Step 1，state 在 `web/forma-studio-v2.html:6063`。
- `pendingAuditText`：把 prompt 塞到 Audit textarea 並 run audit，state 在 `web/forma-studio-v2.html:6065`。
- `pendingNLMState`：把 Smart 結構化 state 塞到 NLM，state 在 `web/forma-studio-v2.html:6064`。

### 一致的部分

- 都由 App-level state 管理。
- 都以 `goTab` 切換 tab。
- 都透過 landing note 給使用者來源與下一步。
- Audit 可以直接在 `goTab` 內根據 `note.prompt` 消費 payload，見 `web/forma-studio-v2.html:6081`。
- landingNote TTL 統一在 `web/forma-studio-v2.html:6111` 到 `web/forma-studio-v2.html:6115`。

### 不一致的部分

- Design payload 由 `applyPromptToDesign`、`applyAuditToDesign`、`applyStyleToDesign`、`applySmartToDesign` 各自建物件，見 `web/forma-studio-v2.html:6117`、`:6137`、`:6155`、`:6172`。
- Audit payload 有時是 `pendingAuditText`，有時藏在 `note.prompt`。
- NLM payload 是完整 state，不只是 text。
- landingNote 是 UI note，不是 payload，但目前常和 payload 同時傳。

### 是否該抽象成 `pendingPayload<TAB>` schema

- 結論：應該，但不必在 v2.0 RC1 前做。
- 建議 schema：

```js
{
  targetTab: 'design' | 'nlm' | 'audit' | 'promptlab',
  sourceTab: 'smart' | 'promptlab' | 'audit' | 'style',
  sourceLabel: 'Smart 智慧製圖',
  kind: 'prompt' | 'nlm-prefill' | 'audit-text' | 'open-library',
  payload: {},
  note: { title, body, tone, ttlMs },
  createdAt: Date.now()
}
```

- Design 消費 `payload.prompt`。
- Audit 消費 `payload.text` 或 `payload.prompt`。
- NLM 消費 `payload.state`。
- Prompt Lab 只消費 note。

### 能否減少行數

- 可以，但減幅不會巨大；粗估可減少 80-140 行。
- 更重要的是把 `sourceLabel`、`title`、`body`、`tone` 的模式集中，降低錯誤率。

## §五、Test 覆蓋盤點

### Repo 現況

- 任務文字提到「8 個 spec、約 3500 行」。
- 實際 repo 現況是 10 個 spec、6773 行。
- 最新 spec 是 `tests/c3-c4-c5-verify.spec.js`，1176 行。
- 靜態 `await runStep` 總計 349 個。
- 這裡的 349 是所有歷史 spec 的 runStep 加總，不代表最新單次 run 會跑 349 個。

### totalSteps 演進

- `tests/sprint1-verify.spec.js:13`：8。
- `tests/sprint1-5-verify.spec.js:13`：12。
- `tests/sprint1-6-1-7-verify.spec.js:13`：18。
- `tests/sprint1-8-verify.spec.js:13`：25。
- `tests/sprint2-verify.spec.js:13`：31。
- `tests/sprint3-verify.spec.js:13`：37。
- `tests/sprint4-verify.spec.js:13`：42。
- `tests/phase-c-verify.spec.js:13`：50。
- `tests/c1-c2-verify.spec.js:13`：58。
- `tests/c3-c4-c5-verify.spec.js:13`：68。

### Baseline regression 重複

- v1.1 frozen smoke、v2 tabs smoke 重複。
- Prompt Lab 116 條 load all、搜尋、category、copy、apply 重複。
- Audit 8 dimensions / grade、Style Studio chips / persistence、localStorage persistence 重複。

### C-1~C-5 覆蓋狀態

- Smart four step id 與 class 覆蓋：`tests/c3-c4-c5-verify.spec.js:920` 到 `tests/c3-c4-c5-verify.spec.js:984`。
- Smart to Design bridge 覆蓋：`tests/c3-c4-c5-verify.spec.js:991`。
- Smart to NLM bridge 覆蓋：`tests/c3-c4-c5-verify.spec.js:1007`。
- Smart to Audit bridge 覆蓋：`tests/c3-c4-c5-verify.spec.js:1021`。
- Quick audit collapse / expand / apply / send 覆蓋：`tests/c3-c4-c5-verify.spec.js:1036` 到 `tests/c3-c4-c5-verify.spec.js:1086`。
- Prompt Lab chips / similar examples / open full lab 覆蓋：`tests/c3-c4-c5-verify.spec.js:1088` 到 `tests/c3-c4-c5-verify.spec.js:1131`。
- NLM prefill 覆蓋：`tests/c3-c4-c5-verify.spec.js:1133` 到 `tests/c3-c4-c5-verify.spec.js:1158`。

### 尚未覆蓋

- P1：keyboard navigation、focus order、focus visible、icon-only controls accessible name。
- P1：corrupted localStorage fallback、OpenAI API success path mock、NLM prefill 後返回 Step 1~4 修改再產生。
- P2：prefers-reduced-motion、color contrast regression、settings clear-all、quickAuditApplied reset。

## §六、Code Quality Hot Spots

### 真正的 dead code

- P1：`TagSelector` 未看到任何呼叫。
- 位置：`web/forma-studio-v2.html:577`。
- 判斷：可刪或留到下輪重構前標 legacy；目前是 dead component。

- P1：`ApiKeyBar` 已被 `ApiKeyInline` 取代。
- 位置：`web/forma-studio-v2.html:1257`。
- 判斷：可刪；現行 header 使用 `ApiKeyInline`，見 `web/forma-studio-v2.html:6231`。

- P2：Smart `done` state 已無 render 作用。
- 位置：`web/forma-studio-v2.html:1791`。
- 判斷：`setDone` 仍被呼叫，但 Step UI 已由 `step` 決定。

- P2：Design `sec2Done` 計算後未使用。
- 位置：`web/forma-studio-v2.html:3933`。
- 判斷：可刪，或用於 Step 2 gating。

### 未用或弱用 state / function

- P2：`quickAuditApplied` label 可能 stale。
- 位置：`web/forma-studio-v2.html:1796`、`web/forma-studio-v2.html:2473`。
- 建議：在 `txt` / `out` 變更時 reset，或把 label 改成純結果提示。

- P2：`StepShell` 用 `useCallback` 但依賴只列 `[step]`。
- 位置：`web/forma-studio-v2.html:2169` 到 `web/forma-studio-v2.html:2180`。
- 判斷：目前可跑，因相關 helper 每 render 重建且 step 變更觸發重建；但這裡其實不需要 `useCallback`。

### 重複 helper 可抽 module-level

- P1：bridge note builder。
- 位置：`web/forma-studio-v2.html:6117` 到 `web/forma-studio-v2.html:6201`。
- 可抽：`makeLandingNote(source, target, kind, payload)`。

- P1：step class helper。
- 位置：Smart `web/forma-studio-v2.html:2162`；NLM `web/forma-studio-v2.html:2669`；Design `web/forma-studio-v2.html:3684`。
- 可抽：`getStepStatus(current, n)` 與 `getStepClass(status)`。

- P1：prompt-library derived filtering。
- 位置：Smart similar examples `web/forma-studio-v2.html:2123`；Prompt Lab visible filter `web/forma-studio-v2.html:4691`。
- 可抽：`filterPromptLibrary(prompts, filters)`。

## §七、Phase 結束總體成果

### 行數

- v1.1：`web/forma-studio.html` 3422 行。
- v2.0：`web/forma-studio-v2.html` 6270 行。
- 差異：+2848 行。
- tests：10 個 spec，6773 行。
- docs：12 份 `PLAN-*.md`，另有 Health Check 與本 Final Review。

### 文件數量校正

- 任務背景提到「9 spec 檔 + 9 PLAN 文件」。
- repo 現況是 10 spec 檔。
- repo 現況是 12 PLAN 文件。
- 此差異不是問題，反而代表 Phase C / C-1-C2 / C-3-C5 都有補文件。

### GitHub commit 史時間軸

- `cc9aaa0`：import v1.1 baseline from upstream。
- `6ce5a9d`：Sprint 0，建立 v2.0 baseline。
- `05778b6`：Sprint 1，Prompt Lab tab + 116 prompts + cross-tab apply。
- `6cd1b02`：Sprint 1.5，中文標題與中文搜尋。
- `d173add`：Sprint 1.6 + 1.7，中文摘要與全文翻譯。
- `c983958`：Sprint 1.8，UX 引導、完成卡、landing note。
- `9c56e5c`：Sprint 2，Audit & Enhance。
- `72c7d88`：Sprint 3，Style Studio。
- `7625880`：Sprint 4，localStorage 持久化。
- `e814595`：Sprint 5，README + CHANGELOG 文件收尾。
- `916dde5`：Phase C，B-lite + Truly-Neutral + PPT Flow Lite。
- `d33ad25`：C-1 + C-2，Smart 4 區塊 glow + 分流。
- `6e464cd`：C-3 + C-4 + C-5，快速體檢 + Prompt Lab 入口 + NLM 預填。

### 整體成果

- v1.1 frozen contract 完整保留，v2.0 已從 baseline 擴張成 6 個頂層 tab + settings。
- Smart 已成為主入口；Prompt Lab、Audit、Style Studio、NotebookLM 都已接上跨 tab workflow。
- Prompt Lab 有 116 條 prompt 與完整中文化；Audit 有 8 維度與歷史；Style Studio 有 5 類別 chips；NotebookLM 有 5 step、PPT Flow Lite、Smart prefill。

## §八、改進建議（依優先級）

### P0 改進

- 數量：0。
- 未發現阻擋 v2.0 RC1 的 console-level 或契約破壞問題。
- 未發現 `web/forma-studio.html` 被修改。
- 未發現 C-1~C-5 互相覆寫導致主要路徑不可用的靜態證據。

### P1-1：統一跨 tab payload schema

- 問題描述：App 目前有 `pendingDesignPrompt`、`pendingNLMState`、`pendingAuditText`、`landingNote` 四套機制。
- 位置：`web/forma-studio-v2.html:6063` 到 `web/forma-studio-v2.html:6066`。
- 改進策略：新增 `pendingPayload` state，使用 `{ targetTab, sourceTab, kind, payload, note }` schema；各 tab 只消費自己 target 的 payload。
- 工時估計：0.75-1.0 天。
- 風險評估：中。會碰到 Design / NLM / Audit / Prompt Lab bridge，需跑最新 68 tests。

### P1-2：memoize Prompt Lab / Design / Smart derived filters

- 問題描述：多處 derived list 在 render path 計算。
- 位置：`web/forma-studio-v2.html:3722`、`web/forma-studio-v2.html:4691`、`web/forma-studio-v2.html:2123`。
- 改進策略：React import 加 `useMemo`，把 `visiblePrompts`、`galleryFiltered`、`visibleGalleryPrompts`、`similarExamples` 包成 memo。
- 工時估計：0.25-0.5 天。
- 風險評估：低。注意 `Set favorites` 的 dependency 需要轉成 stable array 或保留 Set reference 更新。

### P1-3：補 symbol-only button accessible name

- 問題描述：`×` / `✕` 類按鈕對 screen reader 不清楚。
- 位置：`web/forma-studio-v2.html:2283`、`web/forma-studio-v2.html:4000`、`web/forma-studio-v2.html:5952`。
- 改進策略：補 `aria-label`，例如 `移除已上傳檔案`、`關閉設定面板`、`清除欄位`。
- 工時估計：0.25 天。
- 風險評估：低。視覺不變。

### P1-4：清理 dead code 與 unused state

- 問題描述：`TagSelector`、`ApiKeyBar`、Smart `done`、Design `sec2Done` 已無實際用途。
- 位置：`web/forma-studio-v2.html:577`、`web/forma-studio-v2.html:1257`、`web/forma-studio-v2.html:1791`、`web/forma-studio-v2.html:3933`。
- 改進策略：刪除未用元件與 state；若擔心未來用到，先開 issue，不留死碼在單檔。
- 工時估計：0.25-0.5 天。
- 風險評估：低到中。刪 component 前用 `rg` 再確認引用。

### P1-5：修 useEffect dependency / handler stability

- 問題描述：pending effects 省略 handler dependency。
- 位置：`web/forma-studio-v2.html:2612`、`web/forma-studio-v2.html:3732`、`web/forma-studio-v2.html:5044`。
- 改進策略：把 `goStep`、consume callback、pushHistory 包成 `useCallback`，或把 effect 內邏輯改成 local pure function。
- 工時估計：0.5 天。
- 風險評估：中。需確保不造成 duplicate consume 或 history 重複寫入。

### P1-6：測試 helper 化，建立 master spec

- 問題描述：10 個 spec 複製 baseline regression，維護壓力高。
- 位置：`tests/c3-c4-c5-verify.spec.js:204`、`tests/sprint4-verify.spec.js:197`。
- 改進策略：抽 `tests/helpers.js`，保留最新 `master-verify.spec.js` 作完整 68 steps；舊 spec 降為歷史 smoke。
- 工時估計：1.0-1.5 天。
- 風險評估：中。需保留災後可追溯性，不要一次刪光歷史 spec。

### P1-7：補 coverage：keyboard、corrupted storage、API mock

- 問題描述：目前測試偏 click path，缺 accessibility 與 failure-mode tests。
- 位置：`tests/c3-c4-c5-verify.spec.js:1162` 只收 console/page errors；沒有 a11y assertions。
- 改進策略：新增 5-8 個 focused tests：tab order、settings escape/close、invalid JSON fallback、API enhance mocked success、NLM prefill 修改後再產生。
- 工時估計：0.75-1.0 天。
- 風險評估：低到中。可能暴露現有 a11y 小問題。

### P1-8：建立 source split，但仍輸出單檔

- 問題描述：`web/forma-studio-v2.html` 已 6270 行。
- 位置：`web/forma-studio-v2.html:1`。
- 改進策略：新增 `src/` 作開發來源，拆 `SmartTab.jsx`、`PromptLabTab.jsx`、`AuditTab.jsx`、`NLMTab.jsx`、`bridge.js`；build 產出仍覆寫單檔 HTML。
- 工時估計：2-3 天。
- 風險評估：高。不是 RC1 前必要工作，適合 Sprint 2.x。

### P1-9：更新 README / CHANGELOG 到 Phase C 現況

- 問題描述：README 與 CHANGELOG 還停在 Phase B/Sprint 5 語境。
- 位置：`README.md:17`、`CHANGELOG.md:3`。
- 改進策略：補 C-1~C-5 摘要、6270 行現況、RC1 判斷、最新 spec 數量。
- 工時估計：0.25-0.5 天。
- 風險評估：低。文件更新，不碰 runtime。

### P2-1：tone table 與 palette 收斂

- 問題描述：amber/yellow/cyan/purple/teal 語意分散。
- 位置：`web/forma-studio-v2.html:407`、`web/forma-studio-v2.html:4643`、`web/forma-studio-v2.html:2971`。
- 改進策略：建立 `TONE_CLASSES` map，規範 success/warning/info/danger/bridge。
- 工時估計：0.5 天。
- 風險評估：低。主要是 class 改動，需截圖驗證。

### P2-2：quickAuditApplied reset

- 問題描述：套用補強後，使用者改 prompt 時 label 可能 stale。
- 位置：`web/forma-studio-v2.html:1796`、`web/forma-studio-v2.html:2189`、`web/forma-studio-v2.html:2473`。
- 改進策略：在 `txt` / `out` 改變時 `setQuickAuditApplied(false)`，或移除 label 狀態。
- 工時估計：0.25 天。
- 風險評估：低。

### P2-3：prefers-reduced-motion

- 問題描述：glow animation 沒有 reduced motion fallback。
- 位置：`web/forma-studio-v2.html:27` 到 `web/forma-studio-v2.html:45`。
- 改進策略：加 `@media (prefers-reduced-motion: reduce)`，停用 `glowPulse` / `dotPulse` / `fadeUp`。
- 工時估計：0.25 天。
- 風險評估：低。

### P2-4：低對比小字 pass

- 問題描述：多處操作說明使用 `text-slate-500` 或 `text-slate-600`。
- 位置：`web/forma-studio-v2.html:2263`、`web/forma-studio-v2.html:2418`、`web/forma-studio-v2.html:2538`。
- 改進策略：操作性說明升到 `text-slate-400`；純 meta 可保留 slate-500。
- 工時估計：0.25-0.5 天。
- 風險評估：低。

### P2-5：Smart Prompt Lab chips 的來源提示

- 問題描述：Step 1 chips 填入英文 prompt 後，使用者不一定知道來源是哪個 prompt。
- 位置：`web/forma-studio-v2.html:2315` 到 `web/forma-studio-v2.html:2319`。
- 改進策略：點 chip 後顯示一行 `已套用：titleZh/title`，或把 `pending source` 放在 Step 2 reasons。
- 工時估計：0.25-0.5 天。
- 風險評估：低。

### P2-6：NLM prefill 的 Step 5 jump 提示再加強

- 問題描述：C-5 直接 `setStep(5)`，使用者可能覺得前面被跳過。
- 位置：`web/forma-studio-v2.html:2627`、`web/forma-studio-v2.html:2824`。
- 改進策略：banner actions 增加「檢查 Step 1」與「檢查 Step 2」，或在 Step 5 加小型 prefill summary。
- 工時估計：0.5 天。
- 風險評估：低到中。需避免干擾現有 C-5 tests。

### P2-7：Settings clear-all 行為補測

- 問題描述：Settings panel 有 clear all，但測試更偏 visible / clickable。
- 位置：`web/forma-studio-v2.html:6032`、`tests/sprint4-verify.spec.js:794`。
- 改進策略：新增測試寫入多個 `forma-v2.*` key，點 clear all 後 assert 全部清除。
- 工時估計：0.25-0.5 天。
- 風險評估：低。

## §九、最終結論

### v2.0 是否可以結案

- 可以以「v2.0 功能重建完成」結案。
- 不建議宣稱「所有品質債已清零」。
- 正確標記應是：v2.0 RC1。

### 是否該標記版本為 v2.0 RC1

- 建議標記為 v2.0 RC1。
- 理由：0 P0、v1.1 frozen contract 完整、最新 68 test 已知 pass、C-1~C-5 主功能都有專項 spec。
- 但 RC1 前最好做最小 P1 cleanup：a11y label、dead code、memoize filters、README/CHANGELOG 更新。

### 是否還有必須做的事

- 沒有阻擋結案的 P0。
- 有 9 個 P1 建議，其中最值得優先做的是 bridge schema、test helper、a11y/performance cleanup。
- 有 7 個 P2 可選改善，主要是 polish 與文件同步。

### 適合做的 Sprint 2.x 後續

- Sprint 2.1：RC1 cleanup。
- 內容：P1-2、P1-3、P1-4、P1-5、P1-9。
- 估時：1-2 天。

- Sprint 2.2：Bridge schema。
- 內容：P1-1，統一 `pendingPayload<TAB>`，並補 Design / Audit / NLM bridge regression。
- 估時：1 天。

- Sprint 2.3：Test architecture。
- 內容：P1-6、P1-7，把 10 spec 的重複 baseline 收斂成 helper + master spec。
- 估時：1.5-2 天。

- Sprint 2.4：Source split。
- 內容：P1-8，建立可維護源碼結構，但保留單檔發佈。
- 估時：2-3 天。

### 最終判斷

- v2.0 已從災後重建狀態進入可發布候選狀態。
- 目前不需要再把 C-1~C-5 當「未完成」。
- 接下來應該停止繼續往 Smart 疊大功能，先做 RC1 cleanup 與 bridge schema。
- 若要公開版本，建議 tag 為 `v2.0-rc1`，並在 release note 明確列出仍未覆蓋的 a11y / corrupted storage / API mock 測試。
