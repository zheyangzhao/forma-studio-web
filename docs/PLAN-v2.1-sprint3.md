# Forma Studio Web v2.1 Sprint 3 Plan

## §一、目標

1. 本 sprint 只補測試與規劃文件。
2. 對應 `docs/FINAL-REVIEW-2026-05-02.md` §八 P1-7。
3. P1-7 指出現有驗收偏 click path。
4. 本輪新增 focused tests 補 keyboard、failure mode、API mock、跨 tab 修改後生成。
5. 不修改 `web/forma-studio-v2.html`。
6. 不修改 `tests/master-verify.spec.js`。
7. 不修改 `tests/helpers.js`。
8. 不新增 package 或安裝依賴。
9. 不 commit。
10. 不 push。
11. 新增 spec 使用現有 helper 入口。
12. 新增 spec 不取代 master 72 steps。
13. master spec 仍是 baseline acceptance。
14. coverage-extra spec 是 blind-spot suite。
15. 重點是讓 a11y 與 failure mode 有可執行的保護網。
16. 測試以使用者可觀察結果為主。
17. 測試避免依賴私有 React state。
18. 外部 API 必須用 `page.route` mock。
19. translation corrupt 也用 route mock。
20. Console error 檢查只針對 `console.error`。
21. `console.warn` 可接受。
22. 失敗模式 fallback 應 render usable UI。
23. keyboard 測試應檢查真實 active element。
24. NLM prefill 測試應確認使用者修改後的 framework 進入最終 prompt。
25. 長內容測試作為額外 layout regression。

## §二、新 test 設計

### Test 1：Keyboard tab order

26. 目標：補 top-level keyboard navigation coverage。
27. 目前 master 只驗證 click path 與 tab 數量。
28. 新測試以鍵盤 `Tab` 走訪主要 header controls。
29. 先載入 `forma-studio-v2.html`。
30. 等待 Smart 頁的主 textarea 可見。
31. 從 `body` 開始連續按 `Tab`。
32. 收集 `document.activeElement` 的可讀文字。
33. 過濾舊版連結等非主流程 focusable。
34. 預期主要順序為 API Key。
35. 接著是六個主 tab。
36. 六個主 tab 依序是智慧製圖。
37. Claude Design。
38. NotebookLM。
39. 提示詞庫。
40. 體檢 & 增強。
41. 風格實驗室。
42. 最後是 Settings。
43. 接著應能進入 Smart Step 1 互動區。
44. Smart Step 1 至少要能 focus 到 textarea 或 chip。
45. 驗證重點不是 CSS class。
46. 驗證重點是 activeElement 可由鍵盤抵達。
47. 若 header 新增 focusable，測試會暴露順序變化。
48. 若 API Key dropdown 改成不可 focus，測試會暴露。

### Test 2：Settings escape and outside close

49. 目標：補 modal close failure mode。
50. master Test 42 只測 Settings 可打開與 clear-all flow。
51. 新測試打開 Settings panel。
52. 確認 `v2 設定` 與 `本地持久化狀態` 可見。
53. 按 `Escape`。
54. 預期 Settings panel 不可見。
55. 再次打開 Settings panel。
56. 點 overlay 外層區域。
57. 預期 Settings panel 不可見。
58. 驗證重點是 keyboard 與 pointer 兩種 dismiss。
59. 點外面使用 overlay bounding box 左上安全點。
60. 不點 modal 內容，避免 stopPropagation。
61. 若 ESC 尚未實作，此 test 會直接暴露。
62. 若 overlay click 被 nested element 吃掉，也會暴露。

### Test 3：Invalid translations JSON fallback

63. 目標：補 corrupted JSON fallback。
64. 使用 `page.route('**/translations-zh.json')`。
65. route 回傳 HTTP 200。
66. body 為 `INVALID JSON`。
67. content-type 仍標示 JSON。
68. 載入 v2 頁面。
69. 切到 Prompt Lab。
70. 等 loader 消失或被 fallback 替代。
71. 預期仍顯示 `共 116 條 prompt`。
72. 預期 result count 仍是 116 / 116。
73. 預期至少一張 card render。
74. 預期可看到英文 fallback title。
75. 收集本 test console error。
76. 預期 console error count 為 0。
77. console warn 不算失敗。
78. 此 test 不改實體 JSON。
79. 此 test 不碰 `web/prompt-library/translations-zh.json`。

### Test 4：Audit AI enhance mocked success

80. 目標：補 OpenAI API success path。
81. 目前 master 只測 no-key click-safe。
82. 新測試 mock `https://api.openai.com/**`。
83. mock response 回傳 `choices[0].message.content`。
84. 內容為 `增強後的 prompt 範例`。
85. 透過 init script 寫入 `forma-v2.api-key-remember`。
86. 同時寫入 `forma-v2.api-key`。
87. 重新載入時 ApiKeyInline 會把 key 塞進 session state。
88. 切到 Audit tab。
89. 填入一段 prompt。
90. 按開始體檢。
91. 按 AI 增強。
92. 等待 `增強後的 prompt 範例` 出現在 AI 增強版區塊。
93. 驗證 mock request 至少被呼叫一次。
94. 驗證 request method 是 POST。
95. 驗證 request body 包含使用者 prompt。
96. 驗證沒有真的呼叫外部 API。
97. 驗證沒有 enhance error box。

### Test 5：NLM prefill modify then generate

98. 目標：補 Smart 預填後回頭改 step 的 regression。
99. 目前 master 只測 Smart prefill 到 NLM。
100. 新測試從 Smart 輸入文獻整理需求。
101. 等待 NLM 預填按鈕出現。
102. 點 `進 NotebookLM 完整 5 step（已預填 4 步）`。
103. 等待 NLM Step 5 顯示。
104. 確認預填 framework 是 IMRAD。
105. 回 Step 3。
106. 點選 `SCQA` framework。
107. 進 Step 4。
108. 點 `產生指令` 到 Step 5。
109. 讀取 Step 5 任務指令文字。
110. 預期包含 `SCQA 決策框架`。
111. 預期不再只使用預填的 IMRAD。
112. 同時確認自定義指示仍存在。
113. 此 test 覆蓋 payload consume 後本地 state 修改。
114. 此 test 覆蓋 Step 5 prompt derived from current state。

### Test 6：Long content scroll layout

115. 目標：補長 prompt 的 failure mode。
116. 使用 5000 字長內容。
117. Smart textarea 填入長內容。
118. 確認 textarea 可輸入且頁面不產生水平 overflow。
119. 切到 Audit。
120. 填同一段長內容。
121. 按開始體檢。
122. 確認 Score / Grade 可見。
123. 確認 document scrollWidth 不超過 viewport 加容忍值。
124. 此 test 不驗證視覺完美。
125. 此 test 只抓破版與主要流程是否仍可用。

## §三、執行步驟

126. 新增 `tests/coverage-extra.spec.js`。
127. 以 CommonJS import `./helpers`。
128. 使用 `createBrowser` 啟動 WebKit。
129. 使用 `createContext` 或 `newIsolatedPage` 建立隔離頁。
130. 每個 test 儘量用 isolated page。
131. 避免 test 之間共享 localStorage。
132. 需要 mock route 的 test 在 goto 前註冊 route。
133. 需要 API key 的 test 在 goto 前註冊 init script。
134. 每個 test 用 `runStep` 包住。
135. 失敗時沿用 helper screenshot/report 行為。
136. 最後呼叫 `writeReport(browser)`。
137. spec 不新增自己的 server。
138. spec 仍依 `FORMA_BASE_URL` 預設 `http://localhost:8765`。
139. spec 不直接讀寫 web 檔案。
140. spec 不修改 helper report 結構。
141. spec syntax gate 使用 `node --check tests/coverage-extra.spec.js`。
142. 本任務不跑 Playwright full suite。
143. Playwright full run 交給 Claude 或使用者。

## §四、驗收

144. `node --check tests/coverage-extra.spec.js` 通過。
145. `docs/PLAN-v2.1-sprint3.md` 存在。
146. `tests/coverage-extra.spec.js` 存在。
147. `web/` 無修改。
148. `tests/master-verify.spec.js` 無修改。
149. `tests/helpers.js` 無修改。
150. `package.json` 無新增或修改。
151. `node_modules` 無新增。
152. `~/Desktop` 無寫入。
153. 新 spec 包含 5 個 P1-7 必補盲點。
154. 新 spec 可選長內容第 6 測試。
155. master 72/72 baseline 不被更動。
156. 若未來跑 coverage-extra 有失敗，失敗應指向產品行為而不是 spec syntax。

## §五、Commit Message 草稿

157. `test: add v2.1 sprint3 a11y and failure-mode coverage`
158. body 第一行：`Add focused coverage-extra spec for P1-7 blind spots.`
159. body 第二行：`Cover keyboard order, Settings dismiss, translation fallback, mocked AI enhance, NLM prefill edits, and long prompt layout.`
160. 本任務不實際 commit。

## §六、不做的事

161. 不修 `web/forma-studio-v2.html`。
162. 不補 aria-label。
163. 不新增 ESC handler。
164. 不改 Prompt Lab loader。
165. 不改 API enhance implementation。
166. 不改 NLM state logic。
167. 不抽 helper。
168. 不刪舊 spec。
169. 不調整 master totalSteps。
170. 不跑外部 OpenAI API。
171. 不下載任何依賴。
172. 不引入 axe-core。
173. 不做完整 WCAG audit。
174. 不做 screenshot golden。
175. 不處理 mobile swipe。
176. 不更新 README / CHANGELOG。
177. 不建立 source split。
178. 不做 performance refactor。
179. 不 commit。
180. 不 push。
