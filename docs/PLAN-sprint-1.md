# Forma Studio Web v2.0 — Sprint 1 規劃書（Prompt Lab tab）

## §一、Sprint 1 範圍

1. 目標：在 v2 新增第 5 個 tab「📚 提示詞庫」。
2. 災前定義：Prompt Lab tab 整合 116 條 prompt + 搜尋 + filter + 卡片瀏覽 + 跨 tab 套用。
3. 主要修改檔案：`web/forma-studio-v2.html`。
4. 新增驗收檔案：`tests/sprint1-verify.spec.js`。
5. 必須維持 `web/forma-studio.html` 零修改。
6. 不修改 `web/prompt-library/*.json`。
7. 不修改 v1.1 的 tab、文案、資料庫、元件或樣式。
8. 不新增後端、不新增 build pipeline、不新增 npm dependency。
9. 不使用網路資料，僅使用本機 `web/prompt-library/`。
10. Sprint 1 完成後必須 commit 並 push。
11. 災前 Sprint 1 完成 response 顯示第 5 tab 可看 116 條 prompt。
12. 災前驗收包含搜尋 `chess`、filter、套用到 Claude Design、複製 prompt。
13. 用戶確認文字包含 116 條 prompt、來源 filter、製圖方式 filter、17 類別 chips、卡片 grid、attribution。
14. 本次重建的最小可交付：116 條 prompt、搜尋、分類 chips、卡片、copy、apply。
15. 災前較細的來源 filter、製圖方式 filter 可列可選，不阻塞 Sprint 1。
16. `gallery-index.json` 是 Prompt Lab 的唯一入口。
17. `gallery-index.json` schema：`schema_version/source/categories/total_count/sources`。
18. category schema：`slug/category/title_zh/industries/use_cases/count/file`。
19. category JSON schema：`source/count/prompts`。
20. prompt 常見欄位：`id/no/title/size/pixel/credit/prompt`。
21. EvoLink prompt 可能另有 `industries/source.author/source.url`。
22. 抽樣未看到穩定 `preview` 欄位。
23. 卡片 preview 由 `prompt` 前段截斷生成。
24. tags 由 `category/title_zh/industries/use_cases/size/credit/source.author` 合成。
25. 缺 `pixel` 時隱藏或顯示 `pixel n/a`。
26. 缺 per-prompt source 時使用 category source。
27. 搜尋不翻譯、不做語意搜尋。
28. 搜尋結果必須與目前分類 filter 一致。
29. Q1 推薦：採候選 A。
30. tab 順序：`Claude Design / NotebookLM / 智慧製圖 / 提示詞庫 / 彩蛋`。
31. 理由：提示詞庫是跨工作流資產，不只是 Claude Design 子工具。
32. 理由：獨立 tab 可承載搜尋、filter、卡片瀏覽，不擠壓 Claude Design Step UI。
33. 理由：災前完成版本就是獨立第 5 tab。
34. 不推薦候選 B：作為 Claude Design 子工具會使 UI 過擠、跨 tab 語意變弱。
35. Q2 推薦：採候選 B 為主。
36. 首次切到 Prompt Lab tab 時才載入。
37. 實作採 B + index-first：先 fetch `./prompt-library/gallery-index.json`。
38. 讀到 index 後依 `categories[].file` 並行 fetch 18 個分類 JSON。
39. 載完 flatten 成 `promptItems`，同一 session 內存在 React state。
40. 不採候選 A：v2 首屏應保留既有 4 tab 開啟速度。
41. 不採候選 C 作唯一策略：搜尋需要全 116 條，逐分類 lazy 會讓結果不完整。
42. 效能評估：116 條文字 prompt 很小，首次切 tab 的 JSON 成本可接受。
43. 失敗策略：index 或分類 fetch 失敗時顯示錯誤摘要與重試，不白屏。
44. Q3 推薦：採候選 A。
45. 桌面 3 欄 grid，中尺寸 2 欄，手機 1 欄。
46. 不採 list：116 條掃描效率太低。
47. 不採 masonry：驗收與視覺穩定成本較高。
48. 卡片折疊顯示 title、category、source、size/pixel、preview、tags。
49. 卡片展開顯示完整 prompt、完整 attribution、操作按鈕。
50. 不硬編不存在的 image URL，不產生破圖。
51. Q4 推薦：採候選 B。
52. App 新增 `pendingDesignPrompt` state。
53. Prompt Lab 點「套用到 Claude Design」時呼叫 App handler。
54. handler 寫入 pending payload，並 `setTab('design')`。
55. `DesignTab` 接收 pending payload 並用 `useEffect` 消費。
56. 依任務要求，至少預填 Claude Design Step 1。
57. 預填後清空 pending state，避免重複套用。
58. 不採 localStorage：同頁短期橋接不需要持久化，也不應留下 prompt 內容。
59. 不採 URL hash：prompt 太長，中文與換行 encoding 風險高。
60. Q5 推薦：採候選 A。
61. 純前端 includes 搜尋，不分大小寫。
62. 搜尋欄位：`title/prompt/category/title_zh/industries/use_cases/credit/source.author`。
63. 空 query 回到目前 filter 下全部結果。
64. 不採 fuzzy match：資料量小，排名不穩會增加驗收成本。
65. 不採 tag-only：需求明確要求搜尋 prompt 標題與內文。
66. Q6 補充：沿用 Sprint 0 驗收，加 Prompt Lab 專項驗收。
67. 必跑 `@babel/parser` JSX 驗證。
68. 必跑 `git diff main -- web/forma-studio.html`，輸出必須為 0。
69. 必跑 Playwright webkit 真實打開 v1.1 與 v2。
70. 必須截圖，console error 必須為 0。
71. 新增：點 Prompt Lab tab，確認 116 條 prompt 載入。
72. 新增：搜尋 `chess` 後結果縮小且包含 chess 卡片。
73. 新增：點分類 chip 後結果數符合分類 count。
74. 新增：展開卡片可看到完整 prompt。
75. 新增：複製 prompt 後按鈕狀態改為已複製。
76. 新增：套用到 Claude Design 後 Step 1 被預填。
77. 新增：mobile viewport 下 grid 變 1 欄且無橫向溢出。
78. 新增：flatten 後 unique prompt id 數等於 116。
79. 新增：category count 加總等於 index `total_count`。
80. 新增：既有 4 tab 仍可切換並顯示主要 heading。

## §二、變更清單（v2 component / state / handler）

81. 只在 `web/forma-studio-v2.html` 實作 UI 與狀態。
82. 修改 App `tabs` 陣列。
83. 新增 `{ id: 'promptlab', label: '📚 提示詞庫' }`。
84. 插入位置在 `smart` 後、`lab` 前。
85. App 新增 `pendingDesignPrompt` state。
86. App 新增 `applyPromptToDesign(promptItem)` handler。
87. `applyPromptToDesign` 建立 payload：`id/title/prompt/categorySlug/categoryTitle/sourceRepo/sourceLicense`。
88. `applyPromptToDesign` 設定 pending state。
89. `applyPromptToDesign` 切換到 `design` tab。
90. App render 新增 `tab==='promptlab' && <PromptLabTab onApplyToDesign={applyPromptToDesign} />`。
91. `DesignTab` 改為接收 `pendingDesignPrompt`。
92. `DesignTab` 改為接收 `onPendingDesignPromptConsumed`。
93. `DesignTab` 新增 `useEffect` 消費 pending prompt。
94. pending prompt 存在時填入 Step 1 `txt`。
95. 可同步填入 Step 3 `desc`，但不可取代 Step 1 預填要求。
96. 套用後切到 Step 1 或 Step 3 必須明確。
97. 推薦停在 Step 1，讓使用者看見被預填的原始 prompt。
98. 若已有 `txt`，Sprint 1 可採覆蓋並顯示來源提示，降低分支。
99. 新增短暫提示：「已從提示詞庫套用：{title}」。
100. 預填完成後呼叫 `onPendingDesignPromptConsumed()` 清空 pending state。
101. 新增 `loadPromptLibrary` helper。
102. `loadPromptLibrary` fetch `./prompt-library/gallery-index.json`。
103. 驗證 index 有 `categories` array。
104. 依 `categories[].file` fetch 18 個 category JSON。
105. 使用 `Promise.all` 並行載入。
106. 每個 category JSON 載完後 normalize prompts。
107. normalize 欄位：`id/no/title/prompt/size/pixel/credit`。
108. normalize 欄位：`categorySlug/categoryTitle/categoryTitleZh`。
109. normalize 欄位：`industries/useCases`。
110. normalize 欄位：`sourceRepo/sourceLicense/sourceAuthor/sourceUrl`。
111. normalize 欄位：`searchText/previewText`。
112. per-prompt `source` 優先於 category `source`。
113. prompt `industries` 優先於 category `industries`。
114. `previewText` 由 prompt 前 180-240 字生成。
115. 驗證 unique id 數，若不是 116，在 UI 顯示 warning。
116. 驗證 count 加總，若不等於 index total，console warn 且不 crash。
117. 新增 `PromptLabTab` component。
118. state：`loaded/loading/error/indexMeta/categories/prompts`。
119. state：`query/activeCategory/expandedIds/copiedId`。
120. derived：`visiblePrompts/activeCategoryMeta/sourceSummary/totalCount`。
121. mount 時載入資料；成功後同一 component 生命週期不重複載入。
122. UI：header summary。
123. UI：search input。
124. UI：category chips。
125. UI：result count。
126. UI：card grid。
127. UI：loading/error/empty state。
128. header 顯示 116 prompts 與 CC BY 4.0。
129. header 顯示兩個來源 repo summary。
130. search placeholder：中英關鍵字皆可。
131. category chips 從 index categories 生成。
132. 第一個 chip 是「全部」。
133. chip 顯示 `title_zh` 優先，並顯示 count。
134. active chip 狀態要清楚。
135. result count 顯示目前命中數與總數。
136. empty state 提示調整搜尋或分類。
137. 新增 `PromptLabCard` component。
138. props：`item/expanded/onToggle/onCopy/copied/onApplyToDesign`。
139. 折疊狀態顯示 title、category、size/pixel、credit/author。
140. 折疊狀態顯示 previewText、license、主要 tags。
141. 展開狀態顯示完整 prompt。
142. 展開狀態顯示 repo、license、author、source URL。
143. 展開狀態顯示 industries/use cases。
144. 卡片有「展開/收合」按鈕。
145. 卡片有「套用到 Claude Design」按鈕。
146. 卡片有「複製 prompt」按鈕。
147. 複製成功後 `copiedId` 顯示短暫已複製狀態。
148. clipboard 使用 `navigator.clipboard.writeText`，必要時 fallback。
149. 卡片折疊 preview 應限制行數或最大高度。
150. 新增 handler：`handleQueryChange`。
151. 新增 handler：`handleCategoryChange`。
152. 新增 handler：`toggleExpanded`。
153. 新增 handler：`copyPrompt`。
154. 新增 handler：`applyPrompt`。
155. `visiblePrompts` 先套 category，再套 query。
156. category `all` 不過濾分類。
157. category 非 `all` 用 `categorySlug` 精準比對。
158. query 只對 `searchText` 做 includes。
159. 清空 query 時保留 active category。
160. 切 category 時不清空 query。
161. 可新增「清除搜尋」與「重設篩選」按鈕。

## §三、執行步驟（給 Claude）

162. 執行 `git status --short`。
163. 若有非本 sprint 變更，先停下回報，不覆蓋。
164. 執行 `git diff -- web/forma-studio.html`，確認 v1.1 未改。
165. 讀 `web/prompt-library/gallery-index.json`。
166. 抽樣讀 `ui-ux-mockups.json`、`evolink-ui.json`、`photography.json`。
167. 確認 schema 與本規劃一致。
168. 開啟 `web/forma-studio-v2.html`。
169. 找到 App 的 `tabs`。
170. 在 `smart` 與 `lab` 之間新增 Prompt Lab tab。
171. 在 App 加 `pendingDesignPrompt` state。
172. 在 App 加跨 tab apply handler。
173. 在 App render 加 `PromptLabTab`。
174. 修改 `DesignTab` props。
175. 加 `useEffect` 消費 pending prompt。
176. 實作 `loadPromptLibrary`。
177. 確保 fetch path 使用 `./prompt-library/...`。
178. 實作 normalize function。
179. 實作 prompt count 與 source summary。
180. 實作 `PromptLabTab` loading/error/empty states。
181. 實作 search input。
182. 實作 category chips。
183. 實作 responsive card grid。
184. 實作 `PromptLabCard` 折疊與展開。
185. 實作 copy prompt。
186. 實作 apply to Claude Design。
187. 實作 attribution display。
188. 新增 `tests/sprint1-verify.spec.js`。
189. spec 以災前 Playwright 驗收精神改造，不照搬不適用路徑。
190. spec 目標頁：`http://localhost:8765/forma-studio-v2.html`。
191. spec 也打開 `http://localhost:8765/forma-studio.html` 檢查 v1.1。
192. 啟動本機 server：`python3 -m http.server 8765 --directory web`。
193. 若 8765 被占用，換 port 並同步調整 spec base URL。
194. 跑 JSX parser 驗證。
195. 建議命令：用 `@babel/parser` 解析 `script type="text/babel"` 內容。
196. 跑 v1.1 diff 驗證：`git diff main -- web/forma-studio.html`。
197. 跑 Playwright webkit：`npx playwright test tests/sprint1-verify.spec.js --project=webkit`。
198. 若無 Playwright config，改用可用的 webkit CLI 形式。
199. 檢查截圖與 JSON report。
200. 確認 console errors 為 0。
201. 確認 Prompt Lab 116 條載入。
202. 確認搜尋、filter、copy、apply 都 pass。
203. 再跑 `git diff -- web/forma-studio.html`，必須為空。
204. 執行 `git status --short`。
205. 預期只看到 `web/forma-studio-v2.html` 與 `tests/sprint1-verify.spec.js`。
206. 不 commit 截圖，除非專案已忽略或明確要求。
207. commit。
208. push。

## §四、Playwright 驗收 spec 設計

209. spec 檔案：`tests/sprint1-verify.spec.js`。
210. 使用 Playwright test runner。
211. browser：webkit。
212. desktop viewport：1280 x 900。
213. mobile viewport：390 x 844。
214. permissions：clipboard read/write。
215. 監聽 `console` error。
216. 監聽 `pageerror`。
217. 每個 major step 截圖。
218. 寫出 JSON report。
219. report 包含 totalSteps、passed、failed、consoleErrors、screenshots。
220. Test 1：v1.1 frozen smoke。
221. goto `forma-studio.html`。
222. expect title 包含 Forma Studio。
223. expect Claude Design、NotebookLM、智慧製圖、彩蛋可見。
224. expect v1.1 不需要有提示詞庫。
225. 截圖 `sprint1-v1-smoke.png`。
226. Test 2：v2 existing tabs smoke。
227. goto `forma-studio-v2.html`。
228. expect header 包含 `v2.0`。
229. expect 五個 tabs 可見。
230. 依序點既有 4 tab，確認主要 heading 可見。
231. 截圖 `sprint1-v2-tabs.png`。
232. Test 3：Prompt Lab load all。
233. 點 `📚 提示詞庫` tab。
234. 等待 loading 消失。
235. expect header 或 count 顯示 `116`。
236. expect 顯示 `wuyoscar/gpt_image_2_skill`。
237. expect 顯示 `EvoLinkAI/awesome-gpt-image-2-prompts`。
238. expect 顯示 `CC BY 4.0`。
239. expect category chips 至少 18 個，加上「全部」。
240. expect result count 為 116。
241. 截圖 `sprint1-promptlab-all.png`。
242. Test 4：search。
243. search input 填入 `chess`。
244. expect result count 小於 116。
245. expect 可見 `Chess board mid-tournament game`。
246. 截圖 `sprint1-promptlab-search-chess.png`。
247. 清空 search，expect result count 回到 116。
248. Test 5：category chip。
249. 點 `商業攝影` 或 `Photography`。
250. expect result count 等於 4。
251. expect 可見 `RAW iPhone` 或 `Chess board`。
252. 截圖 `sprint1-promptlab-filter-photography.png`。
253. 點 `全部`，expect result count 回到 116。
254. Test 6：expand and copy。
255. 找第一張卡並點 `展開`。
256. expect 完整 prompt 區塊可見。
257. expect prompt text 長度大於 80。
258. 點 `複製 prompt`。
259. expect 按鈕顯示 `已複製`。
260. 若 clipboard read 可用，expect clipboard text 包含 prompt 前段。
261. 截圖 `sprint1-promptlab-copy.png`。
262. Test 7：apply to Claude Design。
263. 在 Prompt Lab 選 `Chess board mid-tournament game`。
264. 點 `套用到 Claude Design`。
265. expect active tab 是 Claude Design。
266. expect Step 1 textarea 可見。
267. expect textarea value 長度大於 80。
268. expect textarea value 包含 `chess board`。
269. expect 可見來源提示或已套用提示。
270. 截圖 `sprint1-after-apply-design.png`。
271. Test 8：mobile layout。
272. 設 viewport 390 x 844。
273. goto v2 並點 Prompt Lab。
274. expect search input 可見。
275. expect 第一張卡寬度不超出 viewport。
276. expect category chips 不遮住卡片。
277. 截圖 `sprint1-promptlab-mobile.png`。
278. 最後 expect step failures 為空。
279. 最後 expect console errors 為空。

## §五、commit message 草稿

280. 建議 commit message：
281. `feat: add prompt lab tab to v2`
282. body 第一段：`Add a v2-only Prompt Lab tab that lazy-loads the 116 prompt library from gallery-index.json and category JSON files.`
283. body 第二段：`Includes search, category filters, expandable prompt cards, copy action, and apply-to-Claude-Design bridge.`
284. body 第三段：`Adds Playwright Sprint 1 verification and keeps web/forma-studio.html unchanged.`

## §六、不做的事

285. 不修改 `web/forma-studio.html`。
286. 不修改 v1.1 行為。
287. 不修改 prompt-library JSON。
288. 不新增 prompt。
289. 不翻譯 prompt。
290. 不新增中文摘要。
291. 不做收藏功能。
292. 不做 history/save。
293. 不做 localStorage prompt cache。
294. 不做 URL hash deep link。
295. 不做 fuzzy search。
296. 不做 tag-only 搜尋替代。
297. 不做 masonry。
298. 不做外部圖片縮圖。
299. 不做網路 fetch 到 GitHub。
300. 不做 API 呼叫。
301. 不做後端。
302. 不做 npm dependency 擴充。
303. 不改 v2 既有 4 tab 的 layout。
304. 不重構整支 HTML。
305. 不搬到 Vite/Next/React build。
306. 不清理目前已有 inline gallery helper，除非 Claude 確認它阻擋 Sprint 1。
307. 不把 Prompt Lab 做成 Claude Design 子工具。
308. 不在本 sprint 做 Sprint 1.5 中文化。
309. 不在本 sprint 做 Sprint 1.6 中文摘要。
310. 不在本 sprint 做 Sprint 1.7 全文翻譯。
311. 不在本 sprint 做 Sprint 1.8 UX 引導修補。
312. 不寫任何桌面路徑。
313. 不提交測試截圖，除非專案規範明確要求。
314. 不 push 前跳過 Playwright。
315. 不 push 前跳過 v1.1 diff 檢查。

## 最終決策摘要

316. Q1：採候選 A，Prompt Lab 是正式第 5 tab，放在智慧製圖與彩蛋之間。
317. Q2：採候選 B，首次切入 Prompt Lab 才載入；實作時先讀 index，再並行載 18 個分類 JSON。
318. Q3：採候選 A，桌面 3 欄、手機 1 欄，卡片折疊預覽、展開全文。
319. Q4：採候選 B，App 層 React state 橋接到 DesignTab，不用 localStorage 與 URL hash。
320. Q5：採候選 A，純前端 includes 搜尋，不分大小寫，涵蓋 title 與 prompt 內文。
321. Q6：沿用 Sprint 0 驗收，加上 Prompt Lab 116 條、搜尋、分類、展開、複製、套用與 mobile 截圖。
