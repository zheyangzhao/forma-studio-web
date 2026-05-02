# Forma Studio Web v2.0

Forma Studio Web v2.0 是一個純前端的 AI 設計提示詞工作坊，用來把模糊需求轉成可交給 Claude Design、NotebookLM、GPT Image 2、Midjourney 或其他生成式工具的高品質 prompt。

本 repo 目前專注 Web 版。v1.1 穩定版保留為凍結對照，v2.0 則在 `web/forma-studio-v2.html` 持續重做與增強。

## v1.1 凍結契約

`web/forma-studio.html` 是 v1.1 凍結版，後續 sprint 不得修改。

凍結契約見 [`docs/CONTRACT-v1.1-frozen.md`](docs/CONTRACT-v1.1-frozen.md)。除非有明確資安漏洞或不可回避的瀏覽器棄用，任何 PR 都應讓 `web/forma-studio.html` 保持 0 行 diff。

## v2.0 入口

主要檔案：

- `web/forma-studio-v2.html`：v2.0 RC1 主程式。Final Review 時為 6270 行；RC1 cleanup 後為 6182 行。
- `web/forma-studio.html`：v1.1 凍結版，只做對照與回退。
- `web/prompt-library/`：116 條 prompt 的來源 JSON 與中文翻譯資料。

## v2.0 功能總覽

v2.0 目前整理為 8 個頁籤級工作區。頂層 UI 是 7 個主 tab，其中 `Claude Design` 內含「品牌與評審」子工作區，文件上列為獨立頁籤級能力，方便使用者按任務尋路。

### 1. 智慧製圖

`智慧製圖` 是入口分流器。使用者可輸入自然語言需求，系統會判斷適合走圖像生成、資訊圖表、UI 原型、品牌資產或 NotebookLM 任務，並產出對應 prompt。完成後可送到 Claude Design 精修，也可直接送去體檢。

### 2. Claude Design

`Claude Design` 是核心設計 prompt 工作台，保留 v1.1 的 glow 流程 DNA。它支援需求描述、受眾基調、製圖方式、風格與品牌參考，最後輸出可貼到 Claude Code、Cursor、Hermes 或圖像工具的設計 prompt。

### 3. NotebookLM

`NotebookLM` 產出任務指令與自定義指示，支援內容整理、簡報腳本、衛教資料、社群素材與來源素材工作流。Sprint 1.8 後加入 Step 5 貼上順序卡；Phase C-5 讓 Smart 可預填 NotebookLM 前 4 步並直接跳到 Step 5，仍可回前面修改。

### 4. 提示詞庫 Prompt Lab

`Prompt Lab` 收錄 116 條 prompt，來源包含 `wuyoscar/gpt_image_2_skill` 66 條與 `EvoLinkAI/awesome-gpt-image-2-prompts` 50 條。卡片支援中文標題、中文摘要、中文全文翻譯、英文原文複製、來源/製圖方式/分類篩選、中文搜尋、收藏，以及套用到 Claude Design 或送去體檢。

### 5. 體檢 & 增強

`體檢 & 增強` 提供 8 維度本地評分，包含任務意圖、受眾情境、核心訊息、構圖/版面/色彩、in-image 文字、size/quality/negative、反 AI Slop 與 source attribution。它會給出 0-100 分、A-F 等級、缺失與補強項，也可用 GPT-4o-mini 產出 AI 增強版。

### 6. 風格實驗室 Style Studio

`Style Studio` 用 5 類別 chips 組英文 prompt：人像/商業攝影、海報/插畫、UI/產品介面、角色/吉祥物、醫學圖解/衛教。使用者選尺寸、品質、主題與風格 chips 後，可直接套用到 Claude Design 或送去體檢。

### 7. 品牌與評審

`品牌與評審` 位於 Claude Design 子頁籤。它包含品牌資產協議與 5 維度設計評審，可引導使用者先確認品牌存在性、Logo、產品圖、色票、字體與品牌規範，再生成可交給 Claude Code 執行的品牌還原 prompt。

### 8. 彩蛋 Lab

`彩蛋 Lab` 提供快速實驗模式，包括病毒傳播版、TED 風格版、四受眾批次改寫與反 AI Slop 診斷。Sprint 1.8 後每個模式都有下一步引導，可送 NotebookLM 或送體檢。

## 災後重做緣起

2026-05-01 發生誤刪事件，原 v2.0 主程式遺失。本 repo 從 v1.1 baseline 重新建立 Web v2.0，並把重做過程拆成 sprint 留痕。

重做節奏：

- Sprint 0：建立 `web/forma-studio-v2.html` baseline，保留 v1.1 凍結契約。
- Sprint 1：新增 Prompt Lab，整合 116 條 prompt 與跨 tab 套用。
- Sprint 1.5：加入 116 條中文標題、中英雙語卡片與中文搜尋。
- Sprint 1.6 + 1.7：補齊 116 條中文摘要與中文全文翻譯。
- Sprint 1.8：補上 12 項 UX 引導、完成卡與跨 tab 下一步說明。
- Sprint 2：新增 Audit & Enhance，本地 8 維度評分與 AI 增強。
- Sprint 3：新增 Style Studio，5 類別 chips 組英文 prompt。
- Sprint 4：新增 v2-only localStorage 持久化與設定面板。
- Sprint 5：文件收尾，同步 README、CHANGELOG 與 sprint plan。
- Phase C：把 Smart 改成 4 區塊 glow 分流器，強化 Step 1 輸入、Step 2 AI 判斷、Step 3 下一步路由、Step 4 結果落地。
- C-1 + C-2：補 Smart 4-step flow、跨 tab landing note、Claude Design / Audit / NLM 導向。
- C-3 + C-4 + C-5：加入 Smart quick audit、Prompt Lab chips / 相近範例、NotebookLM 預填橋接。
- Final Review：完成 `docs/FINAL-REVIEW-2026-05-02.md`，確認 v1.1 frozen 契約、10 個 spec 與 C-3/C-4/C-5 master spec 的 68 steps。
- RC1 cleanup：完成 P1-2 / P1-3 / P1-4 / P1-5 / P1-9；不包含 P1-1、P1-6、P1-7、P1-8。

## RC1 狀態

- 日期：2026-05-02。
- v1.1 凍結檔：`web/forma-studio.html`，3422 行，RC1 cleanup 不修改。
- v2.0 主程式：`web/forma-studio-v2.html`，6182 行。
- 測試現況：`tests/c3-c4-c5-verify.spec.js` 記錄 68 個 C-3/C-4/C-5 驗證步驟；repo 目前有 10 個 Playwright spec。
- RC1 cleanup 範圍：memoized derived filters、symbol-only button accessible names、dead code / unused state 清理、pending effect dependency / callback stability、README / CHANGELOG 同步。

## Quick Start

從 repo 根目錄啟動靜態伺服器：

```bash
cd ~/Projects/forma-studio-web
python3 -m http.server 8765
```

開啟 v2.0：

```text
http://localhost:8765/web/forma-studio-v2.html
```

開啟 v1.1 凍結版：

```text
http://localhost:8765/web/forma-studio.html
```

## 專案結構

```text
.
├── README.md
├── CHANGELOG.md
├── LICENSE
├── docs/
│   ├── CONTRACT-v1.1-frozen.md
│   ├── FINAL-REVIEW-2026-05-02.md
│   ├── HEALTH-CHECK-2026-05-02.md
│   ├── PLAN-phase-c.md
│   ├── PLAN-c1-c2.md
│   ├── PLAN-c3-c4-c5.md
│   ├── PLAN-sprint-0.md
│   ├── PLAN-sprint-1.md
│   ├── PLAN-sprint-1.5.md
│   ├── PLAN-sprint-1.6-1.7.md
│   ├── PLAN-sprint-1.8.md
│   ├── PLAN-sprint-2.md
│   ├── PLAN-sprint-3.md
│   ├── PLAN-sprint-4.md
│   └── PLAN-sprint-5.md
├── tests/
│   ├── sprint*-verify.spec.js
│   ├── phase-c-verify.spec.js
│   ├── c1-c2-verify.spec.js
│   └── c3-c4-c5-verify.spec.js
└── web/
    ├── forma-studio.html
    ├── forma-studio-v2.html
    ├── manifest.json
    ├── service-worker.js
    ├── README.md
    └── prompt-library/
        ├── gallery-index.json
        ├── translations-zh.json
        └── *.json
```

## 開發邊界

- v1.1 凍結版：不要修改 `web/forma-studio.html`。
- v2.0 主程式：RC1 cleanup 只做低-中風險修整，不做 payload schema 統一或 source split。
- 測試：RC1 cleanup 不新增 coverage；C-3/C-4/C-5 68 steps 由 Playwright master spec 驗證。
- 本機救援資料：`~/forma-rebuild/` 僅供參考，不進版控。

## License

MIT，見 [`LICENSE`](LICENSE)。
