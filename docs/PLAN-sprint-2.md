# Forma Studio Web v2.0 — Sprint 2 規劃書：Audit & Enhance 移植

## §一、移植清單
01. 本輪目標是從 saved JSX 移植 Sprint 2，不重新設計 Audit 邏輯。
02. saved JSX 來源：`~/forma-rebuild/snapshots/v2-saved-jsx-5518lines.txt`。
03. CHANGELOG 來源：`~/forma-rebuild/docs-recovered/CHANGELOG.md` §Sprint 2 與 §Sprint 2 修補。
04. 現有基線：`web/forma-studio-v2.html`，Sprint 1.8 完成版。
05. 凍結檔：`web/forma-studio.html`，本輪禁止修改。
06. 移植 helper：`PLAB_SLOP_RED_FLAGS`。
07. 移植 helper：`runAudit(rawText)`。
08. 移植 component：`AuditCheckRow({ check })`。
09. 移植 component：`AuditTab({ onApply, pendingText, clearPendingText })`。
10. 沿用既有 component：`EnhanceBtn`。
11. 沿用既有 helper：`enhancePromptWithOpenAI`。
12. 沿用既有 helper：`CopyBtn`。
13. 沿用既有 bridge：`landingNote`。
14. 新增 bridge：`pendingAuditText`。
15. 新增 bridge helper：`sendPromptToAudit(prompt, sourceLabel)`。
16. 新增 Audit → Design helper：`applyAuditToDesign(text, kind)`。
17. 移植 sample：`AUDIT_SAMPLES[weak]`。
18. 移植 sample：`AUDIT_SAMPLES[mid]`。
19. 移植 sample：`AUDIT_SAMPLES[strong]`。
20. 移植 score：`pass = 100`。
21. 移植 score：`warn = 50`。
22. 移植 score：`fail = 0`。
23. 移植 grade：`A >= 85`。
24. 移植 grade：`B >= 70`。
25. 移植 grade：`C >= 55`。
26. 移植 grade：`D >= 40`。
27. 移植 grade：其餘為 `F`。
28. 移植 count：`passCount`。
29. 移植 count：`warnCount`。
30. 移植 count：`failCount`。
31. 移植 count：`wordCount`。
32. 移植維度 1：任務意圖。
33. 移植維度 2：受眾與情境。
34. 移植維度 3：核心訊息。
35. 移植維度 4：構圖 / 版面 / 色彩。
36. 移植維度 5：in-image 文字。
37. 移植維度 6：size / quality / 反 negative。
38. 移植維度 7：反 AI Slop。
39. 移植維度 8：Source attribution。
40. 移植互動：弱例預載。
41. 移植互動：進頁立即跑弱例 audit。
42. 移植互動：範例卡點擊後自動跑體檢。
43. 移植互動：textarea 修改後清掉舊體檢結果。
44. 移植互動：重新體檢按鈕。
45. 移植互動：AI 增強按鈕。
46. 移植互動：AI 增強後自動再跑 audit。
47. 移植互動：套用原始 prompt 到 Claude Design。
48. 移植互動：套用 AI 增強版到 Claude Design。
49. 移植 UI：score 卡。
50. 移植 UI：grade 卡。
51. 移植 UI：通過 / 補強 / 缺失計數。
52. 移植 UI：8 維度結果 grid。
53. 移植 UI：維度列展開建議。
54. 移植 UI：AI 增強結果區塊。
55. 移植 UI：黃色 onboarding 說明卡。
56. 移植 UI：說明卡收合 / 展開。
57. 移植 UI：明確按鈕文案。
58. 移植 UI：API Key 鎖頭文案。
59. 移植修補：textarea placeholder 改為 O2Win 牙醫情境。
60. 移植修補：弱例不再空白頁。

## §二、調整清單
61. saved JSX 最終 tabs 有 `style`，目前 Sprint 1.8 baseline 沒有 Style Studio。
62. 本輪不移植 `StyleStudioTab`，避免跨入 Sprint 3 範圍。
63. saved JSX AuditTab 含後期 Audit history，CHANGELOG Sprint 2 不含 history。
64. 本輪不移植 Audit history，避免跨入 Sprint 4-F 範圍。
65. saved JSX 的 `NextStepCard` 使用 `done / next / tip` props。
66. 目前 baseline 的 `NextStepCard` 使用 `title / body / steps` props。
67. 本輪把 `NextStepCard` 擴充為雙介面相容。
68. 既有 Sprint 1.8 呼叫不需改寫。
69. Audit 分數行動卡可保留 saved JSX 文案結構。
70. saved JSX tabs 順序為 Smart / Design / NLM / Prompt Lab / Audit / Style。
71. 目前可用 tabs 為 Smart / Design / NLM / Prompt Lab / Lab。
72. 本輪最終 tabs 順序：Smart / Design / NLM / Prompt Lab / Audit / Lab。
73. Audit 插在 Prompt Lab 與 Lab 之間。
74. Lab 保留為第 6 個 tab。
75. App 預設 tab 改為 Smart，以貼近 saved JSX B-lite。
76. Prompt Lab 的內部 id 保留 `promptlab`。
77. Audit 的內部 id 新增為 `audit`。
78. Claude Design 接收 Audit prompt 時仍走 `pendingDesignPrompt`。
79. Audit 套用來源以 `_source: 'audit'` 標記。
80. Audit 套用種類以 `_kind: 'original' | 'enhanced'` 標記。
81. `DesignTab` pending notice 依 `_source` 顯示正確來源。
82. `landingNote` 繼續負責跨 tab 可見提示。
83. `pendingAuditText` 只負責把 prompt 帶入 Audit 並觸發體檢。
84. `goTab('audit', { prompt })` 會寫入 `pendingAuditText`。
85. `AuditTab` 收到 `pendingText` 後立即跑 `runAudit`。
86. `AuditTab` 消耗後呼叫 `clearPendingText`。
87. AI 增強仍使用既有 OpenAI chat completions helper。
88. 本輪不新增 package。
89. 本輪不新增 node_modules。
90. 本輪不修改 v1.1 凍結檔。

## §三、Sprint 2 修補項目
91. 加黃色說明卡：`💡 這個 tab 是做什麼的？`
92. 說明卡回答用途：檢查 prompt 是否完整。
93. 說明卡回答結果：✅ / ⚠️ / ❌。
94. 說明卡回答流程：範例或貼文 → 看分數 → AI 增強或套用。
95. 範例從 plain buttons 改為卡片。
96. 每張範例卡保留 hint 副標。
97. 預設載入弱例。
98. 預設立即顯示分數與 grade。
99. 空狀態不再出現。
100. 體檢按鈕顯示 `🩺 開始體檢` 或 `🔄 重新體檢`。
101. AI 增強按鈕無 key 時顯示 `🔒 AI 增強（需先設 API Key）`。
102. 無 key 仍可點擊並顯示明確錯誤。
103. 牙醫 placeholder 使用 O2Win Dental。
104. 牙醫 placeholder 包含 `植牙術後照護`。
105. 牙醫 placeholder 包含尺寸。
106. 牙醫 placeholder 包含 in-image text。
107. 牙醫 placeholder 包含 negative constraints。
108. 原始 prompt 套用與 AI 增強版套用文案分開。
109. AI 增強後 score 依增強版重算。
110. AI 增強錯誤不覆蓋原 prompt。

## §四、驗收標準
111. `web/forma-studio-v2.html` JSX parse OK。
112. `web/forma-studio.html` diff 必須為 0。
113. Header 顯示 6 個 tab。
114. tab 順序為 Smart / Design / NLM / Prompt Lab / Audit / Lab。
115. Audit tab 可見。
116. Audit tab 可點。
117. Audit tab 標題顯示 `體檢 & 增強`。
118. Audit tab 顯示 onboarding 說明卡。
119. Audit tab 預設弱例可見。
120. Audit tab 預設已有 score。
121. Audit tab 預設已有 grade。
122. Audit textarea 可輸入 prompt。
123. 點 `開始體檢` 後顯示 8 維度。
124. 8 維度名稱須與 saved JSX 一致。
125. grade 顯示 A/B/C/D/F。
126. AI 增強按鈕可見。
127. 無 API key 點 AI 增強會顯示錯誤。
128. 有 API key 時 AI 增強可呼叫 GPT-4o-mini。
129. AI 增強結果可複製。
130. 原始 prompt 可套用到 Claude Design。
131. AI 增強版可套用到 Claude Design。
132. Smart 產出後顯示 `送去體檢`。
133. Design Step 4 產出後顯示 `送去體檢`。
134. NotebookLM Step 5 顯示 `送去體檢`。
135. Prompt Lab card 顯示 `送去體檢`。
136. Lab anti mode 顯示 `前往 體檢 & 增強`。
137. 1.8 原本 hidden 的 Audit action 已解鎖。
138. StyleStudio 仍不出現。
139. Prompt Lab 分類 chips 仍 >= 18。
140. Prompt Lab prompt count 仍為 116。
141. `permissions: []` 保留。
142. 不在 sandbox 跑 Playwright。
143. 新 spec 檔：`tests/sprint2-verify.spec.js`。
144. spec 保留 baseline 1-24。
145. spec 第 25 項調整為 StyleStudio absent / Audit unlocked。
146. spec 新增 Test 26-31。
147. spec `totalSteps` 為 31。
148. spec 截圖輸出目錄改為 `/tmp/forma-sprint2-screenshots`。
149. v1.1 smoke 仍保留。
150. v2 smoke 仍保留。

## §五、commit message 草稿
151. `feat(v2): restore Sprint 2 audit and enhance tab`
152. Body 1：`Port saved JSX AuditTab, 8-dimension local audit, grade scoring, and AI enhance flow.`
153. Body 2：`Unlock Audit handoffs from Smart, Design, NotebookLM, Prompt Lab, and Lab.`
154. Body 3：`Add Sprint 2 plan and verification spec; keep v1.1 frozen.`

## §六、不做的事
155. 不修改 `web/forma-studio.html`。
156. 不 commit。
157. 不 push。
158. 不新增 `package.json`。
159. 不新增 `node_modules`。
160. 不寫 `~/Desktop`。
161. 不移植 Style Studio。
162. 不移植 Audit history。
163. 不引入新的資料檔。
164. 不改 Prompt Lab JSON。
165. 不改 service worker。
166. 不跑 Playwright。
167. 不重新設計 audit 維度。
168. 不編造 score / grade 規則。
169. 不改 AI 增強模型。
170. 不改 v1.1 合約。
