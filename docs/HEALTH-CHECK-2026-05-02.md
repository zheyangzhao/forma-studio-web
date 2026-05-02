# Forma Studio Web v2.0 — Health Check Report

日期：2026-05-02

審視範圍：`web/forma-studio-v2.html` 5501 行、`tests/` 7 個 spec、`docs/` 9 個 sprint PLAN + v1.1 frozen contract、Git 狀態與重建統計。本報告只做靜態審視；未修改任何既有程式碼，未執行 Playwright、Babel parser 或 app runtime。

## §一、Executive Summary

整體健康分數：8.1 / 10。v2.0 的災後重建已達到可進 Phase C 的狀態：v1.1 凍結邊界清楚、`main` 與 `origin/main` 同步、Sprint 0-5 歷史可追溯、核心功能已從 Prompt Lab 延伸到 Audit、Style Studio、localStorage 與設定面板。沒有發現必須阻擋 Phase C 的 P0。主要風險集中在單檔 HTML 的長期可維護性、測試重複度、幾個 dead code / a11y / render-path performance 小缺口，以及 Phase C roadmap 尚未被正式文件化。

## §二、Critical Issues

目前未發現 P0 critical issue。

- P0：無。未看到會直接阻擋 Phase C 的破壞性問題。
- P0：無。`web/forma-studio.html` 仍是凍結版；`git diff -- web/forma-studio.html` 無輸出。
- P0：無。本機 `main` 與 `origin/main` 同為 `e81459595e5bd66defd7573b6eff771f02612c57`。

Phase C 前不需要先停工修 P0。

## §三、Warning Issues

### W1. P1 — Phase C roadmap 沒有正式落在 repo 文件

- 位置：`docs/PLAN-sprint-5.md:104`
- 觀察：Sprint 5 明確說「不把 Phase C 功能寫成已完成」，但沒有建立 Phase C / C-1 / C-2 roadmap。
- 影響：Phase C 的 B-lite、Truly-Neutral、PPT Flow Lite 目前仍靠外部口頭脈絡，下一輪容易 scope creep。
- 建議：Phase C 第一個 commit 先新增 `docs/PLAN-phase-c.md`，明確拆成 C-0 / C-1 / C-2 / C-3。

### W2. P1 — 測試檔高度複製，長期維護成本偏高

- 位置：`tests/sprint1-verify.spec.js:120`
- 位置：`tests/sprint2-verify.spec.js:166`
- 位置：`tests/sprint3-verify.spec.js:166`
- 位置：`tests/sprint4-verify.spec.js:197`
- 觀察：Test 1 v1.1 frozen smoke、Test 2 v2 tabs smoke、Prompt Lab 116 條、搜尋、分類、copy、apply 幾乎逐 sprint 複製。
- 影響：當 tab 數或文案改動時，至少 4-7 個 spec 需要同步改，容易產生「舊 spec 表達舊現況」的矛盾。
- 建議：Phase C 前保留 sprint 級回歸性，但抽出 shared helper；Phase C 後改成 1 個 master spec + 2 個 legacy smoke spec。

### W3. P1 — Prompt Lab 搜尋每次 render 都重新 filter 116 筆

- 位置：`web/forma-studio-v2.html:3982`
- 位置：`web/forma-studio-v2.html:3988`
- 觀察：`visiblePrompts = prompts.filter(...)` 直接在 render path 計算，未用 `useMemo`。
- 影響：116 筆目前很輕，不是 blocker；但 Phase C 若增加 subject_terms、PPT blocks 或更多資料，會讓輸入搜尋時的 re-render 成本增加。
- 建議：Phase C C-0 可順手把 `visiblePrompts` 改為 `useMemo([prompts, favOnly, favorites, activeCategory, query])`。

### W4. P1 — Design gallery filter 也在 render path 即時計算

- 位置：`web/forma-studio-v2.html:3031`
- 位置：`web/forma-studio-v2.html:3033`
- 觀察：`galleryFiltered` 與 `visibleGalleryPrompts` 每次 `DesignTab` render 都重新產生。
- 影響：現在資料量可接受；Phase C 若讓 B-lite 和 Prompt Lab 共用更多分類資料，這段會成為同類問題。
- 建議：與 W3 一起 memoize。

### W5. P1 — 部分 symbol-only button 對 screen reader 不夠清楚

- 位置：`web/forma-studio-v2.html:560`
- 位置：`web/forma-studio-v2.html:563`
- 位置：`web/forma-studio-v2.html:1831`
- 位置：`web/forma-studio-v2.html:1832`
- 位置：`web/forma-studio-v2.html:5213`
- 觀察：`?`、`×`、`✕` 這類按鈕有視覺意義，但沒有 `aria-label`。
- 影響：鍵盤與螢幕閱讀器使用者會聽到不完整或含糊的控制名稱。
- 建議：補 `aria-label="顯示說明"`、`aria-label="移除檔案"`、`aria-label="關閉設定面板"`。

### W6. P1 — useEffect dependency 有刻意省略，未來容易變成 stale closure

- 位置：`web/forma-studio-v2.html:3042`
- 位置：`web/forma-studio-v2.html:3053`
- 位置：`web/forma-studio-v2.html:4321`
- 位置：`web/forma-studio-v2.html:4330`
- 觀察：`DesignTab` pending prompt effect 使用 `goStep`、`onPendingDesignPromptConsumed`，但 dependency 只列 `pendingDesignPrompt`；`AuditTab` pending effect 使用 `pushHistory`、`clearPendingText`，也只列 `pendingText`。
- 影響：現況功能可跑，但未來拆 component 或 memoize handler 時，行為容易變得難預測。
- 建議：Phase C 前不必阻擋；C-0 cleanup 時把 handler 包成 `useCallback` 或補依賴。

### W7. P1 — 單檔 HTML 已達 5501 行，Phase C 會放大維護壓力

- 位置：`web/forma-studio-v2.html:1`
- 位置：`web/forma-studio-v2.html:5501`
- 觀察：所有資料、UI、prompt 組裝、localStorage helper、API call 都在同一個 HTML 內。
- 影響：對單檔 artifact 友善，但 code review、diff、衝突與局部測試會越來越重。
- 建議：Phase C 仍可維持單檔輸出，但開發源可考慮拆 `src/` 後 build 成單檔；若暫不拆，至少先建立 component index 註解。

### W8. P2 — Palette 有少數 purple / cyan / teal 偏離 v1.1 glow DNA

- 位置：`web/forma-studio-v2.html:411`
- 位置：`web/forma-studio-v2.html:416`
- 位置：`web/forma-studio-v2.html:4508`
- 位置：`web/forma-studio-v2.html:4587`
- 觀察：`NextStepCard` 支援 emerald / amber / cyan / rose；Audit AI enhance 使用 purple。
- 影響：不是功能問題，但與 amber / yellow / emerald / rose 的 v1.1 glow DNA 不完全一致。
- 建議：保留 cyan 作 NotebookLM 輔助色可以接受；purple 建議收斂成 amber 或 rose/emerald 狀態色。

### W9. P2 — 低對比小字較多

- 位置：`web/forma-studio-v2.html:1129`
- 位置：`web/forma-studio-v2.html:1444`
- 位置：`web/forma-studio-v2.html:2217`
- 位置：`web/forma-studio-v2.html:2369`
- 觀察：深色背景上大量 `text-slate-600` / `text-slate-500`，其中部分是提示文字。
- 影響：純提示文字可接受；若是操作說明或狀態文字，低視力使用者可讀性不足。
- 建議：下一輪 a11y pass 把操作性說明提升到 `text-slate-400` 以上。

## §四、Code Quality 觀察

### Dead Code

- P1：`ApiKeyBar` 已被 `ApiKeyInline` 取代，但仍保留。
- 引用：`web/forma-studio-v2.html:1189`
- 影響：小，但會讓新讀者誤以為有兩套 API key UI。
- 建議：C-0 cleanup 刪除或標成 legacy reference。

- P1：`TagSelector` 未被任何地方呼叫。
- 引用：`web/forma-studio-v2.html:577`
- 影響：死元件增加單檔噪音。
- 建議：刪除或在 Phase C Truly-Neutral 若要重用，先改名納入新機制。

- P2：`sec2Done` 計算後未使用。
- 引用：`web/forma-studio-v2.html:3243`
- 影響：低，但代表 step gating 曾改過未清。
- 建議：刪除，或用於 Step 2 完成判斷。

- P2：未看到大型 commented-out code block。
- 引用：`web/forma-studio-v2.html:712`
- 觀察：現有註解主要是章節說明和資料來源，不是被註解掉的舊實作。

### Consistency

- P0：tabs 陣列與 render 條件一致。
- 引用：`web/forma-studio-v2.html:5329`
- 引用：`web/forma-studio-v2.html:5479`
- 結論：`smart → design → nlm → promptlab → audit → style → lab` 與 render 條件一致。

- P2：設定按鈕不是 tabs 陣列的一員，但測試把它視為第 8 個 header button。
- 引用：`web/forma-studio-v2.html:5471`
- 引用：`tests/sprint4-verify.spec.js:546`
- 結論：現況可接受，但文件中應明確稱「7 tabs + settings button」，避免誤稱 8 tabs。

- P0：`landingNote` TTL 使用一致。
- 引用：`web/forma-studio-v2.html:5348`
- 引用：`web/forma-studio-v2.html:5372`
- 結論：預設 `ttlMs: 10000`，note 可覆蓋，effect 會依 TTL 清理。

- P2：`landingNote` 目前只在 `DesignTab` 顯示，Audit 透過 `pendingAuditText` 生效。
- 引用：`web/forma-studio-v2.html:3275`
- 引用：`web/forma-studio-v2.html:5342`
- 結論：不算 bug，但若未來所有 tab 都有 landing note，需要抽成共用入口。

- P2：Style Studio 使用 `yellow`，warning 使用 `amber`，Audit help 使用 `yellow`；語意接近但不完全統一。
- 引用：`web/forma-studio-v2.html:4931`
- 引用：`web/forma-studio-v2.html:5009`
- 建議：Phase C 視覺 pass 建立 tone table。

### Accessibility

- P1：按鈕多數有文字，主流程可讀。
- 引用：`web/forma-studio-v2.html:5466`
- 引用：`web/forma-studio-v2.html:3922`
- 結論：主要 CTA、tab、filter chip、copy/apply 都有可讀文字。

- P1：Help / close / remove 類 icon button 缺 `aria-label`。
- 引用：`web/forma-studio-v2.html:560`
- 引用：`web/forma-studio-v2.html:1418`
- 引用：`web/forma-studio-v2.html:1831`
- 引用：`web/forma-studio-v2.html:3309`
- 引用：`web/forma-studio-v2.html:5213`

- P2：tooltip 主要靠 hover，鍵盤 focus 沒有等價說明。
- 引用：`web/forma-studio-v2.html:519`
- 引用：`web/forma-studio-v2.html:560`
- 影響：鍵盤使用者能 tab 到按鈕，但不一定能取得 hover tooltip 內容。
- 建議：`onFocus/onBlur` 與 `aria-describedby` 可在 C-0 a11y pass 補。

- P2：tab order 基本合理，header → tabs → settings → main content。
- 引用：`web/forma-studio-v2.html:5448`
- 引用：`web/forma-studio-v2.html:5471`
- 風險：大量 chips 會讓 tab traversal 很長；未來可加 roving tabindex，但不是 Phase C blocker。

### Performance

- P1：Prompt Lab `visiblePrompts` 應 memoize。
- 引用：`web/forma-studio-v2.html:3982`

- P1：Design gallery derived list 應 memoize。
- 引用：`web/forma-studio-v2.html:3031`

- P2：JSX 內 inline handler 很多。
- 引用：`web/forma-studio-v2.html:5466`
- 引用：`web/forma-studio-v2.html:3926`
- 引用：`web/forma-studio-v2.html:4987`
- 結論：目前 116 prompts + 單頁 app 可接受；真正需要修的是重複 filter，而非所有 inline function。

- P2：`localStorage` writes 在 Style Studio 每次 subject / chip 變動都執行。
- 引用：`web/forma-studio-v2.html:4886`
- 影響：資料很小，不是問題；若 Phase C 加大型 subject_terms，需 debounce。

## §五、Test Coverage 盤點

### 現有 7 個 spec

- `sprint1 / 1.5 / 1.6-1.7 / 1.8 / 2 / 3 / 4` 逐 sprint 疊加，test 數約為 8 / 12 / 18 / 25 / 31 / 37 / 42。
- 最新 `tests/sprint4-verify.spec.js` 是事實上的 master spec，覆蓋 Prompt Lab、Audit、Style Studio、localStorage、settings。

### 重複度

- P1：Test 1-8 baseline 在多數 spec 重複。
- 引用：`tests/sprint1-verify.spec.js:120`
- 引用：`tests/sprint1-5-verify.spec.js:143`
- 引用：`tests/sprint1-6-1-7-verify.spec.js:166`
- 引用：`tests/sprint4-verify.spec.js:197`

- P1：Prompt Lab schema / translations integrity 在多個 spec 重複。
- 引用：`tests/sprint1-6-1-7-verify.spec.js:312`
- 引用：`tests/sprint2-verify.spec.js:316`
- 引用：`tests/sprint4-verify.spec.js:351`

- P2：Sprint 2/3/4 對 tab 數的歷史期待不同，保留回歸性有價值，但命名要清楚。
- 引用：`tests/sprint2-verify.spec.js:512`
- 引用：`tests/sprint3-verify.spec.js:515`
- 引用：`tests/sprint4-verify.spec.js:546`

### 合併建議

- 短期保留 7 個 spec，不在 Phase C 前刪歷史 spec。
- C-0 先抽 `tests/helpers.js`；C-2 後建立 `tests/master-verify.spec.js` 覆蓋目前 Sprint 4 的 42 tests。
- 舊 sprint spec 可降級成 smoke：Sprint 1、Sprint 2、Sprint 4 各保留 1 份。

### 覆蓋盲點

- P1：沒有真實 API success path 測試，只測 no-key click-safe。
- 引用：`tests/sprint2-verify.spec.js:543`
- 引用：`tests/sprint4-verify.spec.js:579`

- P1：沒有鍵盤導覽測試。
- 引用：`tests/sprint4-verify.spec.js:209`
- 盲點：tab order、focus visible、modal escape、tooltip focus 都未覆蓋。

- P1：沒有 localStorage unavailable / corrupted JSON fallback 測試。
- 引用：`web/forma-studio-v2.html:76`
- 引用：`web/forma-studio-v2.html:100`
- 現有測試只驗證正常持久化。

- P2：沒有 color contrast / visual regression。
- 引用：`web/forma-studio-v2.html:1129`

- P2：沒有測 `SettingsPanel` clear-all 最終資料真的全清。
- 引用：`tests/sprint4-verify.spec.js:794`
- 現有測試偏 clickable / screenshot。

- P2：沒有測 Prompt Lab favorites 在 corrupted value 下能恢復。
- 引用：`web/forma-studio-v2.html:3955`

## §六、災後重建統計

### 行數統計

- `web/forma-studio.html`：3422 行；`web/forma-studio-v2.html`：5501 行。
- v2 相對 v1.1 單檔增加：2079 行。
- `tests/*.spec.js` 合計：3610 行；`docs/PLAN-sprint-*.md` 合計：2117 行。
- `CHANGELOG.md`：69 行；`README.md`：135 行。

### Git 統計

- 目前 HEAD：`e814595`。
- `origin/main`：`e814595`。
- 本機與 origin 同步：是。
- 從 baseline commit `cc9aaa0` 到 HEAD 的統計：20 files changed，11775 insertions，27 deletions。

### v1.1 凍結契約

- 契約位置：`docs/CONTRACT-v1.1-frozen.md:5`
- 實作位置：`web/forma-studio.html`
- 現況：`git diff -- web/forma-studio.html` 無輸出。
- Sprint docs 多次要求 v1.1 diff = 0。
- 引用：`docs/PLAN-sprint-0.md:21`
- 引用：`docs/PLAN-sprint-1.md:174`
- 引用：`docs/PLAN-sprint-4.md:135`

### 已重建功能

- Sprint 0-1.8：v2 baseline、Prompt Lab 116 prompts、中文 title/summary/full prompt、NextStepCard、landingNote、跨 tab 引導。
- Sprint 2-4：Audit & Enhance、Style Studio、localStorage namespace、lastTab、favorites、style state、audit history、settings panel。
- Sprint 5：README + CHANGELOG 文件收尾。

### 災前 vs 已重建 vs 待重建

- 已重建：7-tab workflow + settings button、Prompt Lab、Audit、Style Studio、localStorage、中文資料、跨 tab bridge。
- 災前線索已記錄：saved JSX 來源、災前 CHANGELOG、Style Studio / Audit 對照。
- 引用：`docs/PLAN-sprint-2.md:4`
- 引用：`docs/PLAN-sprint-3.md:6`
- 引用：`CHANGELOG.md:63`

- 待重建 / 待決策：B-lite 7 → 6 tab、Truly-Neutral subject_terms、PPT Flow Lite 7-block。
- 引用：`docs/PLAN-sprint-5.md:104`
- 結論：Phase C 功能還沒正式進 repo roadmap。

## §七、Phase C 啟動建議

### 是否可進 Phase C

可以。建議先做一個小型 C-0 cleanup，不必拖成大重構。

### C-0：Phase C Readiness Cleanup

- 估時：0.5 天。
- 內容：新增 `docs/PLAN-phase-c.md`，清 dead code，補 a11y label，memoize Prompt Lab / gallery filter。
- 驗收：Sprint 4 master spec 42 tests + v1.1 diff = 0。

### C-1：B-lite 整併，7 → 6 tab

- 估時：1.0-1.5 天。
- 策略：從 saved JSX 提取 B-lite，但先只做 navigation / information architecture。
- 建議：合併 `Smart` 與 `Claude Design` 的入口層，保留 Design 的深層 workflow。
- 目標 tabs：Design Hub / NotebookLM / Prompt Lab / Audit / Style Studio / Lab。
- 風險：目前 tests 明確期待 7 tabs + settings；需更新 master spec。
- 引用：`web/forma-studio-v2.html:5329`
- 引用：`tests/sprint4-verify.spec.js:620`

### C-2：Truly-Neutral subject_terms

- 估時：1.0 天。
- 策略：不要把「牙科 / O2Win」硬寫死在所有 prompt；建立 subject_terms mapping。
- 最小機制：
  - `subject_terms.domain`
  - `subject_terms.audience`
  - `subject_terms.brandName`
  - `subject_terms.sensitiveTerms`
  - `subject_terms.defaultExamples`
- 先套用到 SmartTab、DesignTab、Audit samples、Lab examples。
- 引用：`web/forma-studio-v2.html:1042`
- 引用：`web/forma-studio-v2.html:4488`
- 引用：`web/forma-studio-v2.html:4292`

### C-3：PPT Flow Lite 7-block

- 估時：1.0-1.5 天。
- 策略：先做 Lite，不做完整 PPTX export。
- 7-block 建議：
  - Title
  - Audience / Goal
  - Source Summary
  - Slide Outline
  - Visual Direction
  - Speaker Notes
  - Export / Next Actions
- 落點：先放 NotebookLM 或 Design Hub，不新增第 7 個 tab。
- 引用：`web/forma-studio-v2.html:2392`
- 引用：`web/forma-studio-v2.html:2401`

### Phase C 前要先處理的事

- 必做：新增 Phase C plan。
- 建議做：dead code cleanup + a11y label + memoize filters。
- 可延後：spec 大合併、單檔拆分、visual regression。

## §八、其他發現

- P2：`ApiKeyInline` 的 localStorage key opt-in 文案足夠清楚。
- 引用：`web/forma-studio-v2.html:1309`

- P2：Settings panel 隱私邊界文字清楚。
- 引用：`web/forma-studio-v2.html:5280`

- P2：`LS.clearAll()` 僅清 `forma-v2.*`，符合 namespace 契約。
- 引用：`web/forma-studio-v2.html:129`

- P2：`validateTabId` 保留 `plab → promptlab` alias，對舊 key 友善。
- 引用：`web/forma-studio-v2.html:154`

- P2：Prompt Lab attribution 保留完整 repo / license / author。
- 引用：`web/forma-studio-v2.html:3906`

- P2：Sprint PLAN 結構不完全一致。
- 引用：`docs/PLAN-sprint-3.md:3`
- 引用：`docs/PLAN-sprint-4.md:3`
- 觀察：Sprint 3 是英文編號格式，其他多數是中文 § 格式；不影響使用，但文件風格不統一。

- P2：災後重建紀錄整體足夠，但分散在 PLAN、README、CHANGELOG。
- 引用：`README.md:67`
- 引用：`CHANGELOG.md:5`
- 建議：Phase C plan 開頭加一段「Phase B done state」摘要。

- P2：目前沒有看到大面積 commented-out legacy implementation。
- 引用：`web/forma-studio-v2.html:4604`
- 結論：註解多，但多為章節化，不是死碼。

## 結論

- Critical issue 數量：0。
- Warning issue 數量：9。
- 建議 Phase C 啟動順序：C-0 cleanup → C-1 B-lite → C-2 Truly-Neutral → C-3 PPT Flow Lite。
- Phase C 可啟動，但第一步應先把 roadmap 寫進 repo，讓後續變更可驗收、可回滾、可追溯。
