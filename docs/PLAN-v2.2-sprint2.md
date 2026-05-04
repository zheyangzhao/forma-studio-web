# Forma Studio Web v2.2 Sprint 2 Plan

1. Sprint 名稱：PWA / offline hardening。
2. 日期：2026-05-04（Asia/Taipei）。
3. 工作基準：v2.2 Sprint 1 後的 v2 單檔架構。
4. 主要檔案：`web/forma-studio-v2.html`。
5. 主要檔案：`web/service-worker.js`。
6. 主要檔案：`web/manifest.json`。
7. 測試檔案：`tests/v22-sprint23-verify.spec.js`。
8. 凍結檔案：`web/forma-studio.html`。
9. 限制：不得修改 v1.1 frozen HTML。
10. 限制：不得新增 `package.json`。
11. 限制：不得新增 `node_modules`。
12. 限制：不得寫入 `~/Desktop`。
13. 限制：不得快取 OpenAI API request。
14. 限制：不得快取使用者 prompt body。
15. 限制：不得更動 v2 localStorage schema。

## 目標

16. 目標：manifest 的 PWA 入口必須指向 v2。
17. 目標：service worker cache name 必須升級到 v2.2。
18. 目標：v2 shell 可離線回應。
19. 目標：Prompt Lab JSON 可離線回應。
20. 目標：translations-zh.json 可離線回應。
21. 目標：離線時使用者看到明確 banner。
22. 目標：網路失敗時 Prompt Lab 有 fallback 或重試。
23. 目標：v1 仍可直接開啟。
24. 目標：v1 不主動註冊 service worker。
25. 目標：既有 72 + 6 baseline 不受影響。

## 現況

26. 現況：`web/manifest.json` 已存在。
27. 現況：manifest 原 start_url 指向 v1。
28. 現況：`web/service-worker.js` 已存在。
29. 現況：service worker 原 cache name 是 v1。
30. 現況：service worker 原 precache 只含 v1 HTML 與 manifest。
31. 現況：v2 head 已有 manifest link。
32. 現況：v2 head 已有 service worker register。
33. 現況：v1 head 沒有 service worker register。
34. 現況：Prompt Lab fetch 使用 `cache:'no-store'`。
35. 現況：Prompt Lab JSON 失敗時顯示錯誤卡。
36. 缺口：Prompt Lab offline cache 未測。
37. 缺口：manifest v2 entry 未測。
38. 缺口：SW source policy 未測。
39. 缺口：瀏覽器 Cache API fallback 未實作。
40. 缺口：離線 banner 未實作。

## Manifest 設計

41. manifest `name` 改為 `Forma Studio v2`。
42. manifest `short_name` 改為 `Forma v2`。
43. manifest `id` 指向 `./forma-studio-v2.html`。
44. manifest `start_url` 指向 `./forma-studio-v2.html`。
45. manifest `scope` 保持 `./`。
46. manifest `display` 保持 `standalone`。
47. manifest `background_color` 保持深色。
48. manifest `theme_color` 保持黃色。
49. manifest icons 保持 data SVG。
50. manifest 不新增外部 icon 依賴。

## Service Worker 設計

51. cache name 使用 `forma-studio-v2.2`。
52. precache 納入 `./forma-studio-v2.html`。
53. precache 不納入 `./forma-studio.html`，避免 v1 被 v2 SW fallback 影響。
54. precache 保留 `./manifest.json`。
55. precache 納入 `gallery-index.json`。
56. precache 納入 `translations-zh.json`。
57. precache 納入所有 prompt-library category JSON。
58. install 使用 `cache.addAll`。
59. install 後 `skipWaiting`。
60. activate 後 `clients.claim`。
61. activate 清掉舊 `forma-studio-v*` cache。
62. activate 不清 app runtime cache。
63. GET only。
64. POST request 不處理。
65. OpenAI hostname 不處理。
66. v2 navigation request 使用 network-first。
67. v2 HTML 使用 network-first。
68. manifest 使用 network-first。
69. prompt-library JSON 使用 network-first。
70. CDN asset 使用 cache-first。
71. request cache key 去除 search。
72. network fail 時回 cache。
73. v2 navigation fallback 使用 v2 HTML。
74. 不在 SW 內存任何使用者輸入。
75. 不在 SW 內 inspect request body。

## Runtime Fallback 設計

76. Prompt Lab JSON fetch 包成 `fetchJsonWithRuntimeCache`。
77. 成功 fetch 後寫入 Cache API runtime cache。
78. runtime cache 名稱：`forma-studio-prompt-library-v2.2`。
79. runtime cache 只存 prompt-library JSON。
80. fetch 失敗時讀 Cache API。
81. Cache API hit 時回傳 cached JSON。
82. Cache API miss 時沿用原錯誤流程。
83. translations JSON 失敗仍可 fallback 英文。
84. category JSON 失敗時顯示 Prompt Lab 載入失敗。
85. runtime fallback 支援測試中 abort network。
86. runtime fallback 不依賴 service worker 是否可用。
87. runtime fallback 不影響 file:// 基本使用。
88. runtime fallback 在 file:// 不使用 Cache API。
89. fallback hit 會 dispatch offline notice event。
90. network fail 會 dispatch offline notice event。

## Offline Banner

91. App 新增 `offlineNotice` state。
92. `navigator.onLine === false` 時顯示初始 banner。
93. window offline event 顯示 banner。
94. window online event 清除離線 banner。
95. Cache API hit 顯示「已使用離線快取」。
96. network fail 顯示「網路讀取失敗」。
97. banner 有 `data-testid="offline-banner"`。
98. banner 有手動關閉按鈕。
99. Esc 可清除 banner。
100. banner 放在 header 後，不覆蓋主要內容。

## 測試

101. Test：manifest JSON integrity。
102. Test：manifest start_url 指向 v2。
103. Test：service worker source 包含 v2 cache name。
104. Test：service worker source 包含 v2 HTML。
105. Test：service worker source 包含 translations JSON。
106. Test：service worker source 包含 prompt-library JSON。
107. Test：service worker source 排除 OpenAI API。
108. Test：v2 HTML 有 manifest link。
109. Test：v2 HTML 有 service worker register。
110. Test：SW navigation fallback 限定 v2 shell，不處理 v1。
111. Test：Prompt Lab 首次線上載入成功。
112. Test：Cache API 中出現 gallery-index。
113. Test：mock prompt-library network abort。
114. Test：Prompt Lab reload 後仍顯示 116 prompts。
115. Test：offline banner 可見。

## 驗收

116. 驗收：`tests/v22-sprint23-verify.spec.js` 通過。
117. 驗收：`tests/master-verify.spec.js` 仍可通過。
118. 驗收：`tests/coverage-extra.spec.js` 仍可通過。
119. 驗收：`git diff -- web/forma-studio.html` 為空。
120. 驗收：沒有新增 package 或 node_modules。
