# Forma Studio Web v2.0 CHANGELOG

> 本檔案紀錄 `web/forma-studio-v2.html` 從 v1.1 baseline 到 v2.0 RC1 cleanup 的重做歷程。
> `web/forma-studio.html` 是 v1.1 凍結版，規則見 `docs/CONTRACT-v1.1-frozen.md`。

---

## v2.0 RC1 cleanup（2026-05-02）

完成 Final Review §八 指定的 P1-2 / P1-3 / P1-4 / P1-5 / P1-9。
`web/forma-studio-v2.html` 從 Final Review 時的 6270 行降到 6182 行；`web/forma-studio.html` 維持 v1.1 frozen，不修改。

- P1-2：memoize Smart quick audit / similar examples、Design gallery filters、Prompt Lab visible prompts。
- P1-3：補 Smart / Design 檔案移除按鈕與設定面板關閉按鈕的 accessible name。
- P1-4：刪除 v2 未用 `TagSelector`、`ApiKeyBar`、Smart `done` state、Design `sec2Done`。
- P1-5：穩定 Design `goStep`、Audit `pushHistory`、pending payload consume callbacks，補 useEffect dependencies。
- P1-9：同步 README / CHANGELOG 到 Phase C、Final Review 與 RC1 現況。

未納入 RC1 cleanup：P1-1 pendingPayload schema、P1-6 master spec helper 化、P1-7 新 coverage、P1-8 source split。

## Final Review（2026-05-02）

新增 `docs/FINAL-REVIEW-2026-05-02.md`，靜態審視 v2.0 Phase C 後狀態。
Review 確認 P0 = 0、v1.1 frozen 契約維持、v2 主程式 6270 行、repo 10 個 Playwright spec，最新 C-3/C-4/C-5 spec 記錄 68 個驗證步驟。

## Phase C：Smart 4-step glow flow

將 `智慧製圖` 從單純 prompt 產生器升級為 4 區塊分流入口：輸入、AI 判斷、下一步路由、結果落地。
新增跨 tab landing note，讓 Smart 可導向 Claude Design、NotebookLM、Prompt Lab 與 Audit。

## C-3 + C-4 + C-5

完成 Smart quick audit、Prompt Lab chips / 相近範例、NotebookLM 預填橋接。
`tests/c3-c4-c5-verify.spec.js` 作為最新 master-style regression，記錄 68 個驗證步驟。

## C-1 + C-2

補齊 Smart 4-step glow flow 與跨 tab 導向基礎，包含 Step 3 action card、Step 4 route result、Smart 到 Claude Design / Audit / NLM 的 payload 串接。

## Phase C 規劃

新增 `docs/PLAN-phase-c.md`、`docs/PLAN-c1-c2.md`、`docs/PLAN-c3-c4-c5.md`，把 Smart 重構與 C 系列增強拆成可驗證階段。

---

## v2.0 Phase B 收尾前狀態

### Sprint 4 — localStorage 持久化（commit `7625880`）

新增 v2-only localStorage 基礎設施，key 以 `forma-v2.*` 命名空間隔離。
持久化最後 tab、Prompt Lab 收藏、Style Studio 偏好、Audit 歷史與 API Key opt-in，並加入 v2 設定面板與清除流程。

### Sprint 3 — Style Studio（commit `72c7d88`）

新增 `🎬 風格實驗室`，用 5 類別 chips 組合英文 prompt。
支援人像/商業攝影、海報/插畫、UI/產品介面、角色/吉祥物、醫學圖解/衛教，並可套用到 Claude Design 或送去體檢。

### Sprint 2 — Audit & Enhance（commit `9c56e5c`）

新增 `🩺 體檢 & 增強`，依 8 維度本地評分給出 0-100 分、A-F 等級、通過/補強/缺失。
支援範例 onboarding、體檢歷史、AI 增強與回套 Claude Design。

### Sprint 1.8 — 12 項 UX 引導（commit `c983958`）

補上完成卡、下一步卡、跨 tab 來源提示與按鈕文案。
讓 Claude Design、Prompt Lab、Audit、Style Studio、NotebookLM、智慧製圖與彩蛋 Lab 的輸出都有清楚落地路徑。

### Sprint 1.6 + 1.7 — 116 中文摘要 + 全文翻譯（commit `d173add`）

為 116 條 prompt 補齊中文摘要與中文全文翻譯。
Prompt Lab 卡片展開後顯示中文摘要、中文翻譯與英文原文，讓使用者能先理解、再複製英文 prompt。

### Sprint 1.5 — 116 中文標題（commit `6cd1b02`）

新增 116 條中文標題與中英雙語卡片。
搜尋納入中文標題，並加入說明 banner，釐清「中文理解、英文複製」的使用方式。

### Sprint 1 — Prompt Lab tab（commit `05778b6`）

新增 `📚 提示詞庫`，整合 116 條 prompt、來源篩選、製圖方式篩選、分類 chips、全文搜尋與漸進載入。
建立 Prompt Lab 到 Claude Design 的跨 tab 套用流程。

### Sprint 0 — v2.0 baseline（commit `6ce5a9d`）

從 v1.1 凍結版建立 `web/forma-studio-v2.html`。
更新 v2 標題與副標，保留 v1.1 作為穩定對照，並新增 Sprint 0 規劃文件。

### v1.1 baseline import（commit `cc9aaa0`）

匯入 `forma-studio-v2.5@13e2884` 的 Web v1.1 baseline。
此後 `web/forma-studio.html` 作為凍結版保存，供 v2.0 重做期間對照與回退。

---

## Attribution

| 來源 | License | v2 用途 |
|---|---|---|
| `wuyoscar/gpt_image_2_skill` | CC BY 4.0 | 提示詞庫 66 條、audit 維度與圖像 prompt craft 參考 |
| `EvoLinkAI/awesome-gpt-image-2-prompts` | CC BY 4.0 | 提示詞庫 50 條與跨類別案例 |
| 用戶自製 claude.ai Artifact | 用戶授權 | v2.0 災前功能方向與 Style Studio UX 參考 |

## Phase B 文件狀態

- README 已同步 v2.0 現況與 8 個頁籤級工作區。
- CHANGELOG 已補齊 v1.1 baseline 到 Sprint 4 的 commit 摘要。
- Sprint 5 不修改 `web/forma-studio-v2.html`、`web/forma-studio.html` 或 `tests/`。
