# Forma Studio Web v2.2 Sprint 1 Plan

1. Sprint 名稱：Cov 4 OpenAI mock + Audit testability。
2. 日期：2026-05-03（Asia/Taipei）。
3. 基準：v2.1 commit `8d1e24f`。
4. 目標檔案：`web/forma-studio-v2.html`。
5. 目標檔案：`tests/coverage-extra.spec.js`。
6. 禁止修改：`web/forma-studio.html`。
7. 不新增 `package.json`。
8. 不新增 `node_modules`。
9. 不呼叫真 OpenAI API。
10. 不寫 `~/Desktop`。

## 背景

11. v2.1 已有 72 個 master runStep。
12. v2.1 已有 6 個 coverage-extra runStep。
13. coverage-extra Coverage 4 仍是 placeholder。
14. placeholder 原因是跨 origin OpenAI fetch、page.route、addInitScript 互動不穩。
15. v2.2 Sprint 1 直接關閉這個缺口。
16. 這個 sprint 不做 PWA。
17. 這個 sprint 不做 source split。
18. 這個 sprint 不做 UI redesign。
19. 這個 sprint 不改 v1 frozen file。
20. 這個 sprint 只補測試可觀測性與真 mock。

## 範圍

21. Audit textarea 加 `data-testid`。
22. Audit textarea 加 `aria-label`。
23. Audit run check button 加 `data-testid`。
24. Audit AI enhance button 加 `data-testid`。
25. Audit AI enhance button 加 `aria-label`。
26. Audit enhanced output 加 `data-testid`。
27. App 初始 apiKey 從 remembered localStorage hydrate。
28. Coverage 4 改成真測試。
29. Coverage 4 用 UI 設定 session-only API key。
30. Coverage 4 點 header Audit tab。
31. Coverage 4 填 prompt。
32. Coverage 4 執行本地 audit。
33. Coverage 4 mock OpenAI response。
34. Coverage 4 點 AI enhance。
35. Coverage 4 驗證 enhanced output。
36. Coverage 4 驗證 request shape。

## 不在範圍

37. 不改 OpenAI model。
38. 不改 system prompt。
39. 不改 error copy。
40. 不改 prompt audit scoring。
41. 不改 audit history schema。
42. 不改 settings panel。
43. 不改 service worker。
44. 不改 manifest。
45. 不新增 browser storage schema。
46. 不新增 build tooling。
47. 不拆 `src/`。
48. 不調整 prompt library。
49. 不新增截圖 goldens。
50. 不做真 API integration test。

## 設計

51. 原本 `ApiKeyInline` mount 後會從 remembered localStorage hydrate key。
52. Sprint 1 讓 `App` 的 `apiKey` state 初始值也能 hydrate。
53. 這讓 AuditTab 第一個 render 就能拿到 remembered key。
54. 同時不改 session-only 預設。
55. 沒有 remembered key 時仍是空字串。
56. 使用者沒勾記住時仍只存在 React state。
57. 測試則走 UI 輸入 key。
58. 測試不依賴 addInitScript。
59. 測試不寫 persistent localStorage。
60. 測試不打真 API。
61. `data-testid` 只增加測試穩定性。
62. `aria-label` 同時補小 a11y 缺口。
63. 不改 button visible text。
64. 不改 layout class。
65. 不改 color。
66. 不改 disabled 條件。
67. 不改 enhanced render timing。
68. 不改 `runEnhance` 流程。
69. 不改 `enhancePromptWithOpenAI` request body。
70. 不改 `runAudit` scoring。

## Spec 步驟

71. 建立 isolated page。
72. 在 page 上 route `https://api.openai.com/**`。
73. 收集 request method。
74. 收集 request url。
75. 收集 request JSON body。
76. 收集 Authorization header。
77. fulfill mocked success JSON。
78. goto v2 URL。
79. 點 header `設定 API Key`。
80. 輸入 `sk-test-v22-cov4`。
81. 按 `儲存`。
82. 等 `API Key 已設定`。
83. 點 header `體檢 & 增強`。
84. 等 Audit headline。
85. 填入 original prompt。
86. 按本地體檢。
87. 等 Score。
88. 按 AI enhance。
89. 等 mocked enhanced prompt。
90. 讀 enhanced output。
91. assert enhanced output 包含 mock 文案。
92. assert requests length 等於 1。
93. assert method 是 POST。
94. assert Authorization 是 Bearer test key。
95. assert model 是 `gpt-4o-mini`。
96. assert user message 是 original prompt。
97. assert system message 包含 Forma enhancer identity。
98. assert 沒有 AI 增強失敗。
99. 關閉 isolated context。
100. 寫 report。

## 驗收標準

101. `node tests/master-verify.spec.js` 應為 72/72。
102. `node tests/coverage-extra.spec.js` 應為 6/6。
103. Coverage 4 不再是 placeholder。
104. Coverage 4 不打真 OpenAI。
105. Coverage 4 至少驗證一次 request body。
106. Coverage 4 至少驗證一次 response render。
107. v2.html 行數只允許小幅增加。
108. `web/forma-studio.html` 應無 diff。
109. `git status --short` 只應出現 v2/html、coverage spec、docs。
110. 若測試環境沒有 Playwright，需在交付說明註記。

## 風險

111. 風險：header API key button selector 可能受文字變化影響。
112. 緩解：目前 button visible text 是既有 master path 的穩定 UI。
113. 風險：mock route 沒攔到 OpenAI。
114. 緩解：assert request count。
115. 風險：Audit tab click flake。
116. 緩解：使用 `clickHeaderTab` helper。
117. 風險：`getByTestId` 在舊 Playwright 不可用。
118. 緩解：若 Claude 環境 Playwright 太舊，改成 `[data-testid="..."]` locator。
119. 風險：AI button 因 apiKey hydration race disabled。
120. 緩解：測試走 UI session key，並等 `API Key 已設定`。
121. 風險：localStorage remembered hydration 改變首 render。
122. 緩解：只在 remember true 時 hydrate；無 key path 不變。
123. 風險：新增 aria-label 改變 role name。
124. 緩解：master 現有 no-key 測試用 text regex，仍可匹配。

## 交付

125. 已修改 `web/forma-studio-v2.html`。
126. 已修改 `tests/coverage-extra.spec.js`。
127. 已新增 `docs/PLAN-v2.2.md`。
128. 已新增 `docs/PLAN-v2.2-sprint1.md`。
129. 本地未能跑 Playwright，因缺 `playwright` module。
130. 需要 Claude 在有 Playwright 的環境跑完整 78 steps。
