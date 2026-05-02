# Forma Studio Web v2.0 — Phase C 三 sprint 合併規劃

日期：2026-05-02
範圍：B-lite + Truly-Neutral + PPT Flow Lite 一次合併
目標檔案：`web/forma-studio-v2.html`
驗收檔案：`tests/phase-c-verify.spec.js`
重大資產：`~/forma-rebuild/snapshots/v2-saved-jsx-5518lines.txt`

## §一、Phase B Done State 摘要

1. v1.1 穩定版 `web/forma-studio.html` 繼續凍結，本次不修改。
2. v2.0 目前是單檔 React HTML，保留 PWA、Prompt Lab、Audit、Style Studio、Settings。
3. Sprint 4 已建立 `LS` helper，所有 Phase C 改動不能破壞 localStorage key。
4. 目前持久化 key 仍以 `forma-v2.*` prefix 管理。
5. API Key 預設 session-only，使用者 opt-in 才寫入 localStorage。
6. Prompt Lab 收藏使用 `plab.favorites`，不改 key。
7. Style Studio 偏好使用 `style.last-state`，不改 key。
8. Audit 歷史使用 `audit.history`，不改 key。
9. 最後 tab 使用 `last-tab`，未知 id fallback 到 Smart。
10. SettingsPanel 保留，作為 header 右側入口，不是 `tabs` 陣列成員。
11. 當前 v2 保留外部 prompt-library JSON 載入流程。
12. Phase C 不新增 package.json、不新增 node_modules。
13. Phase C 不改 service worker / manifest / prompt-library 資料。
14. Phase C 不跑 Playwright，只提供 spec 給 Claude 或本機後續跑。
15. Phase C 需要先用 saved JSX 確認 B-lite 與 Truly-Neutral 的實際狀態。

## §二、B-lite 變更清單

1. saved JSX 的 `tabs` 陣列為 Smart / Claude Design / NotebookLM / Prompt Lab / Audit / Style Studio。
2. B-lite 最終不是新增 PPT tab，而是讓 Smart 成為 tab 0。
3. 預設首頁改為 Smart，`validateTabId` fallback 也回 Smart。
4. 彩蛋 Lab 從頂層 tab 移入 Claude Design 的「進階實驗工具」抽屜。
5. Style Studio 依 saved JSX 保留頂層捷徑，同時在 Design Step 4 放入口提示。
6. Settings 保留為 header 右側入口，不計入 `tabs` 陣列。
7. 最終 header 可見按鈕為 6 個主 tab + 1 個 Settings 入口。
8. Audit placeholder 從牙醫植牙範例改成咖啡店開幕海報範例。
9. Style Studio 預設 demo 從植牙衛教改成咖啡店開幕海報。
10. 「診間白光」改為「室內白光」。
11. 「醫療柔和」改為「品牌柔和」。
12. Smart 完成卡強化：直接複製、進 Design、送 Audit 的分流語意保留。
13. Design 內的 Lab 抽屜預設收合，避免初學者第一眼負擔。
14. Lab 原功能不刪除，只改入口層級。
15. B-lite 不重寫 Prompt Lab、不動 116 條資料。
16. B-lite 不刪 Style Studio，因 saved JSX 明確保留頂層 style。
17. B-lite 不把 Settings 做成獨立 route。
18. B-lite 不修改 v1.1。

## §三、Truly-Neutral 變更清單

1. 重寫 `ruleAnalyze`：不再將 fallback domain 設為口腔醫學。
2. 重寫 GPT system prompt：AI 不得推斷使用者的領域、產業、身份或職業。
3. 新增 `subject_terms` 機制，把紫微斗數、植牙、咖啡店、履歷等保留為主題詞。
4. `nlm_domain` 改為主題詞字串，不再代表分類領域。
5. 無明確任務時使用 GUIDE 寫作框架，不再 default IMRAD。
6. 無明確受眾時使用一般大眾，不再 default 成人患者/家長。
7. 醫療詞仍可觸發 quality checks，但不建立醫療領域分類。
8. GPT schema 保留舊欄位，新增 audience_hint、format_constraints、style_hints、quality_checks。
9. SmartTab 本地規則改用主題詞抽取，最多取 4 個。
10. SmartTab 對履歷/CV 加入文件整理判斷。
11. SmartTab 圖像 fallback 改資訊海報。
12. GPT Image Thinking 只在明確醫療詞時預設啟用。
13. 教學模板在非醫療主題使用相關案例或練習，不硬寫臨床案例。
14. 資訊圖表模板在非醫療主題寫主題資訊，不硬寫複雜醫學知識。
15. 圖像模板只在醫療上下文注入 medical terminology accuracy。
16. NotebookLM guide 套用未知主題詞時使用自訂領域欄位。
17. Lab 病毒標題改成通用版，不再寫牙齒/醫師。
18. 四受眾批次改為一般大眾、專業人士、客戶/合作夥伴、學生/學員。
19. 保留醫療 DB 選項，因醫療仍是合法核心用例。
20. 中性化不是刪醫療，而是移除強制醫療 fallback。

## §四、PPT Flow Lite 變更清單

1. 新增 `PPTFlowLite` 元件。
2. PPT Flow Lite 明確說明瀏覽器版不直接生成 PPTX 檔。
3. 輸出區塊包含邊界提示、任務摘要、3 套風格方案。
4. 輸出區塊包含 AI 反問清單。
5. 輸出區塊包含素材引用清單。
6. 輸出區塊包含 Markdown 大綱。
7. 輸出區塊包含完整 deck prompt。
8. 輸出區塊包含下一步工具建議。
9. 3 套風格方案為雜誌編輯、資訊密度、視覺敘事。
10. 頁數可選 6 / 8 / 10 / 12 / 15。
11. 比例可選 16:9 / 4:3 / 1:1 / 9:16。
12. Speaker notes 可選需要或不需要。
13. 素材引用用 markdown image 與 HTML img src 做輕量抽取。
14. Smart 產生簡報任務後自動顯示 PPT Flow Lite。
15. NotebookLM Step 5 任務為簡報製作時自動顯示 PPT Flow Lite。
16. Claude Design 新增第 5 個 sub「投影片簡報」。
17. Claude Design 投影片簡報可填主題、受眾、來源素材。
18. PPT Flow Lite deck prompt 可貼 ChatGPT Canvas / Claude Artifacts / NotebookLM。
19. Markdown 大綱可貼 Marp / Slidev / Gamma。
20. 真正讀本機檔案並產 pptx 屬於未來 Claude Code Skill，不在本次實作。

## §五、執行步驟

1. 讀 saved JSX，確認 final tab 陣列與 default tab。
2. 讀 B-lite completion response，確認 Lab 降層與文案去醫療化。
3. 讀 Truly-Neutral 規格，確認 subject_terms 決策。
4. 讀 PPT Flow prompt 與 completion response，確認 7-block 輸出。
5. 替換 shared analyzer 與 GPT system prompt。
6. 替換 SmartTab 中性化分析與 prompt 模板。
7. 替換 NotebookLM guide 與模板中的硬醫療 fallback。
8. 新增 PPTFlowLite 元件。
9. Smart 簡報任務掛 PPTFlowLite。
10. NotebookLM 簡報任務掛 PPTFlowLite。
11. Claude Design 新增投影片簡報 sub。
12. Claude Design 加進階 Lab 抽屜。
13. 移除頂層 Lab tab。
14. 保留 Style Studio 頂層 tab。
15. 保留 Settings header 入口。
16. 更新 Audit placeholder。
17. 更新 Lab 病毒版與四受眾文案。
18. 確認 localStorage key 未改名。
19. 新增 phase-c spec。
20. 新增 Phase C 規劃書。
21. 讀 saved JSX，確認 final tab 陣列與 default tab。
22. 讀 B-lite completion response，確認 Lab 降層與文案去醫療化。
23. 讀 Truly-Neutral 規格，確認 subject_terms 決策。
24. 讀 PPT Flow prompt 與 completion response，確認 7-block 輸出。
25. 替換 shared analyzer 與 GPT system prompt。
26. 替換 SmartTab 中性化分析與 prompt 模板。
27. 替換 NotebookLM guide 與模板中的硬醫療 fallback。
28. 新增 PPTFlowLite 元件。
29. Smart 簡報任務掛 PPTFlowLite。
30. NotebookLM 簡報任務掛 PPTFlowLite。
31. Claude Design 新增投影片簡報 sub。
32. Claude Design 加進階 Lab 抽屜。
33. 移除頂層 Lab tab。
34. 保留 Style Studio 頂層 tab。
35. 保留 Settings header 入口。
36. 更新 Audit placeholder。
37. 更新 Lab 病毒版與四受眾文案。
38. 確認 localStorage key 未改名。
39. 新增 phase-c spec。
40. 新增 Phase C 規劃書。

## §六、Playwright 驗收 Spec 設計

1. Spec 繼承 Sprint 4 的 42 個 baseline regression。
2. Context 建立時固定 `permissions: []`。
3. Prompt Lab category chips 仍需 `>= 18`。
4. Test 26 更新為 6 主 tab + Settings。
5. Test 32 更新為 Style Studio 保留頂層、Lab 不在頂層。
6. Test 43 檢查 Phase C tab structure。
7. Test 44 檢查 default landing 是 Smart。
8. Test 45 檢查 Design 內進階 Lab 與投影片簡報 sub。
9. Test 46 檢查通用咖啡店 placeholder。
10. Test 47 檢查 subject_terms 不強制醫療分類。
11. Test 48 檢查 PPT Flow Lite 7-block。
12. Test 49 檢查 Smart 簡報條件路徑。
13. Test 50 檢查 NotebookLM 簡報條件路徑。
14. Spec 不在本次任務中實際跑 Playwright。
15. Spec 繼承 Sprint 4 的 42 個 baseline regression。
16. Context 建立時固定 `permissions: []`。
17. Prompt Lab category chips 仍需 `>= 18`。
18. Test 26 更新為 6 主 tab + Settings。
19. Test 32 更新為 Style Studio 保留頂層、Lab 不在頂層。
20. Test 43 檢查 Phase C tab structure。
21. Test 44 檢查 default landing 是 Smart。
22. Test 45 檢查 Design 內進階 Lab 與投影片簡報 sub。
23. Test 46 檢查通用咖啡店 placeholder。
24. Test 47 檢查 subject_terms 不強制醫療分類。
25. Test 48 檢查 PPT Flow Lite 7-block。
26. Test 49 檢查 Smart 簡報條件路徑。
27. Test 50 檢查 NotebookLM 簡報條件路徑。
28. Spec 不在本次任務中實際跑 Playwright。
29. Spec 繼承 Sprint 4 的 42 個 baseline regression。
30. Context 建立時固定 `permissions: []`。
31. Prompt Lab category chips 仍需 `>= 18`。
32. Test 26 更新為 6 主 tab + Settings。
33. Test 32 更新為 Style Studio 保留頂層、Lab 不在頂層。
34. Test 43 檢查 Phase C tab structure。

## §七、Commit Message 草稿

```text
feat(v2): merge phase c b-lite neutral ppt flow

- make Smart the default entry and move Lab into Design advanced tools
- neutralize Smart/NLM routing with subject_terms instead of forced domain fallback
- add PPT Flow Lite to Smart, NotebookLM, and Claude Design
- update Phase C verification spec and planning doc
```

拆 commit 草稿：

1. `refactor(v2): apply b-lite tab hierarchy`
2. `fix(v2): neutralize smart routing with subject terms`
3. `feat(v2): add ppt flow lite`
4. `test(v2): add phase c verification spec`

## §八、不做的事

1. 不 commit。
2. 不 push。
3. 不修改 `web/forma-studio.html`。
4. 不新增 package.json。
5. 不新增 node_modules。
6. 不寫 Desktop 路徑。
7. 不改 prompt-library JSON。
8. 不刪除醫療用例。
9. 不把所有醫療詞從 DB 移除。
10. 不將 Settings 變成 React route。
11. 不直接在瀏覽器產 pptx。
12. 不引入 pptxgenjs。
13. 不引入 mammoth/pdf.js。
14. 不做真正素材抓圖。
15. 不重構整個 DesignTab。
16. 不重寫 Prompt Lab。
17. 不改 LS prefix。
18. 不清除使用者 localStorage。
19. 不跑 Playwright。
20. 不將 Style Studio 完全移除，因 saved JSX 保留頂層 style。

## §九、風險與回滾

1. 最大風險是 current v2 與 saved JSX 的橋接 props 命名不同。
2. SmartTab 從 saved JSX 移植後，App 傳入多餘 prop 不會破壞 React。
3. NLMTab 從 saved JSX 移植後，部分 Sprint 4 landing note 行為不再依賴 NLM。
4. PPT Flow Lite 是 additive 元件，可單獨移除。
5. Lab 降層若不符合使用習慣，可把 tab id 加回 tabs 陣列。
6. Settings 保留在 header，因此 Sprint 4 清除流程仍可達。
7. 若 subject_terms 抽取過度，可加停用詞與權重規則。
8. 最大風險是 current v2 與 saved JSX 的橋接 props 命名不同。
9. SmartTab 從 saved JSX 移植後，App 傳入多餘 prop 不會破壞 React。
10. NLMTab 從 saved JSX 移植後，部分 Sprint 4 landing note 行為不再依賴 NLM。
11. PPT Flow Lite 是 additive 元件，可單獨移除。
12. Lab 降層若不符合使用習慣，可把 tab id 加回 tabs 陣列。
13. Settings 保留在 header，因此 Sprint 4 清除流程仍可達。
14. 若 subject_terms 抽取過度，可加停用詞與權重規則。
15. 最大風險是 current v2 與 saved JSX 的橋接 props 命名不同。
16. SmartTab 從 saved JSX 移植後，App 傳入多餘 prop 不會破壞 React。
17. NLMTab 從 saved JSX 移植後，部分 Sprint 4 landing note 行為不再依賴 NLM。
18. PPT Flow Lite 是 additive 元件，可單獨移除。
19. Lab 降層若不符合使用習慣，可把 tab id 加回 tabs 陣列。
20. Settings 保留在 header，因此 Sprint 4 清除流程仍可達。
21. 若 subject_terms 抽取過度，可加停用詞與權重規則。
22. 最大風險是 current v2 與 saved JSX 的橋接 props 命名不同。
23. SmartTab 從 saved JSX 移植後，App 傳入多餘 prop 不會破壞 React。
24. NLMTab 從 saved JSX 移植後，部分 Sprint 4 landing note 行為不再依賴 NLM。
25. PPT Flow Lite 是 additive 元件，可單獨移除。
26. Lab 降層若不符合使用習慣，可把 tab id 加回 tabs 陣列。
27. Settings 保留在 header，因此 Sprint 4 清除流程仍可達。
28. 若 subject_terms 抽取過度，可加停用詞與權重規則。

## §十、完成判定

1. `web/forma-studio-v2.html` JSX 可解析。
2. `web/forma-studio.html` git diff 為 0。
3. `tests/phase-c-verify.spec.js` 存在且 totalSteps 為 50。
4. `docs/PLAN-phase-c.md` 行數落在 300-500。
5. 最終 tab 結構已在文件與 spec 內寫清楚。
6. 三個 sprint 的核心改動都能在程式與驗收 spec 中定位。

## §十一、Phase C 驗收矩陣
1. B-lite：Smart 應為 default tab。
2. B-lite：Lab 只能從 Claude Design 進階抽屜進入。
3. B-lite：Style Studio 頂層捷徑保留。
4. B-lite：Settings 為 header 入口，不納入 `tabs` 陣列。
5. Truly-Neutral：紫微斗數應進 subject_terms。
6. Truly-Neutral：咖啡店簡報不應變口腔醫學。
7. Truly-Neutral：植牙可觸發準確性檢查但不是 forced domain fallback。
8. Truly-Neutral：一般海報 fallback 應為資訊海報。
9. PPT Flow：Smart 偵測簡報後顯示 PPT Flow Lite。
10. PPT Flow：NotebookLM 簡報製作 Step 5 顯示 PPT Flow Lite。
11. PPT Flow：Claude Design 投影片簡報 sub 可直接產生 PPT Flow Lite。
12. PPT Flow：7-block 文案都可被測試定位。
13. B-lite：Smart 應為 default tab。
14. B-lite：Lab 只能從 Claude Design 進階抽屜進入。
15. B-lite：Style Studio 頂層捷徑保留。
16. B-lite：Settings 為 header 入口，不納入 `tabs` 陣列。
17. Truly-Neutral：紫微斗數應進 subject_terms。
18. Truly-Neutral：咖啡店簡報不應變口腔醫學。
19. Truly-Neutral：植牙可觸發準確性檢查但不是 forced domain fallback。
20. Truly-Neutral：一般海報 fallback 應為資訊海報。
21. PPT Flow：Smart 偵測簡報後顯示 PPT Flow Lite。
22. PPT Flow：NotebookLM 簡報製作 Step 5 顯示 PPT Flow Lite。
23. PPT Flow：Claude Design 投影片簡報 sub 可直接產生 PPT Flow Lite。
24. PPT Flow：7-block 文案都可被測試定位。
25. B-lite：Smart 應為 default tab。
26. B-lite：Lab 只能從 Claude Design 進階抽屜進入。
27. B-lite：Style Studio 頂層捷徑保留。
28. B-lite：Settings 為 header 入口，不納入 `tabs` 陣列。
29. Truly-Neutral：紫微斗數應進 subject_terms。
30. Truly-Neutral：咖啡店簡報不應變口腔醫學。
31. Truly-Neutral：植牙可觸發準確性檢查但不是 forced domain fallback。
32. Truly-Neutral：一般海報 fallback 應為資訊海報。
33. PPT Flow：Smart 偵測簡報後顯示 PPT Flow Lite。
34. PPT Flow：NotebookLM 簡報製作 Step 5 顯示 PPT Flow Lite。
35. PPT Flow：Claude Design 投影片簡報 sub 可直接產生 PPT Flow Lite。
36. PPT Flow：7-block 文案都可被測試定位。
37. B-lite：Smart 應為 default tab。
38. B-lite：Lab 只能從 Claude Design 進階抽屜進入。
39. B-lite：Style Studio 頂層捷徑保留。
40. B-lite：Settings 為 header 入口，不納入 `tabs` 陣列。
41. Truly-Neutral：紫微斗數應進 subject_terms。
42. Truly-Neutral：咖啡店簡報不應變口腔醫學。
43. Truly-Neutral：植牙可觸發準確性檢查但不是 forced domain fallback。
44. Truly-Neutral：一般海報 fallback 應為資訊海報。
45. PPT Flow：Smart 偵測簡報後顯示 PPT Flow Lite。
46. PPT Flow：NotebookLM 簡報製作 Step 5 顯示 PPT Flow Lite。
47. PPT Flow：Claude Design 投影片簡報 sub 可直接產生 PPT Flow Lite。
48. PPT Flow：7-block 文案都可被測試定位。
49. B-lite：Smart 應為 default tab。
50. B-lite：Lab 只能從 Claude Design 進階抽屜進入。
51. B-lite：Style Studio 頂層捷徑保留。
52. B-lite：Settings 為 header 入口，不納入 `tabs` 陣列。
53. Truly-Neutral：紫微斗數應進 subject_terms。
54. Truly-Neutral：咖啡店簡報不應變口腔醫學。
55. Truly-Neutral：植牙可觸發準確性檢查但不是 forced domain fallback。
56. Truly-Neutral：一般海報 fallback 應為資訊海報。
57. PPT Flow：Smart 偵測簡報後顯示 PPT Flow Lite。
58. PPT Flow：NotebookLM 簡報製作 Step 5 顯示 PPT Flow Lite。
59. PPT Flow：Claude Design 投影片簡報 sub 可直接產生 PPT Flow Lite。
60. PPT Flow：7-block 文案都可被測試定位。
61. B-lite：Smart 應為 default tab。
62. B-lite：Lab 只能從 Claude Design 進階抽屜進入。
63. B-lite：Style Studio 頂層捷徑保留。
64. B-lite：Settings 為 header 入口，不納入 `tabs` 陣列。
65. Truly-Neutral：紫微斗數應進 subject_terms。
66. Truly-Neutral：咖啡店簡報不應變口腔醫學。
67. Truly-Neutral：植牙可觸發準確性檢查但不是 forced domain fallback。
68. Truly-Neutral：一般海報 fallback 應為資訊海報。
69. PPT Flow：Smart 偵測簡報後顯示 PPT Flow Lite。
70. PPT Flow：NotebookLM 簡報製作 Step 5 顯示 PPT Flow Lite。
71. PPT Flow：Claude Design 投影片簡報 sub 可直接產生 PPT Flow Lite。
72. PPT Flow：7-block 文案都可被測試定位。
