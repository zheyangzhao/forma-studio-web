# Forma Studio Web v2.1 Sprint 1 規劃書

日期：2026-05-02

範圍：P1-1 統一跨 tab pending payload schema

## §一、目標與動機

1. 本 sprint 專注處理 `docs/FINAL-REVIEW-2026-05-02.md` §八 P1-1。
2. 目標是把 v2.0 現有 4 套跨 tab bridge 收斂成單一 schema。
3. 現有 bridge 包含 `landingNote`、`pendingDesignPrompt`、`pendingAuditText`、`pendingNLMState`。
4. 這 4 套 state 的生命週期相似，但命名、payload shape、消費方式不同。
5. 分裂狀態讓 App component 成為跨頁籤 glue code 的聚集點。
6. 新增任何 tab 或 payload kind 都會複製一組 state、props、consume helper。
7. 既有測試已覆蓋主要跨 tab 行為，因此本 sprint 不改 UX 結果。
8. 行為目標是「使用者看到的流程不變，內部 bridge schema 統一」。
9. v1.1 frozen contract 不在本 sprint 範圍內。
10. `web/forma-studio.html` 必須保持零 diff。
11. localStorage keys 不新增、不刪除、不改名。
12. Audit history persist 的寫入時序必須維持。
13. Prompt Lab apply 到 Design 必須維持預填與提示卡。
14. Style Studio apply 到 Design 必須維持預填與提示卡。
15. Smart 到 Design / Audit / NLM 必須維持 C-2 到 C-5 行為。
16. Design / Prompt Lab / Lab 送 Audit 必須維持 prompt 預填與 8 維度自動 audit。
17. 新 schema 只服務跨 tab 暫存，不取代各 tab 內部 state。
18. 本 sprint 不做大拆檔、不引入 build system。
19. 本 sprint 不新增 npm dependency。
20. 本 sprint 不 commit、不 push。

## §二、新 schema 設計

21. App level 新增單一 state：`pendingPayload`。
22. schema：

```js
pendingPayload = {
  targetTab: 'design' | 'audit' | 'nlm' | 'promptlab' | 'style' | 'smart',
  sourceTab: 'design' | 'audit' | 'nlm' | 'promptlab' | 'style' | 'smart',
  kind: 'design-prompt' | 'audit-text' | 'nlm-state' | 'note-only',
  payload: null | object,
  note: null | { title, body, tone, ttlMs },
}
```

23. `targetTab` 決定哪個 tab 可以消費 payload。
24. `sourceTab` 記錄來源 tab，供 banner 與 debug 使用。
25. `kind` 決定 payload shape 與 consumer。
26. `payload` 承載 tab-specific data。
27. `note` 取代舊 `landingNote` state。
28. `note` 保留現有 `sourceLabel`、`prefilled` 等 UI meta，以維持既有 banner copy。
29. `note.ttlMs` 預設 10000ms。
30. `note.createdAt` 由 dispatch 建立。
31. `design-prompt` payload shape：
32. `{ id, title, prompt, source }`
33. `id` 用於 pending notice 與識別來源。
34. `title` 用於 Design Step 1 的提示文字。
35. `prompt` 預填 Design Step 1 textarea。
36. `source` 使用 `promptlab`、`audit`、`style`、`smart` 等來源。
37. `audit-text` payload shape：
38. `{ text, source }`
39. `text` 預填 Audit textarea 並立刻 runAudit。
40. `source` 寫入 bridge history metadata。
41. `nlm-state` payload shape：
42. `{ task, domain, framework, tone, queryMode }`
43. 為維持 C-5 行為，可附加 `customDomain`、`depth`、`lang`。
44. NLM consumer 對附加欄位採 optional handling。
45. `note-only` payload shape：
46. `payload = null`
47. `note-only` 用於單純切 tab 並顯示提示卡。
48. `note-only` 也用於 payload 被 consume 後保留 banner。
49. 這個降級策略避免 banner 被 tab effect 立即清掉。
50. `clearNote()` 再負責清掉 note。

## §三、Migration 對照表

51. 舊：`landingNote` state。
52. 新：`pendingPayload.note`。
53. 舊：`setLandingNote(note)`。
54. 新：`dispatch(targetTab, 'note-only', null, note)`。
55. 舊：`clearLandingNote()` 直接設 null。
56. 新：`clearNote()` 清 pendingPayload.note；若 payload 已空則整筆清除。
57. 舊：`pendingDesignPrompt` state。
58. 新：`pendingPayload.kind === 'design-prompt'`。
59. 舊：DesignTab 直接接 `pendingDesignPrompt`。
60. 新：DesignTab 接 `pendingPayload`，自行判斷 `targetTab === 'design'`。
61. 舊：`onPendingDesignPromptConsumed()`。
62. 新：`consume('design-prompt')`。
63. 舊：`pendingAuditText` state。
64. 新：`pendingPayload.kind === 'audit-text'`。
65. 舊：AuditTab 接 `pendingText`。
66. 新：AuditTab 接 `pendingPayload`，自行抽 `payload.text`。
67. 舊：`clearPendingText()`。
68. 新：`consume('audit-text')`。
69. 舊：`pendingNLMState` state。
70. 新：`pendingPayload.kind === 'nlm-state'`。
71. 舊：NLMTab 接 `pendingNLMState`。
72. 新：NLMTab 接 `pendingPayload`，自行抽 `payload`。
73. 舊：`onPendingNLMStateConsumed()`。
74. 新：`consume('nlm-state')`。
75. 舊：`goTab(tab, note)` 兼做 tab 切換、banner、Audit prompt bridge。
76. 新：`goTab(tab, note)` 包裝 `dispatch`。
77. 舊：`note.prompt` 隱式觸發 Audit bridge。
78. 新：`goTab` 偵測 audit + prompt 時建立 `audit-text` payload。
79. 舊：Prompt Lab apply 先 set prompt，再 go tab。
80. 新：單次 dispatch 同時帶 payload 與 note。
81. 舊：Style Studio apply 先 set prompt，再 go tab。
82. 新：單次 dispatch 到 Design。
83. 舊：Smart apply to NLM 先 set state，再 go tab。
84. 新：單次 dispatch 到 NLM。
85. 舊：consumer 清自己的 state，但 banner 留在另一個 state。
86. 新：consumer 清 payload，若有 note 則降級成 `note-only`。

## §四、執行步驟

87. 先閱讀 final review P1-1 與 v2 App root。
88. 盤點所有 `landingNote`、`pendingDesignPrompt`、`pendingAuditText`、`pendingNLMState` 使用點。
89. 修改 App state，只保留 `pendingPayload`。
90. 新增 `dispatch(targetTab, kind, payload, note)`。
91. `dispatch` 需 validate target tab。
92. `dispatch` 需 normalize source tab。
93. `dispatch` 需同步更新 `last-tab` localStorage。
94. `dispatch` 需建立 note default ttl 與 createdAt。
95. 新增 `goTab(tab, note)` wrapper。
96. `goTab` 保留現有 note-only 行為。
97. `goTab` 保留 note.prompt 到 Audit 的相容路徑。
98. 新增 `consume(kind)`。
99. `consume` 只處理目前 kind 相符的 pendingPayload。
100. `consume` 若 note 存在，轉為 `note-only`。
101. `consume` 若 note 不存在，清為 null。
102. 新增 `clearNote()`。
103. `clearNote` 若 payload 尚未消費，僅清 note。
104. `clearNote` 若 payload 已空，清整筆 pendingPayload。
105. 將 DesignTab props 改成 `pendingPayload + consume`。
106. DesignTab useEffect 檢查 `targetTab === 'design'`。
107. DesignTab useEffect 檢查 `kind === 'design-prompt'`。
108. DesignTab 預填 Step 1 後呼叫 `consume('design-prompt')`。
109. 將 AuditTab props 改成 `pendingPayload + consume`。
110. AuditTab useEffect 檢查 `targetTab === 'audit'`。
111. AuditTab useEffect 檢查 `kind === 'audit-text'`。
112. AuditTab 預填、runAudit、pushHistory 後呼叫 `consume('audit-text')`。
113. 將 NLMTab props 改成 `pendingPayload + consume`。
114. NLMTab useEffect 檢查 `targetTab === 'nlm'`。
115. NLMTab useEffect 檢查 `kind === 'nlm-state'`。
116. NLMTab 預填前 4 步並跳 Step 5 後呼叫 `consume('nlm-state')`。
117. 重構 `applyPromptToDesign` 到 `dispatch('design', 'design-prompt', ...)`。
118. 重構 `applyAuditToDesign` 到 `dispatch('design', 'design-prompt', ...)`。
119. 重構 `applyStyleToDesign` 到 `dispatch('design', 'design-prompt', ...)`。
120. 重構 `applySmartToDesign` 到 `dispatch('design', 'design-prompt', ...)`。
121. 重構 `applySmartToNLM` 到 `dispatch('nlm', 'nlm-state', ...)`。
122. 重構 `sendPromptToAudit` 到 `dispatch('audit', 'audit-text', ...)`。
123. 重構 `sendStyleToAudit` 到 `dispatch('audit', 'audit-text', ...)`。
124. 保留 PromptLabTab、LabTab、Design Step 4 內既有 `goTab` call site。
125. 使用 goTab wrapper 讓舊 note.prompt bridge 繼續可用。
126. 移除舊 set state helper。
127. 保留 `landingNote` prop 名稱作為 derived value，降低 child render diff。
128. 新增 `tests/v21-sprint1-verify.spec.js`。
129. 從 `tests/c3-c4-c5-verify.spec.js` 完整複製 68 baseline。
130. 不修改 baseline 68 test 的期望。
131. 新增 Test 69 檢查 pendingPayload schema 與舊 setter 消失。
132. 新增 Test 70 檢查 dispatch 後 tab switch 與 Design prefill。
133. 新增 Test 71 檢查 consume 位置與 note-only 降級。
134. 新增 Test 72 檢查 landingNote 由 pendingPayload.note derive。
135. 最後做 JSX parse 檢查。
136. 最後做 v1.1 diff 檢查。
137. 最後回報行數變化與 git status。

## §五、驗收標準

138. `web/forma-studio.html` diff 必須為 0。
139. `web/forma-studio-v2.html` JSX parse 必須通過。
140. `tests/v21-sprint1-verify.spec.js` 必須保留原 68 baseline。
141. Test 7 Prompt Lab apply 到 Claude Design 必須 pass。
142. Test 20 Prompt Lab landingNote 必須 pass。
143. Test 36 Style Studio apply 到 Claude Design 必須 pass。
144. Test 41 Audit history persist 必須 pass。
145. Test 56 Smart 到 Claude Design 必須 pass。
146. Test 57 Smart 到 NLM 必須 pass。
147. Test 58 Smart 到 Audit 必須 pass。
148. Test 62 Smart quick audit 到 Audit 必須 pass。
149. Test 66 Smart 到 Prompt Lab 必須 pass。
150. Test 68 C5 NLM prefill 必須 pass。
151. 新增 Test 69：schema state 存在、舊 setter 不存在。
152. 新增 Test 70：dispatch 切到 Design 並預填。
153. 新增 Test 71：consume helper 被三個 consumer 使用。
154. 新增 Test 72：landingNote 由 pendingPayload.note 產生。
155. `permissions: []` 必須保留。
156. 6 個既有 localStorage key 不變。
157. Audit history key `forma-v2.audit.history` 不變。
158. last tab key `forma-v2.last-tab` 不變。
159. Prompt Lab favorites key 不變。
160. Style Studio selections key 不變。

## §六、commit message 草稿

161. `refactor(v2): unify cross-tab bridge pendingPayload schema`
162. body 第一段：Replace split landingNote/design/audit/nlm pending bridge state with a single pendingPayload schema.
163. body 第二段：Keep existing C3-C5 cross-tab behavior while adding v2.1 Sprint 1 regression coverage.
164. body 第三段：Leave v1.1 frozen file untouched.

## §七、回退路徑

165. 若 JSX parse 壞掉，先回退 `web/forma-studio-v2.html` 的 App root 與三個 consumer patch。
166. 若 Design bridge 壞掉，優先檢查 `design-prompt` payload 是否有 `prompt`。
167. 若 Audit history 壞掉，優先檢查 Audit consumer 是否在 `pushHistory` 後才 consume。
168. 若 NLM prefill 壞掉，優先檢查 `nlm-state` 是否保留 `customDomain`、`depth`、`lang`。
169. 若 banner 消失，優先檢查 `consume` 是否降級為 `note-only`。
170. 若 tab switch 錯誤，優先檢查 `dispatch` 是否用 validated target 寫 `last-tab`。
171. 若 source label 錯誤，優先檢查 `sourceLabel` 是否仍放在 note。
172. 若需要完整回退，使用 git diff 對 `web/forma-studio-v2.html` 只反套本 sprint 改動。
173. 不回退 `web/forma-studio.html`，因為它不應有任何改動。
174. 回退後保留本規劃書與 spec 可作下一次重做參考。
