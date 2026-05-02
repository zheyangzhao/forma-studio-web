# Forma Studio Web v2.2 Plan

1. 日期：2026-05-03（Asia/Taipei）。
2. 基準版本：v2.1。
3. 基準 commit：8d1e24f。
4. 基準 tag：v2.1。
5. 目標：以低風險、高 ROI 的順序補齊 v2.1 留下的品質缺口。
6. 限制：不修改 `web/forma-studio.html`。
7. 限制：不新增 `package.json`。
8. 限制：不新增 `node_modules`。
9. 限制：不寫 `~/Desktop`。
10. 限制：master 72 + coverage-extra 6 必須維持可通過。

## §一、Health Check 結果

11. 檢查對象：`docs/FINAL-REVIEW-2026-05-02.md`。
12. 檢查對象：`web/forma-studio-v2.html`。
13. 檢查對象：`tests/master-verify.spec.js`。
14. 檢查對象：`tests/helpers.js`。
15. 檢查對象：`tests/coverage-extra.spec.js`。
16. 檢查對象：`docs/PLAN-v2.1-sprint1.md`。
17. 檢查對象：`docs/PLAN-v2.1-sprint2.md`。
18. 檢查對象：`docs/PLAN-v2.1-sprint3.md`。
19. repo 狀態：讀取時 HEAD 在 `8d1e24f`。
20. repo 狀態：`v2.1` tag 指向 HEAD。
21. v2 主檔行數：6138 行。
22. master spec 行數：790 行。
23. helpers 行數：244 行。
24. coverage-extra 行數：實際 215 行。
25. 任務敘述的 coverage-extra 247 行與 repo 現況不一致。
26. 此差異不是 runtime issue。
27. v1 凍結檔未在本次 health check 中修改。
28. 本地測試環境缺 `playwright` module。
29. 因此本機無法直接重跑 72 + 6。
30. 阻塞訊息：`Cannot find module 'playwright'`。
31. 此阻塞屬本機依賴問題，不是產品程式碼錯誤。
32. Health 評分：8.7 / 10。
33. Critical issue：0。
34. High issue：1。
35. Medium issue：3。
36. Low issue：4。

### v2.html dead code 檢查

37. Final Review 提到 `TagSelector` 是 dead component。
38. v2.1 final 中未找到 `TagSelector` 定義或引用。
39. 判斷：已清除。
40. Final Review 提到 `ApiKeyBar` 已被 `ApiKeyInline` 取代。
41. v2.1 final 中未找到 `ApiKeyBar` 定義或引用。
42. 判斷：已清除。
43. Final Review 提到 Smart `done` state 已無 render 作用。
44. v2.1 final 中未找到 `const [done`。
45. v2.1 final 中未找到 `setDone`。
46. 判斷：已清除。
47. Final Review 提到 Design `sec2Done` 計算後未使用。
48. v2.1 final 中未找到 `sec2Done`。
49. 判斷：已清除。
50. 仍可簡化項：`StepShell` 類 step helper 重複。
51. 仍可簡化項：bridge note builder 可抽純函式。
52. 仍可簡化項：Audit enhance button 與早期 `EnhanceBtn` 的語義有重疊。
53. 但目前未發現阻擋 v2.2 的新 dead code。
54. 結論：v2.1 已處理 Final Review P1-4 的主要 dead code。

### Sprint 3 a11y 修補檢查

55. Header tabs 已顯式 `tabIndex={0}`。
56. Settings button 已顯式 `tabIndex={0}`。
57. `SettingsPanel` 有 `Escape` key listener。
58. `SettingsPanel` overlay click 可關閉。
59. Settings close button 有 `aria-label="關閉設定面板"`。
60. Smart upload remove button 有 `aria-label="移除已上傳檔案"`。
61. Design upload remove button 有 `aria-label="移除已上傳素材"`。
62. Prompt Lab search input 有 `aria-label="搜尋提示詞"`。
63. coverage-extra Coverage 1 覆蓋 keyboard tab order。
64. coverage-extra Coverage 2 覆蓋 ESC 與 outside click。
65. 缺口：部分 icon-only 小按鈕仍主要靠文字內容或 title。
66. 缺口：沒有完整 WCAG audit。
67. 缺口：沒有 focus-visible visual regression。
68. 判斷：v2.1 Sprint 3 a11y 修補足以支撐 v2.1 release。
69. 判斷：v2.2 可做小範圍補強，但不是 P0。

### 測試覆蓋檢查

70. master spec 包含 72 個 runStep。
71. Coverage-extra 包含 6 個 runStep。
72. 合計為 78 個驗收 step。
73. master 覆蓋 v1.1 frozen smoke。
74. master 覆蓋 v2 tabs smoke。
75. master 覆蓋 Prompt Lab 載入、搜尋、分類、展開、copy、apply。
76. master 覆蓋中文搜尋與翻譯 JSON integrity。
77. master 覆蓋 Design Step 4 completion。
78. master 覆蓋 Audit 8 維度、grade、no-key click-safe。
79. master 覆蓋 Style Studio chips、size、quality、跨 tab apply。
80. master 覆蓋 localStorage lastTab、favorites、style state、audit history。
81. master 覆蓋 SettingsPanel clear-all clickable。
82. master 覆蓋 Phase C Smart B-lite。
83. master 覆蓋 C1 四區塊 glow。
84. master 覆蓋 C2 route cards。
85. master 覆蓋 C3 quick audit。
86. master 覆蓋 C4 Prompt Lab chips。
87. master 覆蓋 C5 NLM prefill。
88. master 覆蓋 v2.1 pendingPayload schema。
89. coverage-extra 覆蓋 keyboard tab order。
90. coverage-extra 覆蓋 Settings ESC/outside close。
91. coverage-extra 覆蓋 invalid translations fallback。
92. coverage-extra Coverage 4 在 v2.1 是 known issue placeholder。
93. coverage-extra 覆蓋 NLM prefill 後修改 framework 再生成。
94. coverage-extra 覆蓋 long Smart/Audit prompt 不水平破版。
95. 覆蓋評估：主路徑充分。
96. 覆蓋評估：failure mode 中等。
97. 覆蓋評估：外部 API success path 不足。
98. 覆蓋評估：PWA/offline 未測。
99. 覆蓋評估：分享/export 未有 feature，因此無需測。
100. 結論：78 steps 足以保護 v2.1，但 v2.2 第一優先應補真正的 Cov 4。

### pendingPayload schema 檢查

101. App 只保留 `const [pendingPayload, setPendingPayload] = useState(null);`。
102. schema field 包含 `targetTab`。
103. schema field 包含 `sourceTab`。
104. schema field 包含 `kind`。
105. schema field 包含 `payload`。
106. schema field 包含 `note`。
107. kind 包含 `design-prompt`。
108. kind 包含 `audit-text`。
109. kind 包含 `nlm-state`。
110. kind 包含 `note-only`。
111. `DesignTab` 消費 `design-prompt`。
112. `AuditTab` 消費 `audit-text`。
113. `NLMTab` 消費 `nlm-state`。
114. `landingNote` 由 `pendingPayload?.note || null` derive。
115. 舊 `setPendingDesignPrompt` 不存在。
116. 舊 `setPendingAuditText` 不存在。
117. 舊 `setPendingNLMState` 不存在。
118. 舊 `consumePendingDesignPrompt` 不存在。
119. 舊 `clearPendingAuditText` 不存在。
120. 舊 `consumePendingNLMState` 不存在。
121. 舊 `setLandingNote` 不存在。
122. 判斷：沒有舊 4 套 pending bridge leak。
123. 風險：`noteFor` 與 `dispatch` 還在 App 內，未抽純函式。
124. 風險：full source split 前，單檔協作仍容易產生 merge 壓力。
125. 結論：v2.1 Sprint 1 的 schema 統一成功。

### PWA 現況檢查

126. `web/manifest.json` 存在。
127. `web/service-worker.js` 存在。
128. v2 HTML 會註冊 `./service-worker.js`。
129. manifest `start_url` 仍是 `./forma-studio.html`。
130. service worker cache name 仍是 `forma-studio-v1.0`。
131. service worker precache 只含 `./forma-studio.html` 與 manifest。
132. 因此 v2 目前不是實質 v2 PWA。
133. PWA 未納入 78 steps。
134. PWA 是 v2.2 的好候選。
135. 但 PWA 動到 cache，需另開 sprint，不應混進 Cov 4。

## §二、v2.2 候選排序

136. 排序原則：低風險高 ROI 優先。
137. 排序原則：能補測試缺口者優先。
138. 排序原則：使用者可感知但不破壞主流程者優先。
139. 排序原則：高風險結構工程延後。

### Rank 1：Cov 4 OpenAI mock + Audit tab click

140. 工時：0.25 到 0.5 天。
141. 風險：低。
142. 使用者價值：中。
143. 工程價值：高。
144. 直接關閉 v2.1 known issue。
145. 讓 `AI 增強` success path 不再只靠手動測試。
146. 可驗證 OpenAI request method。
147. 可驗證 Authorization header。
148. 可驗證 request body。
149. 可驗證 mock response render。
150. 可驗證 error box 不出現。
151. 推薦：v2.2 Sprint 1。

### Rank 2：PWA / offline hardening

152. 工時：0.5 到 1 天。
153. 風險：低到中。
154. 使用者價值：中到高。
155. 工程價值：中。
156. 現在 manifest 已存在但指向 v1。
157. 現在 service worker cache name 仍是 v1。
158. 現在 v2 HTML 註冊 service worker，但 v2 本體未 precache。
159. 可補 manifest smoke。
160. 可補 service worker smoke。
161. 可補離線 fallback smoke。
162. 需小心不破壞 v1 穩定版。
163. 推薦：v2.2 Sprint 2。

### Rank 3：Keyboard shortcuts + micro interactions

164. 工時：0.5 到 1 天。
165. 風險：低到中。
166. 使用者價值：中。
167. 工程價值：中。
168. 可做 `/` focus Smart input 或 Prompt Lab search。
169. 可做 `1` 到 `6` 切 top-level tab。
170. 可做 `Escape` 清 landing note 或關閉 open panel。
171. 可做 quickAuditApplied stale reset。
172. 需避免 textarea/input 內攔截使用者輸入。
173. 可補 2 到 3 個 focused tests。
174. 推薦：v2.2 Sprint 3。

### Rank 4：v2.html 簡化

175. 工時：0.5 到 1.5 天。
176. 風險：中。
177. 使用者價值：低。
178. 工程價值：中。
179. dead code 已主要清除。
180. 目前可簡化的是 helper extraction。
181. 但單檔 HTML 沒有 module boundary。
182. 過度整理容易製造 regression。
183. 建議只跟著 feature sprint 做必要 cleanup。
184. 不建議獨立成 v2.2 第一優先。

### Rank 5：i18n 機制

185. 工時：1.5 到 3 天。
186. 風險：中到高。
187. 使用者價值：未知。
188. 工程價值：中。
189. UI 現在中文 hardcode。
190. Prompt content 有中英雙語資料。
191. 若要真正 i18n，需文案 key map。
192. 需處理 tab labels、buttons、helper text、error messages。
193. 需新增語言切換 UX。
194. 需補測試矩陣。
195. 建議留 v3.0 或國際化需求明確後再做。

### Rank 6：分享 / export 功能

196. 工時：1 到 2 天。
197. 風險：中。
198. 使用者價值：中到高。
199. 工程價值：中。
200. 可能方向：export prompt markdown。
201. 可能方向：copy workflow package。
202. 可能方向：share URL with encoded state。
203. 風險：localStorage schema 與 privacy。
204. 風險：URL 長度與敏感內容。
205. 建議先做 export markdown，不做 share URL。
206. 但不是 v2.2 第一波。

### Rank 7：P1-8 source split

207. 工時：2 到 3 天。
208. 風險：高。
209. 使用者價值：低。
210. 工程價值：高。
211. 目前沒有 repo-local build system。
212. 任務限制不新增 `package.json`。
213. 沒有 bundler 時，src split 會變成自製 build pipeline。
214. 自製 pipeline 會與單檔 HTML 發布模型衝突。
215. 若導入 build，需先決定工具鏈。
216. 若不導入 build，source split 只能是文檔或手動同步。
217. 手動同步會提高錯誤率。
218. 建議留 v3.0。
219. v2.2 可先產 extraction map，不做真正切檔。

## §三、選擇 v2.2 範圍

220. 推薦 v2.2 做 3 個 sprint。
221. Sprint 1：Cov 4 OpenAI mock + Audit testability。
222. Sprint 2：PWA / offline hardening。
223. Sprint 3：keyboard shortcuts + micro interactions。
224. 不把 full source split 放入 v2.2。
225. 不把 i18n 放入 v2.2。
226. 不把 share URL 放入 v2.2。
227. 不把大型 visual redesign 放入 v2.2。
228. v2.2 的定位是品質補強版本。
229. v2.2 的核心價值是把 v2.1 的 release confidence 往上推。
230. v2.2 的風險控制方式是每 sprint 都有 focused tests。
231. 每 sprint 都不得修改 `web/forma-studio.html`。
232. 每 sprint 都要能單獨驗收。

## §四、各 sprint 詳細範圍與設計

### Sprint 1：Cov 4 OpenAI mock + Audit testability

233. 目標：把 coverage-extra Coverage 4 從 placeholder 改成真測試。
234. 目標：穩定驗證 Audit tab click。
235. 目標：穩定驗證 AI enhance success path。
236. Runtime 修改：App 初始 apiKey 從 remembered localStorage hydrate。
237. Runtime 修改：Audit textarea 加穩定 selector。
238. Runtime 修改：Audit run check button 加穩定 selector。
239. Runtime 修改：Audit AI enhance button 加穩定 selector。
240. Runtime 修改：Audit enhanced output 加穩定 selector。
241. Runtime 修改：Audit textarea 補 accessible name。
242. Runtime 修改：Audit AI enhance button 補 accessible name。
243. Spec 修改：mock `https://api.openai.com/**`。
244. Spec 修改：用 UI 設 session-only test key。
245. Spec 修改：click header Audit tab。
246. Spec 修改：填 prompt。
247. Spec 修改：run local audit。
248. Spec 修改：click AI enhance。
249. Spec 修改：驗證 enhanced prompt render。
250. Spec 修改：驗證 request count。
251. Spec 修改：驗證 method。
252. Spec 修改：驗證 Authorization。
253. Spec 修改：驗證 model。
254. Spec 修改：驗證 user message。
255. Spec 修改：驗證 system prompt。
256. Spec 修改：驗證無失敗訊息。
257. 驗收：coverage-extra 6/6。
258. 驗收：master 72/72。
259. 驗收：OpenAI 不打真 API。

### Sprint 2：PWA / offline hardening

260. 目標：讓 v2 PWA 宣告與實際入口一致。
261. 修改 manifest `start_url` 指向 v2。
262. 修改 service worker cache name 到 v2.2。
263. precache 納入 `forma-studio-v2.html`。
264. precache 保留 `forma-studio.html`。
265. precache 保留 `manifest.json`。
266. 不快取 OpenAI API。
267. 不快取使用者 prompt。
268. 不更動 localStorage schema。
269. 新增 focused test：manifest JSON integrity。
270. 新增 focused test：service worker source 不快取 OpenAI。
271. 新增 focused test：v2 URL 被列入 precache。
272. 可選：瀏覽器環境下註冊 smoke。
273. 驗收：v1 仍可直接打開。
274. 驗收：v2 仍可直接打開。
275. 驗收：service worker 不造成 test route 污染。

### Sprint 3：Keyboard shortcuts + micro interactions

276. 目標：提升日常操作效率。
277. 快捷鍵 `1` 到 `6` 切換主要 tabs。
278. 快捷鍵 `/` 聚焦當前主要輸入。
279. 快捷鍵 `Escape` 關閉 settings 或清暫時 banner。
280. 不在 input/textarea/contenteditable 內攔截字元。
281. 新增 help tooltip 或 settings row。
282. 修 quickAuditApplied stale reset。
283. 修若干 symbol-only button label。
284. 新增 focused test：快捷鍵 tab switch。
285. 新增 focused test：textarea 中不攔截數字。
286. 新增 focused test：quick audit applied reset。
287. 驗收：keyboard 不破壞既有 tab order。
288. 驗收：mobile 不出現水平 overflow。

## §五、執行順序與里程碑

289. Milestone 0：v2.1 health check 完成。
290. Milestone 1：`docs/PLAN-v2.2.md` 落地。
291. Milestone 2：`docs/PLAN-v2.2-sprint1.md` 落地。
292. Milestone 3：Sprint 1 code/spec 完成。
293. Milestone 4：Claude 跑 master 72/72。
294. Milestone 5：Claude 跑 coverage-extra 6/6。
295. Milestone 6：Sprint 1 commit。
296. Milestone 7：Sprint 2 開發。
297. Milestone 8：Sprint 2 focused tests pass。
298. Milestone 9：Sprint 3 開發。
299. Milestone 10：Sprint 3 focused tests pass。
300. Milestone 11：v2.2 final regression。
301. Milestone 12：tag v2.2。

## §六、不做的事

302. v2.2 不做 full source split。
303. v2.2 不新增 build pipeline。
304. v2.2 不新增 npm metadata。
305. v2.2 不做 i18n framework。
306. v2.2 不做 share URL。
307. v2.2 不做 account/auth。
308. v2.2 不做 backend。
309. v2.2 不做 OpenAI proxy。
310. v2.2 不改 v1 frozen file。
311. v2.2 不重設 prompt library schema。
312. v2.2 不做大型 UI redesign。
313. v2.2 不做 visual theme rewrite。
314. v2.2 不做完整 WCAG audit。
315. v2.2 不做 offline CDN asset mirroring。
316. v2.2 不做 screenshots goldens。
317. v2.2 不把 localStorage API key 加密。
318. v2.2 不把 prompt 傳到任何新第三方。
319. v3.0 候選：真正 source split。
320. v3.0 候選：build pipeline。
321. v3.0 候選：i18n。
322. v3.0 候選：share/export package。
323. v3.0 候選：完整 accessibility audit。

## §七、最終結論

324. v2.1 final 狀態健康。
325. 主要架構債不在功能正確性，而在單檔維護成本。
326. `pendingPayload` schema 統一已成功。
327. Final Review 的 dead code 主項已清除。
328. Sprint 3 a11y 修補有效，但不是完整 a11y 終局。
329. 78 steps 的主路徑覆蓋充分。
330. 最大測試缺口是 Coverage 4 的 OpenAI success mock placeholder。
331. v2.2 應先關閉這個缺口。
332. 第二優先是 PWA/offline，因 manifest 與 service worker 已存在但未對齊 v2。
333. 第三優先是 keyboard shortcuts 與微互動，提升高頻使用效率。
334. full source split 有工程價值，但在目前限制下風險過高。
335. v2.2 推薦定位：品質補強與使用效率版本。
336. 建議第一個 sprint 立即啟動 Cov 4。
337. Sprint 1 已在本計畫後同步啟動。
338. 完成標準仍是 master 72/72 + coverage-extra 6/6。
339. 若 Claude 跑測後發現 Cov 4 flake，先調 spec selector，不擴大 runtime scope。
340. 若 PWA sprint 造成 service worker route 污染，先降回 static source tests。
341. 若 keyboard sprint 造成輸入攔截，立即限制到非 editable target。
342. v2.2 不追求大改。
343. v2.2 追求可驗收、可回歸、可穩定發布。
