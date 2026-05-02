# Forma Studio Web v2.0 C-3 + C-4 + C-5 合併規劃

日期：2026-05-02

工作目錄：`$HOME/Projects/forma-studio-web`

目標檔案：

1. `web/forma-studio-v2.html`
2. `tests/c3-c4-c5-verify.spec.js`
3. `docs/PLAN-c3-c4-c5.md`

禁止修改：

1. `web/forma-studio.html`
2. `package.json`
3. `node_modules`
4. 桌面路徑

## 1. 背景

本次接在 C-1 + C-2 之後。

C-1 已把 Smart 首頁改成 4 區塊 glow flow。

C-2 已加入快速 / 完整 / 專業工具分流。

C-3、C-4、C-5 是進階段落。

這三段不重做既有專業 tab。

Smart 只做輕量入口、摘要與跨 tab bridge。

依據：`~/forma-rebuild/docs-reconstructed/PLAN-c-wizard-detail.md` §四 4.4-4.6。

## 2. 合併策略

合併原則：

1. 保留 6 主 tab + 設定。
2. Smart 仍是唯一 C wizard 宿主。
3. AuditTab、PromptLabTab、NLMTab 不被 wizard 化。
4. C-3 只重用 `runAudit` score，不複製完整 Audit UI。
5. C-4 只引用 Prompt Lab 資料，不重做 Prompt Lab 搜尋。
6. C-5 只做 App-level pending state，不破壞 NLM 5 step。

本次不做：

1. 不改 v1.1。
2. 不新增主 tab。
3. 不引入 fuzzy search。
4. 不引入 build system。
5. 不新增 package。
6. 不接 OpenAI API。

## 3. 現況基準

`web/forma-studio-v2.html` 目前結構：

1. `SmartTab` 在主入口。
2. `NLMTab` 是完整 5 step。
3. `PromptLabTab` 已有 `loadPromptLibrary`。
4. `AuditTab` 已有 module-level `runAudit`。
5. `App` 已有 `pendingDesignPrompt`。
6. `App` 已有 `pendingAuditText`。
7. `App` 已有 `landingNote`。
8. `sendPromptToAudit` 可跨 tab 帶文字。

C-3 可以直接呼叫 `runAudit`。

C-4 可以直接呼叫 `loadPromptLibrary`。

C-5 參照 `pendingDesignPrompt` 做 `pendingNLMState`。

## 4. C-3 快速體檢摘要

目標：

1. Smart flow 內提供可跳過的 quick audit。
2. 顯示 Score。
3. 顯示 Grade。
4. 顯示 3 個通過。
5. 顯示 3 個補強。
6. 提供套用補強。
7. 提供送完整 Audit。

放置位置：

1. 在 Smart Step 3 與 Step 4 之間。
2. 不作為新的 wizard step。
3. 不影響 C-1 四個 `smart-step-*` id。
4. 預設折疊。

原因：

1. 使用者可直接略過。
2. 不拖慢快速複製流程。
3. Test 可直接定位 `#smart-quick-audit`。
4. Step 4 的輸出區仍保留原本責任。

資料來源：

1. 優先 audit `out`。
2. 若尚未產出，audit `txt`。
3. 呼叫 module-level `runAudit`。

摘要規則：

1. `pass` 取前 3 筆。
2. `warn` + `fail` 取前 3 筆。
3. 顯示 `passCount` / `warnCount` / `failCount`。
4. 顯示 `score` / `grade`。

套用補強：

1. 取 3 個補強項目的 `label` 與 `suggest`。
2. 組成 `【快速體檢補強】` 區塊。
3. append 到 Smart Step 1 textarea。
4. 若已有 `out`，也 append 到輸出 prompt。
5. 若已套用過，不重複 append。

送完整 Audit：

1. 使用既有 `finishAudit` / `onSendAudit`。
2. 帶入 `Smart 智慧製圖` source label。
3. 保留 `landingNote`。
4. 進 AuditTab 後由 `pendingAuditText` 消費。

風險：

1. 如果使用者輸入很短，score 可能偏低。
2. 如果輸出 prompt 是中文，部分英文檢查可能給 warn。
3. 這是快速摘要，不等於完整體檢流程。

緩解：

1. 文案說明「重用完整 Audit 的 8 維度 score」。
2. 按鈕提供「送完整 Audit」。
3. 預設折疊，避免使用者以為被強制審查。

## 5. C-4 Prompt Lab 快速範例入口

目標：

1. Smart Step 1 下方加入 prompt-library chips。
2. 從 116 條 Prompt Lab 資料中取 6-8 條。
3. chip 顯示中文標題。
4. 點 chip 填入 prompt 全文。
5. Smart Step 4 下方顯示相近範例卡片。
6. 卡片提供套用。
7. 卡片提供開完整 Prompt Lab。

資料載入：

1. 新增 `useGalleryRandom(n)` hook。
2. hook mount 時呼叫 `loadPromptLibrary()`。
3. 回傳 `prompts` 與 `random`。
4. 不新增 Prompt Lab 專用 fetch 邏輯。
5. 不改 Prompt Lab tab 內的 loader。

隨機策略：

1. 以日期 seed 做穩定 shuffle。
2. 同一天結果穩定。
3. 隔天可更新。
4. 測試不依賴特定 prompt id。

Step 1 chips：

1. 保留原有六個手寫 quick examples。
2. 新增 Prompt Lab chips 區塊。
3. 顯示 6-8 個 `titleZh || title`。
4. 點擊後 `setTxt(item.englishPrompt || item.prompt)`。
5. 不自動切 tab。

相近範例：

1. 新增 `pickSimilarGalleryPrompts`。
2. 以 `txt`、`out`、`selDomain`、`selTask`、`selSub` 組關鍵字。
3. 中文關鍵字映射到 gallery metadata。
4. 使用 `searchText`、`categorySlug`、`industries`、`useCases`。
5. 不做 fuzzy search。
6. 不做向量搜尋。
7. 命中不足時用 stable random 補足。
8. 顯示 3-6 張卡片。

卡片內容：

1. 中文分類。
2. 中文標題。
3. 中文摘要或英文預覽。
4. 套用按鈕。
5. 開完整 Prompt Lab 按鈕。

套用行為：

1. 將英文 prompt 寫回 Smart textarea。
2. 將英文 prompt 寫到 `out`。
3. 保持在 Step 4。
4. 清掉 route result。

開完整 Prompt Lab：

1. 呼叫 `goTab('promptlab', landingNote)`。
2. landingNote 來源為 Smart。
3. PromptLabTab 顯示 banner。
4. 不帶搜尋條件。

風險：

1. Smart 內出現第二套小型 Prompt Lab UI。
2. 使用者可能以為卡片就是完整庫。
3. gallery 載入失敗會讓 chips 空白。

緩解：

1. 文案寫「開完整 Prompt Lab」。
2. 只顯示精簡卡片。
3. 載入失敗不阻擋手動輸入。

## 6. C-5 NotebookLM 預填橋接

目標：

1. Smart 偵測 NLM route 時預填 NLM。
2. 預填 task。
3. 預填 domain。
4. 預填 framework。
5. 預填 tone。
6. 提供「進 NotebookLM 完整 5 step（已預填 4 步）」。
7. NLM tab 顯示來源 banner。

App state：

1. 新增 `pendingNLMState`。
2. 形狀：`task/domain/customDomain/framework/queryMode/depth/tone/lang/prompt`。
3. 由 Smart 設定。
4. 由 NLMTab 消費。
5. 消費後清空。

Smart 端：

1. 新增 `buildNlmPrefillState`。
2. 從 `selTask` / `selDomain` / `selFW` / `selAud` 抽出。
3. domain 不在 `DOMAINS_DB` 時使用 `自訂領域`。
4. framework 不在 DB 時 fallback `GUIDE 寫作框架`。
5. tone 依受眾與任務粗略映射。
6. Step 2 非 design route 顯示預填按鈕。
7. Step 3 NLM action 同樣使用預填。

NLM 端：

1. `NLMTab` 接 `pendingNLMState`。
2. `useEffect` 消費 pending state。
3. 設定 task。
4. 設定 domain / customDomain。
5. 設定 framework。
6. 設定 queryMode。
7. 設定 depth / tone / lang。
8. `setStep(5)`。
9. scroll 到 `ns5`。

landingNote：

1. title：已從 Smart 預填 NotebookLM 前 4 步。
2. body：可直接到 Step 5 產生指令，或回前面修改。
3. steps 增加「狀態：已從 Smart 預填...」。
4. action 保留我知道了 / 回 Smart。

不做：

1. 不改 NLM 的 5 step 結構。
2. 不新增 NLM 模式。
3. 不跳過使用者修改能力。
4. 不把 Smart prompt 塞成 NLM 原始 textarea，因 NLM 本身沒有素材 textarea。

風險：

1. 使用者不知道 Step 5 已可用。
2. 自訂 domain 顯示在 Step 2 done badge。
3. `setStep(5)` 可能讓使用者覺得前面被跳過。

緩解：

1. banner 明確提示「可直接到 Step 5，或回前面修改」。
2. 所有前面 steps 仍可點選修改。
3. 保留原 NLM reset。

## 7. 測試設計

新測試檔：`tests/c3-c4-c5-verify.spec.js`。

來源：複製 `tests/c1-c2-verify.spec.js`。

基準：

1. 保留 Test 1-58。
2. `report.totalSteps` 改為 68。
3. 保留 `permissions: []`。
4. 保留 `clickHeaderTab` helper。
5. Smart textarea 用 `textarea[placeholder*="補充說明"]`。

新增：

1. Test 59：快速體檢段存在且預設折疊。
2. Test 60：展開後顯示 Score / Grade / 3 通過 / 3 補強。
3. Test 61：套用補強後 Smart textarea 內容變更。
4. Test 62：送完整 Audit 後切到 Audit tab。
5. Test 63：Step 1 chips 有 6-8 個 Prompt Lab 範例。
6. Test 64：點 prompt chip 後 textarea 填入全文。
7. Test 65：Step 4 顯示 3-6 條相近範例卡片。
8. Test 66：開完整 Prompt Lab 後切 tab 並顯示 landingNote。
9. Test 67：輸入文獻整理後 Step 2 顯示 NLM 預填按鈕。
10. Test 68：點預填按鈕後 NLM 顯示 banner 並預填 task/domain/framework。

## 8. 驗收命令

建議驗收：

1. JSX parse：以 Babel standalone 或瀏覽器載入 smoke 確認。
2. v1.1 diff：確認 `web/forma-studio.html` 無改動。
3. 行數：`wc -l web/forma-studio-v2.html tests/c3-c4-c5-verify.spec.js`。
4. 測試：`node tests/c3-c4-c5-verify.spec.js`。
5. git：`git status --short`。

## 9. 成功標準

功能成功：

1. Smart 快速流程仍可 3 步複製。
2. 快速體檢可展開、補強、送 Audit。
3. Prompt Lab chips 能填 textarea。
4. 相近範例能套用。
5. Prompt Lab landingNote 可見。
6. NLM 預填後 Step 5 可直接產生指令。

回歸成功：

1. 58 個 baseline 測試不破。
2. v1.1 無 diff。
3. 無 console/page errors。
4. 6 主 tab 結構不變。
