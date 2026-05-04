# Forma Studio Web v2.2 Sprint 3 Plan

1. Sprint 名稱：Keyboard shortcuts + micro interactions。
2. 日期：2026-05-04（Asia/Taipei）。
3. 工作基準：v2.2 Sprint 2 後的 v2 單檔架構。
4. 主要檔案：`web/forma-studio-v2.html`。
5. 測試檔案：`tests/v22-sprint23-verify.spec.js`。
6. 凍結檔案：`web/forma-studio.html`。
7. 限制：不得修改 v1.1 frozen HTML。
8. 限制：不得新增 build pipeline。
9. 限制：不得新增 `package.json`。
10. 限制：不得新增 `node_modules`。
11. 限制：不得破壞 keyboard tab order。
12. 限制：不得攔截普通文字輸入。
13. 限制：不得讓 mobile 出現水平 overflow。
14. 限制：不得新增大型 UI。
15. 限制：不得改 localStorage schema。

## 目標

16. 目標：Cmd/Ctrl + K 聚焦主要輸入。
17. 目標：Cmd/Ctrl + 1 切到智慧製圖。
18. 目標：Cmd/Ctrl + 2 切到 Claude Design。
19. 目標：Cmd/Ctrl + 3 切到 NotebookLM。
20. 目標：Cmd/Ctrl + 4 切到 Prompt Lab。
21. 目標：Cmd/Ctrl + 5 切到 Audit。
22. 目標：Cmd/Ctrl + 6 切到 Style。
23. 目標：Cmd/Ctrl + 7 開啟 Settings。
24. 目標：Esc 關閉 modal。
25. 目標：Esc 關閉 dropdown。
26. 目標：Esc 清除 landing note / offline banner。
27. 目標：tab buttons 有 subtle hover transition。
28. 目標：card/action buttons 有 subtle hover transition。
29. 目標：prefers-reduced-motion 下移除 transform。
30. 目標：不更動既有 tab stop 順序。

## 快捷鍵策略

31. 快捷鍵只處理 meta/ctrl 組合與 Esc。
32. 普通 `1` 到 `7` 不攔截。
33. textarea 中普通數字輸入保留。
34. input 中普通數字輸入保留。
35. contenteditable 中普通輸入保留。
36. Cmd/Ctrl + K 會 preventDefault。
37. Cmd/Ctrl + K 優先找 visible textarea。
38. 若沒有 textarea，找 Prompt Lab search input。
39. 若沒有 search input，找 visible text input。
40. focus 後可 select 目前內容。
41. Cmd/Ctrl + 1 使用 `goTab('smart')`。
42. Cmd/Ctrl + 2 使用 `goTab('design')`。
43. Cmd/Ctrl + 3 使用 `goTab('nlm')`。
44. Cmd/Ctrl + 4 使用 `goTab('promptlab')`。
45. Cmd/Ctrl + 5 使用 `goTab('audit')`。
46. Cmd/Ctrl + 6 使用 `goTab('style')`。
47. Cmd/Ctrl + 7 設定 `settingsOpen=true`。
48. tab shortcut 會更新 last-tab。
49. tab shortcut 不建立 pending payload。
50. tab shortcut 不改現有表單 state。

## Esc 策略

51. App 全域監聽 Escape。
52. Escape 關閉 Settings panel。
53. Escape 清除 offline banner。
54. Escape 清除 landing note。
55. Escape dispatch `forma-escape` custom event。
56. ApiKey dropdown 監聽 Escape。
57. ApiKey dropdown 監聽 `forma-escape`。
58. Chip dropdown 監聽 Escape。
59. Chip dropdown 監聽 `forma-escape`。
60. SettingsPanel 保留既有 Escape listener。
61. SettingsPanel 保留 outside click close。
62. Escape 不清空使用者 textarea。
63. Escape 不切 tab。
64. Escape 不提交表單。
65. Escape 不重設 localStorage。

## Micro Interactions

66. CSS 增加 `.micro-interact`。
67. `.micro-interact` transition transform。
68. `.micro-interact` transition box-shadow。
69. `.micro-interact` transition border-color。
70. `.micro-interact` hover translateY -1px。
71. `.micro-interact` hover scale 1.01。
72. `.micro-interact` hover glow 低透明。
73. disabled button 不 transform。
74. tab-on/tab-off 增加 transition。
75. tab hover translateY -1px。
76. tab hover scale 1.015。
77. tab hover 加 subtle text-shadow。
78. prefers-reduced-motion 下關閉 transition。
79. prefers-reduced-motion 下關閉 transform。
80. 不改主色系。
81. 不新增 decorative orbs。
82. 不新增大型 animation。
83. 不新增 layout shift。
84. 不改文字大小策略。
85. 不改 responsive grid。

## 套用範圍

86. Header tab buttons 套用 tab hover CSS。
87. Settings header button 套用 tab hover CSS。
88. ApiKeyInline button 套用 `.micro-interact`。
89. `Card` helper 套用 `.micro-interact`。
90. Prompt Lab card action buttons 套用 `.micro-interact`。
91. `NextStepCard` actions 套用 `.micro-interact`。
92. Offline banner close button 套用 `.micro-interact`。
93. 不批量改所有 button，降低 regression。
94. 不改 native select。
95. 不改 checkbox/radio 行為。

## 測試

96. Test：Cmd/Ctrl + K 聚焦 Smart textarea。
97. Test：Cmd/Ctrl + 1 切到智慧製圖。
98. Test：Cmd/Ctrl + 2 切到 Claude Design。
99. Test：Cmd/Ctrl + 3 切到 NotebookLM。
100. Test：Cmd/Ctrl + 4 切到 Prompt Lab。
101. Test：Cmd/Ctrl + 5 切到 Audit。
102. Test：Cmd/Ctrl + 6 切到 Style。
103. Test：Cmd/Ctrl + 7 開啟 Settings。
104. Test：Esc 關閉 Settings。
105. Test：API key dropdown 可用 Esc 關閉。
106. Test：textarea 中普通 `1234567` 不切 tab。
107. Test：header tab button 有 transition/micro hover class path。
108. Test：Prompt Lab card action button 有 `.micro-interact`。
109. Test：baseline tab order 由 coverage-extra 保護。
110. Test：master tabs smoke 由 master spec 保護。

## 驗收

111. 驗收：`tests/v22-sprint23-verify.spec.js` 通過。
112. 驗收：`tests/master-verify.spec.js` 仍可通過。
113. 驗收：`tests/coverage-extra.spec.js` 仍可通過。
114. 驗收：Cmd/Ctrl shortcuts 不改普通輸入。
115. 驗收：Esc 不破壞 textarea 內容。
116. 驗收：hover 動效輕量且可 reduce。
117. 驗收：`web/forma-studio.html` 未修改。
118. 驗收：沒有新增 package 或 node_modules。
119. 驗收：v2 tab order 保持。
120. 驗收：mobile 無新增水平 overflow 風險。
