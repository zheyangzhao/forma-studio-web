# Forma Studio Web v2.0 C-1 + C-2 合併實作計畫

日期：2026-05-02

對象：`web/forma-studio-v2.html`

依據：`~/forma-rebuild/docs-reconstructed/PLAN-c-wizard-detail.md` §一 1.2-1.5、§四 4.2-4.3

狀態：本文件是 C-1 + C-2 從 0 設計與實作的工作計畫。

## §一、C-1 + C-2 範圍

1. C-1 只改 Smart 主入口。
2. C-2 只改 Smart 的下一步分流與跨 tab 導向。
3. 不改 v1.1 凍結版 `web/forma-studio.html`。
4. 不把整個產品改成 wizard。
5. 不把 NotebookLM 或 Claude Design 內嵌進 Smart。
6. 不新增 Prompt Lab 縮小入口。
7. 不新增 Smart 內體檢 step。
8. 不做 C-3 / C-4 / C-5 / C-6。
9. Smart 入口從線性條件顯示改為 4 區塊同時可見。
10. 4 區塊依流程狀態套用 active / done / future 視覺。
11. active 使用 v1.1 Claude Design glow 語言。
12. done 使用 dimmed。
13. future 使用 low opacity。
14. Step 1 是需求輸入。
15. Step 2 是確認 AI 建議。
16. Step 3 是快速 / 完整分流。
17. Step 4 是輸出 prompt 或導向結果。
18. 使用者進 Smart 後要立刻看到完整 4 步。
19. 使用者要知道最後產物是 prompt。
20. 使用者要能跳過完整流程，直接複製。
21. 使用者也要能把 prompt 送到 Design / NLM / Audit。
22. Step 2 不做硬分類。
23. Step 2 保留 Truly-Neutral 判斷。
24. Step 2 顯示主題詞抽取，不回落到醫療領域。
25. Step 2 只用任務語境，不推斷使用者身份。
26. Step 3 用 4 張 action card。
27. 4 張 action card 全部同時可見。
28. 推薦路徑只高亮，不強迫。
29. 跨 tab 導向都使用 landingNote。
30. Audit 導向要帶入 prompt 並直接跑 8 維度 score。

## §二、SmartTab 4 區塊 Glow 設計

31. SmartTab 保留原本的核心狀態：`txt`、`fileInfo`、`ai`、各類 `sel*`、`out`。
32. 新增 `step` 控制目前 active block。
33. 新增 `routeResult` 記錄 Step 3 action 的結果。
34. 新增 `copyOk` 控制直接複製的短暫成功狀態。
35. Step 狀態函式：`ss(n)` 回傳 `done` / `active` / `future`。
36. CSS class 函式：`sc(n)` 回傳 `step-dimmed` / `glow-active` / `step-future`。
37. `glow-active` 沿用既有 amber glow pulse。
38. `step-dimmed` 沿用 slate dimmed。
39. `step-future` 沿用 low opacity。
40. 每個 step 都包在 `section#smart-step-N`。
41. Step 1 初始 active。
42. Step 2 / 3 / 4 初始 future。
43. 使用者填寫 textarea 後，既有 debounce analyze 會產生 `ai`。
44. `analyze` 完成後設定 `step=2`。
45. Step 1 轉為 done / dimmed。
46. Step 2 轉為 active glow。
47. Step 3 和 Step 4 仍 visible。
48. 點「確認，生成提示詞」後設定 `step=3`。
49. Step 3 轉為 active glow。
50. Step 4 仍 visible，並可先顯示 prompt 預覽。
51. Step 3 任一 action 完成後設定 `step=4`。
52. Step 4 轉為 active glow。
53. Step 1 仍包含檔案拖放區。
54. Step 1 仍包含 Smart textarea。
55. Step 1 textarea placeholder 必須含「補充說明」。
56. Step 1 仍保留 6 個快速範例 chips。
57. Step 1 提供「分析需求 →」按鈕。
58. Step 2 包住原有 AI 判斷資料。
59. Step 2 保留可調整 Chips。
60. Step 2 顯示「推薦下一步路徑」卡片。
61. Step 3 固定顯示四個分流。
62. Step 4 顯示 OutBox prompt。
63. Step 4 直接複製時顯示複製成功。
64. Step 4 跨 tab 時顯示「已導向」結果。
65. Step 4 保留「重新開始」。
66. `done` 狀態可保留以相容既有流程。
67. prompt 生成函式不重寫模板。
68. 既有 NotebookLM prompt 模板保留。
69. 既有 image prompt 模板保留。
70. 既有 info / proto / brand 模板保留。
71. 既有 PPT Flow Lite 條件保留。
72. 既有 Smart baseline 測試文字盡量保留。
73. 舊測試使用的「確認，生成提示詞」文字保留。
74. 舊測試使用的「前往 Claude Design 精修」文字保留在 action 文案中。
75. 舊測試使用的「送去體檢」文字保留在 action 文案中。

## §三、Step 3 分流 4 Actions 邏輯

76. Action 1：直接複製。
77. 顯示圖示：`📋`。
78. 標題：`直接複製`。
79. 副說明：最快，給已熟悉的使用者。
80. 行為：確保 prompt 已生成。
81. 行為：呼叫 `navigator.clipboard.writeText(prompt)`。
82. 行為：即使 clipboard 權限失敗，也顯示 Smart 內成功狀態。
83. 行為：`setStep(4)`。
84. 行為：`routeResult.kind='copy'`。
85. Step 4 顯示「複製成功」與 prompt 全文。
86. Action 2：進 Claude Design 精修。
87. 顯示圖示：`🎨`。
88. 標題：`進 Claude Design 精修`。
89. 副說明：4 區塊 glow 主流程。
90. 行為：確保 prompt 已生成。
91. 行為：設定 Step 4 導向結果。
92. 行為：透過 App callback 設定 `pendingDesignPrompt`。
93. 行為：`goTab('design', landingNote)`。
94. landingNote target：`design`。
95. landingNote source：`Smart 智慧製圖`。
96. Design Step 1 textarea 要收到 Smart prompt。
97. Action 3：進 NotebookLM 完整 5 step。
98. 顯示圖示：`📑`。
99. 標題：`進 NotebookLM 完整 5 step`。
100. 副說明：11 任務 × 20 領域 × 12 框架。
101. 行為：確保 prompt 已生成。
102. 行為：設定 Step 4 導向結果。
103. 行為：`goTab('nlm', landingNote)`。
104. landingNote target：`nlm`。
105. landingNote source：`Smart 智慧製圖`。
106. NLM tab 顯示 landingNote 提示卡。
107. C-2 不要求預填 NLM 的 5 個內部 state。
108. Action 4：送完整體檢。
109. 顯示圖示：`🩺`。
110. 標題：`送完整體檢`。
111. 副說明：8 維度 score + AI 增強。
112. 行為：確保 prompt 已生成。
113. 行為：設定 Step 4 導向結果。
114. 行為：呼叫 `onSendAudit(prompt, 'Smart 智慧製圖')`。
115. Audit tab 接收 `pendingAuditText`。
116. Audit tab 自動跑 `runAudit`。
117. Audit tab 顯示 Score / Grade。
118. Audit tab 顯示 landingNote 提示卡。
119. 推薦路徑依 `selSub` 和 `selTask` 判斷。
120. `image` / `info` / `proto` / `brand` 推薦 Design。
121. `簡報` / `文獻` / `教學` / `課程` / `文件` 推薦 NLM。
122. 其他資訊足夠時推薦直接複製。
123. 推薦只改高亮，不禁用其他 action。
124. Action cards 在沒有 `ai` 前仍可見但 disabled。
125. 有 `ai` 後四張 action 全部 enabled。

## §四、執行步驟

126. 先讀 `PLAN-c-wizard-detail.md` §一 1.2-1.5。
127. 再讀 §四 4.2-4.3。
128. 定位 `function SmartTab`。
129. 定位 `landingNote` / `goTab` / `sendPromptToAudit`。
130. 確認 v1.1 檔案不修改。
131. 保留 Smart 原有 `analyze` 邏輯。
132. 保留 Smart 原有 `generate` prompt 模板。
133. 在 SmartTab 新增 step state。
134. 在 `analyze` 成功時把 step 推到 2。
135. 在 `generate` 後把 step 推到 3。
136. 加入 `routeInfo` 推薦邏輯。
137. 加入 `StepShell` 共用區塊 wrapper。
138. 重寫 SmartTab return。
139. Step 1 放上傳、textarea、chips、分析按鈕。
140. Step 2 放 AI reasons、推薦卡、調整 chips。
141. Step 3 放四張 action card。
142. Step 4 放 result card、OutBox、PPT Flow Lite。
143. 在 App 加 `applySmartToDesign`。
144. SmartTab props 傳入 `onApplyToDesign`。
145. NLMTab 加 landingNote 顯示。
146. AuditTab 加 landingNote 顯示。
147. App 傳 landingNote 給 NLM / Audit。
148. 先跑 JSX parse。
149. 再檢查 `web/forma-studio.html` diff。
150. 再檢查 v2 行數。
151. 最後建立 C-1/C-2 驗收 spec。

## §五、Playwright 驗收 Spec 設計

152. 新檔案：`tests/c1-c2-verify.spec.js`。
153. 從 `tests/phase-c-verify.spec.js` 複製 baseline。
154. Baseline 1-50 不刪除。
155. `report.totalSteps` 改為 58。
156. Browser context 維持 `permissions: []`。
157. Smart textarea selector 使用 `textarea[placeholder*="補充說明"]`。
158. Header tab click 仍限制在 header button。
159. Test 51：Smart 初始四區塊同時可見。
160. Test 51：`#smart-step-1` 應含 `glow-active`。
161. Test 51：`#smart-step-2..4` 應含 `step-future`。
162. Test 52：填 textarea 後 Step 2 active。
163. Test 52：Step 1 應變 `step-dimmed`。
164. Test 53：Step 2 顯示推薦下一步路徑。
165. Test 53：圖像需求推薦 Claude Design。
166. Test 54：Step 3 四個 action 全部可見。
167. Test 54：四個 action 全部 enabled。
168. Test 55：直接複製後 Step 4 active。
169. Test 55：直接複製後顯示複製成功。
170. Test 55：clipboard stub 收到 prompt。
171. Test 56：Design action 切到 Design tab。
172. Test 56：Design 顯示 landingNote。
173. Test 56：Design textarea 收到 Smart prompt。
174. Test 57：NLM action 切到 NLM tab。
175. Test 57：NLM 顯示 landingNote。
176. Test 58：Audit action 切到 Audit tab。
177. Test 58：Audit 顯示 landingNote。
178. Test 58：Audit 顯示 Score。
179. Spec 不在本輪強制由 Codex 跑 Playwright。
180. Spec 供 Claude / 使用者環境跑完整驗收。

## §六、Commit Message 草稿

181. 本輪不 commit。
182. 若後續要 commit，建議 message：
183. `feat: add Smart glow flow and C1/C2 route branching`
184. Body 第一段：`Rewrite Smart as a four-block glow flow so users can see input, AI recommendation, next actions, and prompt output at once.`
185. Body 第二段：`Add direct copy, Claude Design, NotebookLM, and Audit routing with landing notes.`
186. Body 第三段：`Add C1/C2 Playwright verification spec extending the Phase C baseline.`

## §七、不做的事

187. 不做 C-3 快速體檢摘要。
188. 不在 Smart 加第 5 個體檢 step。
189. 不做 C-4 Prompt Lab 快速範例入口。
190. 不在 Step 1 接 Prompt Lab 搜尋。
191. 不做 C-5 NotebookLM 預填橋接。
192. 不直接改 NLM 內部 5 step state。
193. 不做 C-6 收藏本次設定。
194. 不新增 localStorage key。
195. 不改既有 8 個 localStorage keys。
196. 不改 6 主 tab + Settings 結構。
197. 不改 v1.1 穩定版。
198. 不新增 package.json。
199. 不新增 node_modules。
200. 不寫 Desktop 路徑。
201. 不把 Design / NLM 內嵌到 Smart。
202. 不把 Audit 變成強制流程。
203. 不把 Prompt Lab 移除或 wizard 化。
204. 不改 Prompt Lab 的資料模型。
205. 不改 Style Studio。
206. 不改 Claude Design 4 區塊主流程。
207. 不改 NotebookLM 5 step 主要互動。
208. 不改 Audit 8 維度計分模型。
209. 不改 PWA / manifest / service worker。
210. 不更動 web root 外檔案。
211. 不 commit。
212. 不 push。
