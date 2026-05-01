# Forma Studio Web v2.0 — Sprint 1.8 規劃書：12 項 UX 引導

## §一、Sprint 1.8 12 項清單
本規劃書只規劃，不實作。
基線：repo HEAD `d173add`，`web/forma-studio-v2.html` 3818 行。
基線：`web/prompt-library/translations-zh.json` schema 為 3。
基線：5 個 tab：Smart / Claude Design / NotebookLM / Prompt Lab / 彩蛋 Lab。
來源：備份 `CHANGELOG.md` §Sprint 1.8、原始 Codex prompt、完成 response。
注意：災前 response 宣告 7-tab 版本已完成，含 Audit 與 StyleStudio；目前 repo 尚未有這兩個 tab。
處理：保留災前 12 項原始清單，但只落地目前 5-tab 基線能承載的 P0/P1；Audit / StyleStudio 標 `(待用戶確認)`。
災前 `CHANGELOG.md` 的 P0 標題寫「5 項」，但實際 P0 bullet 有 7 個。
本規劃以 bullet 數為準，不以標題數字為準。
完成 response 也明確說「12 項全部交付」，所以清單總數維持 12。
目前 repo 沒有 `AuditTab` 與 `StyleStudioTab`，不能把災前 7-tab response 當成現況。
目前 repo 有 `BrandPane`，但它是 `DesignTab` 內的子面板，不是獨立 tab。
目前 `PromptLabCard` 已有中文標題、中文摘要、中文全文翻譯與英文原文。
目前 `DesignTab` 已有 `pendingDesignPrompt` 與 `pendingNotice`，可作為 landing note 的起點。
目前 `SmartTab` 已有 `goTab` prop，但尚未在結果區明確呈現下一步。
目前 `NLMTab` Step 5 已有兩個 `OutBox`，但缺貼上順序引導。
目前 `LabTab` 已有 4 個 mode 與輸出 `OutBox`，但缺 mode-based 下一步。
本輪不追求災前 commit `6410190` 的逐字重建，而是按災前 UX 定義重建到現有 5-tab 基線。
若後續 Sprint 2 加回 Audit，#6 與 #8 可直接沿用本規劃的 action-card 模式。
若後續加入 StyleStudio，#7 可直接沿用 `NextStepCard` 的 amber tone。

| # | 名稱 | 影響 tab / component | 視覺呈現 | 觸發時機 | 優先級 |
|---|---|---|---|---|---|
| 1 | 共用 `NextStepCard` | 全域共用元件 | inline completion / landing card | 完成、切 tab、空狀態 | P0 |
| 2 | Claude Design Step 4 完成卡 | `DesignTab` Step 4 | emerald 完成卡 + 3 步驟 | 產出圖像 prompt 後 | P0 |
| 3 | Design 跨 tab 來源提示卡 | `App`、`DesignTab` | landing note card | Prompt Lab 套用後切到 Design | P0 |
| 4 | Prompt Lab 套用按鈕語意修正 | `PromptLabCard` | primary button label | prompt 卡片可套用時 | P0 |
| 5 | Prompt Lab 摘要 label 修正 | `PromptLabCard` | inline helper label | 折疊 / 展開閱讀時 | P1 |
| 6 | Audit 分數行動卡 | `AuditTab` | grade action card | 體檢完成後 | P2 `(待用戶確認)` |
| 7 | StyleStudio 非圖片 banner + 完成卡 | `StyleStudioTab` | amber banner + completion card | 組好 prompt 後 | P2 `(待用戶確認)` |
| 8 | Audit 原文 / AI 增強套用按鈕區分 | `AuditTab` | button group | 體檢或增強完成後 | P2 `(待用戶確認)` |
| 9 | SmartTab 依 `selSub` 顯示下一步 | `SmartTab` | completion card + actions | 自動分類並生成結果後 | P0 |
| 10 | NotebookLM Step 5 貼上順序卡 | `NLMTab` | cyan / emerald inline card | Step 5 兩段 OutBox 生成後 | P0 |
| 11 | LabTab mode-based 下一步 | `LabTab` | inline completion card | 實驗輸出後 | P1 |
| 12 | BrandPane 5 維度評審說明 | `BrandPane` in `DesignTab` | amber inline note | 進入品牌評審時 | P1 |

### Q1：12 項具體內容
1. 共用 `NextStepCard`：影響全域元件層，放在 `OutBox` 附近；視覺為 inline card；完成 / 跨 tab / 空狀態皆可用。
2. Claude Design Step 4 完成卡：影響 `DesignTab` 的 `out` 產出區；視覺為 emerald success card；`out` 非空且 `sub === 'image'` 時顯示。
3. Design 跨 tab 來源提示卡：影響 `App` state 與 `DesignTab` Step 1；視覺為 landing note；Prompt Lab 套用後自動切到 Design 時顯示。
4. Prompt Lab 套用按鈕語意修正：影響 `PromptLabCard` 第三顆按鈕；改成「套用英文 prompt 到 Claude Design」。
5. Prompt Lab 摘要 label 修正：影響折疊摘要與展開中文區；明示中文摘要是快速理解，不是要複製的 prompt。
6. Audit 分數行動卡：災前 `AuditTab` 功能；目前基線無此 tab，標 `(待用戶確認)`，延到 Sprint 2。
7. StyleStudio 非圖片 banner + 完成卡：災前 `StyleStudioTab` 功能；目前基線無此 tab，標 `(待用戶確認)`。
8. Audit 原文 / AI 增強版按鈕區分：災前 `AuditTab` 功能；目前基線無此 tab，標 `(待用戶確認)`。
9. SmartTab 下一步按鈕：影響 `SmartTab` 的 `done && out` 結果區；依 `selSub` 產生對應下一步。
10. NotebookLM Step 5 貼上順序卡：影響 `NLMTab` Step 5；兩個 OutBox 生成後提醒先貼自定義指示，再貼任務指令。
11. LabTab mode-based 下一步：影響 `LabTab` 的 `out` 下方；依 viral / ted / batch / anti 給不同下一步。
12. BrandPane 5 維度評審說明：影響 `BrandPane`；進入品牌評審時常駐說明「自評起點，不是 AI 最終品質保證」。

### Q2：實作優先級
P0 必做 6 項：#1 共用 `NextStepCard`、#2 Design 完成卡、#3 landing note、#4 Prompt Lab 套用按鈕、#9 Smart 下一步、#10 NLM 順序卡。
P1 強烈建議 4 項：#5 Prompt Lab 摘要 label、#11 Lab 下一步、#12 BrandPane 說明、Prompt Lab 失敗 / 空狀態 onboarding。
P2 加分 2 組：#6/#8 Audit 相關、#7 StyleStudio 相關；目前沒有對應 tab，不在本輪硬做。
決策摘要：12 項保留災前對照，但本輪實作 5-tab 架構可驗收的 P0+P1。

## §二、變更清單
### 既有 component 對照
`App`：目前持有 `tab`、`apiKey`、`pendingDesignPrompt`。
`App`：新增 `landingNote`，並把跨 tab 切換集中到 `goTab`。
`DesignTab`：目前接 `pendingDesignPrompt` 與 `onPendingDesignPromptConsumed`。
`DesignTab`：新增接 `landingNote`、`clearLandingNote`、`goTab`。
`PromptLabTab`：目前接 `onApplyToDesign`。
`PromptLabTab`：建議改接 `goTab` 或保留 `onApplyToDesign` 並由 App 包裝。
`PromptLabCard`：目前有 `onToggle`、`onCopy`、`onApplyToDesign`。
`PromptLabCard`：只改 label 與 helper text，不改資料 loading。
`SmartTab`：目前接 `goTab`，已有 `selSub` 與 `done/out`。
`SmartTab`：只在結果區增加下一步卡，不改分析規則。
`NLMTab`：目前是獨立 state，無跨 tab props。
`NLMTab`：若要支援 landing note，可接 `landingNote`，但 P0 可先只加 Step 5 卡。
`LabTab`：目前無 props。
`LabTab`：若要導向 NotebookLM / Smart，接 `goTab` 即可。
`BrandPane`：目前是 `DesignTab` 內子 component。
`BrandPane`：只加說明 note，不碰評審流程。

### 共用元件
新增 `NextStepCard`，建議放在 `OutBox` 後方。
Props：`tone`、`title`、`body`、`steps`、`actions`。
`tone` 支援 `emerald | amber | cyan | rose`。
`actions` 支援 `label`、`kind`、`targetTab`、`hidden`、`disabledReason`、`onClick`。
完成卡不取代 `OutBox`，只負責回答「下一步」。
`kind === 'primary'` 使用黃色主按鈕，符合目前主要 CTA 語言。
`kind === 'secondary'` 使用灰邊按鈕，符合目前工具型 secondary action。
`kind === 'disabled'` 僅用於必要時；預設 hidden 比 disabled 更好。
卡片 radius 與現有工具卡一致，不做大尺寸 marketing card。
卡片文案每段維持短句，避免壓過 prompt 主體。

### Q3：跨 tab landing note 統一機制
候選 A：每個 tab 自己處理 inline 提示；問題是行為分散。
候選 B：App 層共用 `landingNote` state；推薦採用。
候選 C：toast；不推薦，因為自動消失，不適合回看來源與目標。
新增 `const [landingNote, setLandingNote] = useState(null);`。
新增 `goTab(nextTab, note)`，需要跨 tab 時由 App 統一切換並注入 note。
`landingNote` shape：`targetTab`、`sourceTab`、`sourceLabel`、`title`、`body`、`tone`、`createdAt`、`ttlMs`。
`ttlMs` 預設 10000，但卡片可手動關閉；App 用 `useEffect` 統一清理。
`DesignTab`、`NLMTab`、`SmartTab`、`LabTab` 只接收需要的 note，不各自建立 timer。

### Q4：完成卡視覺語言
候選 A：主區塊 success glow；符合 v1.1 DNA，但不足以說明下一步。
候選 B：浮動成功 modal；不推薦，會阻斷工具流程。
候選 C：inline 完成卡 + 下一步按鈕群；推薦採用。
完成卡使用 emerald / amber / cyan border glow，延續 v1.1 4 區塊 glow 的完成感。
卡片放在結果附近，不改核心 layout，不用大面積成功狀態覆蓋原內容。

### Q5：下一步按鈕群設計
每張完成卡固定 2-4 個 actions。
Primary 是最自然的下一步；secondary 是複製、返回調整、重跑。
Smart image：Primary「進 Claude Design 精修」；secondary「複製 prompt」「重新開始」。
Smart nlm：Primary「進 NotebookLM」；secondary「複製任務指令」「重新開始」。
Smart proto：Primary「進 Claude Design 精修」；secondary「複製 UI prompt」「重新開始」。
Smart brand：Primary「進 Claude Design 品牌評審」；secondary「複製品牌資產 prompt」「重新開始」。
Design Step 4：Primary「複製圖像 prompt」；secondary「回 Step 3 調整」「到 Prompt Lab 找參考」；Audit action hidden。
NotebookLM Step 5：Primary「複製自定義指示」；secondary「複製任務指令」「回 Smart 重新分類」。
Prompt Lab card：Primary「套用英文 prompt 到 Claude Design」；secondary「複製英文 prompt」「展開 / 收合」。
Lab viral / ted / batch：Primary 指向 NotebookLM；anti 暫不導向 Audit，只保留複製與回 Smart。

### Q6：失敗回退
尚未實作的 tab 不應把使用者導向死路。
Audit / StyleStudio 相關 action 本輪 hidden，不作為 primary。
若要保留路線圖訊號，只在 body 補一句「體檢會在 Sprint 2 接上」。
Prompt Lab 載入失敗保留重試，新增「可先回 Claude Design 手動輸入需求」。
Prompt Lab 0 筆結果新增兩個選項：重設篩選、回 Claude Design。
SmartTab 沒輸入時不顯示完成卡；NotebookLM 未達 Step 5 不顯示完成卡。
決策摘要：App 層 landing note + inline `NextStepCard` 是最小且可延伸的統一機制。

## §三、執行步驟
1. 確認工作範圍：只改 `web/forma-studio-v2.html`，只新增 `tests/sprint1-8-verify.spec.js`。
2. 確認 `git diff -- web/forma-studio.html` 為空，避免碰 v1.1。
3. 在 `OutBox` 後新增 `NextStepCard`，先支援文字、steps、actions、tone。
4. 在 `App` 新增 `landingNote` state 與 `goTab(nextTab, note)`。
5. 將 tab header 手動切換接到 `goTab`；手動切 tab 時清掉不相干 note。
6. 將 `applyPromptToDesign` 改為同時設定 `pendingDesignPrompt` 與 `landingNote`。
7. `DesignTab` 接 `landingNote`，只在 `targetTab === 'design'` 時顯示。
8. 保留現有 `pendingNotice` 相關既有測試可找到的文案片段。
9. `PromptLabCard` 折疊摘要加「中文摘要（快速理解，不是要複製的 prompt）」。
10. `PromptLabCard` 展開中文全文加「中文翻譯（閱讀用）」。
11. `PromptLabCard` 英文區 label 改「英文原文（建議複製 / 套用）」。
12. `PromptLabCard` 套用按鈕改「套用英文 prompt 到 Claude Design」。
13. `PromptLabTab` error card 增補回 Design 的 fallback action。
14. `PromptLabTab` 0 result card 增補重設篩選與回 Design action。
15. `DesignTab` Step 4 `out` 出現時，在 `OutBox` 下方加完成卡。
16. Design 完成卡 body 必須明示「這裡產出的是 prompt，不是圖片」。
17. `SmartTab` 在 `done && out` 區塊加入依 `selSub` 變化的完成卡。
18. Smart Design 類 route 用 `goTab('design', note)`；NLM 類 route 用 `goTab('nlm', note)`。
19. `NLMTab` Step 5 兩個 `OutBox` 後加入貼上順序卡。
20. NLM 順序固定：先貼自定義指示，再貼任務指令，最後上傳來源素材。
21. `LabTab` 在 `OutBox text={out}` 下方加入 mode-based 完成卡。
22. `LabTab` anti 模式不顯示 Audit 導向，只顯示複製與回 Smart。
23. `BrandPane` 入口區或評審區上方加 amber note。
24. 跑 JSX parse。
25. 跑 v1.1 diff。
26. 跑既有 `tests/sprint1-6-1-7-verify.spec.js`。
27. 新增並跑 `tests/sprint1-8-verify.spec.js`。
28. 截圖輸出到 `/tmp/forma-sprint1-8-screenshots`。
決策摘要：先建共用元件與 App state，再逐 tab 掛入，避免大範圍重構。

## §四、Playwright 驗收 spec 設計
新檔命名：`tests/sprint1-8-verify.spec.js`。
沿用既有 spec 的無伺服器 route fulfill 模式。
BASE_URL 預設 `http://localhost:8765`。
SCREENSHOT_DIR 預設 `/tmp/forma-sprint1-8-screenshots`。
每個 P0 + P1 項目至少 1 個 test。
測試檔不依賴外部網路。
測試檔不需要啟動真實 dev server。
測試方式沿用既有 `context.route` 將 `web` 目錄檔案 fulfill。
所有失敗截圖寫入 screenshot dir，report 寫入 JSON。
Console error 與 page error 仍需收集。
若 clipboard 權限在 WebKit 不穩，複製測試以 button label / 狀態為主，clipboard read 作 best effort。
如果測試需要填完整 Design 流程，優先走最短路徑：文字描述、選 image category、填 desc、生成。
如果 Smart 自動分類結果與字串判斷有差異，測試輸入要選用目前 regex 明確命中的詞。
例如 image 測試使用「海報」「圖片」；NLM 測試使用「文獻」「簡報」。
Audit / StyleStudio 不存在是本輪預期，不應被測試視為缺陷。

### 必跑基線
Test 1：JSX parse `web/forma-studio-v2.html` 的 JSX script，期望無 syntax error。
Test 2：v1.1 frozen diff，`git diff -- web/forma-studio.html` 必須為空。
Test 3：既有 regression，`node tests/sprint1-6-1-7-verify.spec.js` 18 test 全通過。

### Sprint 1.8 新增驗收
Test 4：Prompt Lab 按鈕語意；進 Prompt Lab，期望可見「套用英文 prompt 到 Claude Design」。
Test 5：Prompt Lab 摘要 label；期望可見「中文摘要（快速理解，不是要複製的 prompt）」。
Test 6：Prompt Lab 展開 label；展開卡片後期望可見「英文原文（建議複製 / 套用）」。
Test 7：Prompt Lab 到 Design landing note；搜尋 chess 並套用，期望 Design textarea 含 chess board，且可見來源提示。
Test 8：Design Step 4 完成卡；生成圖像 prompt 後，期望可見「已產出圖像 prompt」與至少 3 個下一步 action。
Test 9：Smart image 下一步；輸入「做一張牙科衛教海報」生成後，期望 primary 是「進 Claude Design 精修」。
Test 10：Smart nlm 下一步；輸入「把這篇文獻整理成簡報」生成後，期望可見「進 NotebookLM」。
Test 11：NotebookLM Step 5 順序卡；完成 5 steps 後，期望可見「先貼自定義指示」與「再貼任務指令」。
Test 12：Lab viral / ted / batch 下一步；三種模式輸出後，primary action 指向 NotebookLM。
Test 13：Lab anti 不導向未存在 Audit；anti 輸出後不可見可點擊 Audit 導向 button。
Test 14：BrandPane 自評說明；Design Step 3 選品牌與評審，期望可見「自評起點，不是 AI 最終品質保證」。
Test 15：Prompt Lab 0 result onboarding；搜尋不可能命中字串，期望可見空狀態與「重設篩選」。
Test 16：不存在 tab action 不出現；掃描可見 buttons，期望沒有導向不存在 Audit / StyleStudio 的 action。

### P0/P1 對應表
P0 #1 `NextStepCard`：由 Tests 8-13 間接覆蓋，至少 4 個 tab 使用同一完成卡語言。
P0 #2 Design 完成卡：Test 8 覆蓋。
P0 #3 Design landing note：Test 7 覆蓋。
P0 #4 Prompt Lab 套用按鈕：Test 4 覆蓋。
P0 #9 Smart 下一步：Tests 9-10 覆蓋。
P0 #10 NLM Step 5 順序卡：Test 11 覆蓋。
P1 #5 Prompt Lab 摘要 label：Tests 5-6 覆蓋。
P1 #11 Lab 下一步：Tests 12-13 覆蓋。
P1 #12 BrandPane 說明：Test 14 覆蓋。
P1 Prompt Lab empty/error onboarding：Test 15 覆蓋，error path 可作人工驗收或額外 mock fetch failure。
P2 Audit / StyleStudio：Test 16 確認本輪不暴露不存在的可點擊路徑。

### Q7：完整驗收標準
JSX parse 必須通過。
`git diff -- web/forma-studio.html` 必須為 0。
既有 18-test regression 必須通過。
新增 `tests/sprint1-8-verify.spec.js` 至少 12 個新 test。
每個 P0 / P1 項目至少 1 個 test。
所有截圖寫入 `/tmp`。
不得產生或引用任何桌面路徑。
決策摘要：新 spec 測「完成後有下一步」與「未存在功能不造成死路」，不做像素級視覺比較。

## §五、commit message 草稿
建議 commit message：

```text
feat(v2): Sprint 1.8 UX guidance cards and cross-tab landing notes
```

Commit body 草稿：

```text
- add shared NextStepCard for completion and landing guidance
- add App-level landingNote flow for cross-tab handoff
- clarify Prompt Lab summary/copy/apply labels
- add Design, Smart, NotebookLM, Lab, and BrandPane next-step guidance
- keep Audit and StyleStudio actions hidden until their tabs exist
- add Sprint 1.8 Playwright regression coverage
```

驗收前不得 commit。
驗收後依專案規則 commit 並立即 push GitHub。
決策摘要：commit 聚焦 UX guidance，不混入 Sprint 2 Audit 或 StyleStudio scope。

## §六、不做的事
不修改 `web/forma-studio.html`。
不修改 v1.1 凍結版。
不新增 Audit tab。
不新增 StyleStudio tab。
不改 5-tab 架構。
不改 `translations-zh.json` schema。
不重翻 116 條 prompt。
不改 Prompt Library 資料來源 JSON。
不引入新的 npm package。
不把完成狀態做成 modal。
不使用 toast 作為唯一引導。
不把未存在的 Sprint 2 功能做成主要按鈕。
不寫任何桌面路徑。
不把災前 7-tab response 當成目前 repo 已有狀態。
不把 `(待用戶確認)` 的 Audit / StyleStudio 細節編造成現有功能。
決策摘要：Sprint 1.8 是 UX 引導修補，不是新增產品模組，也不是 Sprint 2 Audit 實作。
