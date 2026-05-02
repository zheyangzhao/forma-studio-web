# Forma Studio Web v2.1 Sprint 2 Plan

## §一、目標

1. 本 sprint 聚焦 P1-6：測試 helper 化，建立 master spec。
2. 目標是壓縮 10 個歷史 spec 的 baseline 重複。
3. 最新完整驗收來源是 `tests/v21-sprint1-verify.spec.js`。
4. 該檔目前記錄 72 個驗收 step。
5. 歷史 spec 逐版繼承前一版 baseline。
6. 因此 Test 1 v1.1 frozen smoke 在多個 spec 中重複存在。
7. 重複 baseline 讓新增測試時需要複製大量 helper 與舊 step。
8. 重複 baseline 也讓未來修補 route/report/helper 時容易漏改。
9. 本次不改 app runtime。
10. 本次不改 `web/forma-studio.html`。
11. 本次不改 `web/forma-studio-v2.html`。
12. 本次只整理測試入口與測試文件。
13. 主驗收入口改為 `tests/master-verify.spec.js`。
14. 共用測試工具改為 `tests/helpers.js`。
15. 舊 spec 不刪除，保留災後追溯價值。
16. 舊 spec 定位改為 historical smoke。
17. 舊 spec 可以單獨執行。
18. 舊 spec 不承擔完整 baseline 的唯一責任。
19. 完整 baseline 由 master spec 承擔。
20. 驗收口徑是 master spec 與 v21 sprint1 spec 同樣覆蓋 72 個 step。

## §二、helpers.js 設計

21. `helpers.js` 放在 `tests/` 根目錄。
22. 使用 CommonJS，維持現有 spec 執行方式。
23. 不引入新的 package。
24. 不新增 `package.json`。
25. 不新增 `node_modules`。
26. 匯出 `BASE_URL`。
27. 匯出 `SCREENSHOT_DIR`。
28. 匯出 `REPORT_PATH`。
29. 匯出 `WEB_ROOT`。
30. 匯出 `V2_HTML_PATH`。
31. 匯出 viewport 預設值。
32. 匯出 permissions 預設值。
33. `BASE_URL` 預設為 `http://localhost:8765`。
34. `BASE_URL` 可由 `FORMA_BASE_URL` 覆寫。
35. screenshot 目錄預設使用 `/tmp/forma-master-screenshots`。
36. screenshot 目錄可由 `FORMA_SCREENSHOT_DIR` 覆寫。
37. report 固定寫到 screenshot 目錄下的 `report.json`。
38. viewport 預設為 1280 x 900。
39. permissions 預設為空陣列。
40. `expect` 保持原本 throw Error 的極簡設計。
41. `waitText` 保持原本 15 秒 visible timeout。
42. `clickText` 保持原本 text locator 行為。
43. `clickHeaderTab` 保持 header button + escaped regexp 行為。
44. `resultCount` 保持解析 `目前命中 n / n` 的行為。
45. `shot` 保持 fullPage screenshot 行為。
46. `runStep` 保持 PASS/FAIL console output。
47. `runStep` 失敗時仍截 failure screenshot。
48. `runStep` 失敗時仍將錯誤寫入 report。
49. `createBrowser` 包裝 WebKit launch。
50. `createBrowser` launch 失敗時立即寫 report。
51. `createContext` 建立 context 並套用 viewport/permissions。
52. `createContext` 註冊 local file route。
53. `createContext` 註冊 console error 收集。
54. `createContext` 註冊 page error 收集。
55. route 仍只允許 `WEB_ROOT` 內檔案。
56. route 仍根據副檔名回 content type。
57. route 預設空 path 指向 `forma-studio-v2.html`。
58. `newIsolatedPage` 建立獨立 context。
59. `newIsolatedPage` 會清 cookies。
60. `newIsolatedPage` 回傳 `{ context, page }`。
61. `writeReport` 負責 browser close。
62. `writeReport` 負責 console/page errors 匯總。
63. `writeReport` 負責寫 JSON report。
64. `writeReport` 負責設定 `process.exitCode`。
65. JSON integrity helper 也放進 helpers。
66. `verifyPromptJson` 保持 116 unique prompt id 檢查。
67. `verifyTranslationsJson` 保持 schema 3 與三組 116 key 檢查。
68. `sourcePromptById` 保持從 source JSON 取 canonical prompt。
69. `sourceV2Html` 提供 source-level regression test 使用。
70. helper 設計只抽重複環境與資料檢查，不改 assertion 口徑。

## §三、master-verify.spec.js 結構

71. `master-verify.spec.js` 是 v2.1 主驗收 spec。
72. 檔頭註解明確標記：跑此檔等於跑完整 baseline。
73. master spec 從 `v21-sprint1-verify.spec.js` 重構。
74. master spec 使用 `require('./helpers')`。
75. master spec 不再直接 require Playwright。
76. master spec 不再重複 route helper。
77. master spec 不再重複 report helper。
78. master spec 不再重複 screenshot helper。
79. master spec 不再重複 JSON integrity helper。
80. master spec 啟動時呼叫 `createBrowser()`。
81. master spec 建立 context 時呼叫 `createContext(browser)`。
82. master spec 建立 page 後開始跑 step。
83. master spec 結尾呼叫 `writeReport(browser)`。
84. master spec 保留 Test 1。
85. master spec 保留 Test 2。
86. master spec 保留 Test 3 到 Test 18 的 Prompt Lab baseline。
87. master spec 保留 Test 19 到 Test 24 的 workflow bridge baseline。
88. master spec 保留 Test 25 到 Test 37 的 Audit / Style Studio baseline。
89. master spec 保留 Test 38 到 Test 42 的 localStorage / settings baseline。
90. master spec 保留 Test 43 到 Test 50 的 Phase C baseline。
91. master spec 保留 Test 51 到 Test 58 的 C1/C2 baseline。
92. master spec 保留 Test 59 到 Test 68 的 C3/C4/C5 baseline。
93. master spec 保留 Test 69 到 Test 72 的 v2.1 pendingPayload baseline。
94. master spec 的 step name 與 v21 sprint1 保持一致。
95. master spec 的 step 數保持 72。
96. master spec 的 source-level assertions 保持存在。
97. master spec 的 screenshot 名稱保持原命名。
98. master spec 的 isolated page 用法改由 helper 提供。
99. master spec 的 report totalSteps 由 helper 預設 72。
100. master spec 行數目標控制在 700-800 行。

## §四、舊 spec 處置策略

101. 舊 spec 不刪除。
102. 舊 spec 不做大幅重構。
103. 舊 spec 不改成 master 的 import 版本。
104. 舊 spec 保留歷史語境。
105. 舊 spec 保留當時 sprint 的驗收截面。
106. 舊 spec 仍能單獨用 `node` 執行。
107. 舊 spec 不再視為完整主驗收入口。
108. `tests/sprint1-verify.spec.js` 保留 Sprint 1 追溯價值。
109. `tests/sprint1-5-verify.spec.js` 保留 Sprint 1.5 追溯價值。
110. `tests/sprint1-6-1-7-verify.spec.js` 保留 Sprint 1.6/1.7 追溯價值。
111. `tests/sprint1-8-verify.spec.js` 保留 Sprint 1.8 追溯價值。
112. `tests/sprint2-verify.spec.js` 保留 Sprint 2 追溯價值。
113. `tests/sprint3-verify.spec.js` 保留 Sprint 3 追溯價值。
114. `tests/sprint4-verify.spec.js` 保留 Sprint 4 追溯價值。
115. `tests/phase-c-verify.spec.js` 保留 Phase C 追溯價值。
116. `tests/c1-c2-verify.spec.js` 保留 C1/C2 追溯價值。
117. `tests/c3-c4-c5-verify.spec.js` 保留 C3/C4/C5 追溯價值。
118. `tests/v21-sprint1-verify.spec.js` 保留 v2.1 Sprint 1 追溯價值。
119. README 需標記 master 與 historical smoke 的分工。
120. 未來新增完整 baseline 時優先改 master spec。

## §五、執行步驟

121. 讀 `docs/FINAL-REVIEW-2026-05-02.md` 的 P1-6。
122. 讀 `tests/v21-sprint1-verify.spec.js`。
123. 讀 `tests/c3-c4-c5-verify.spec.js`。
124. 確認最新完整 spec 是 v21 sprint1 的 72 step。
125. 建立 `tests/helpers.js`。
126. 搬移 BASE_URL / screenshot / report 常數。
127. 搬移 viewport / permissions 設定。
128. 搬移 click / wait / screenshot helpers。
129. 搬移 browser / context setup。
130. 搬移 isolated page setup。
131. 搬移 report teardown。
132. 搬移 JSON integrity helpers。
133. 從 v21 sprint1 抽出 72 個 runStep block。
134. 建立 `tests/master-verify.spec.js`。
135. 在 master spec import helper。
136. 將 source read 改成 `sourceV2Html()`。
137. 保留每個 step 的 assertion。
138. 保留每個 step 的 screenshot 名稱。
139. 保留每個 step 的 visible text 檢查。
140. 保留每個 step 的 localStorage 檢查。
141. 保留每個 step 的 source-level 檢查。
142. 壓縮 master spec 中的純重複 boilerplate。
143. 不修改 `web/forma-studio.html`。
144. 不修改 `web/forma-studio-v2.html`。
145. 不執行 Playwright full run。
146. 執行 Node syntax check。
147. 檢查 HTML diff 是否為 0。
148. 檢查 git status。
149. 回報行數與等價性。
150. 不 commit。

## §六、驗收

151. `node --check tests/master-verify.spec.js` 必須通過。
152. `node --check tests/helpers.js` 必須通過。
153. master spec 必須包含 72 個 `runStep`。
154. master spec step name 必須與 v21 sprint1 對齊。
155. helper syntax 必須通過。
156. `web/forma-studio.html` diff 必須為 0。
157. `web/forma-studio-v2.html` diff 必須為 0。
158. 舊 spec 檔案必須保留。
159. 舊 spec 不需要在本 sandbox 跑 Playwright。
160. Claude 或後續人工驗收可跑完整 Playwright。

## §七、commit message 草稿

161. `test: add v2.1 master verify spec helpers`
162. Commit body 可寫：extract shared Playwright setup/report helpers.
163. Commit body 可寫：add master 72-step acceptance spec.
164. Commit body 可寫：document historical smoke spec policy.
165. 本次任務不 commit。

## §八、不做的事

166. 不修改 v1.1 frozen HTML。
167. 不修改 v2 app HTML。
168. 不重建 source split。
169. 不新增 coverage for keyboard/corrupted storage/API mock。
170. 不執行 Playwright。
171. 不刪除歷史 spec。
172. 不改 prompt library JSON。
173. 不新增 npm dependency。
174. 不改 build workflow。
175. 不推送 branch。
