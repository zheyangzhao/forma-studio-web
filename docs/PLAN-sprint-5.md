# Forma Studio Web v2.0 — Sprint 5 文件收尾規劃

## §一、Sprint 5 定位
1. Sprint 5 是 Phase B 的文件收尾 sprint。
2. 本 sprint 不修改 `web/forma-studio-v2.html`。
3. 本 sprint 不修改 `web/forma-studio.html`。
4. 本 sprint 不修改 `tests/`。
5. 本 sprint 不新增 Playwright spec。
6. 本 sprint 不 commit。
7. 本 sprint 不 push。
8. 本 sprint 不寫 `~/Desktop`。
9. 主要目標是讓 repo 文件能描述 Sprint 0 到 Sprint 4 的實際成果。
10. 次要目標是補上 root `CHANGELOG.md`，讓災後重做歷程可追。

## §二、必讀來源
11. 讀取災前 CHANGELOG 參考：`~/forma-rebuild/docs-recovered/CHANGELOG.md`。
12. 讀取目前 v2 主程式：`web/forma-studio-v2.html`。
13. 確認 v2 主程式目前為 5501 行。
14. 讀取目前 `README.md`，確認仍停在 Sprint 0 口徑。
15. 讀取 v1.1 凍結契約：`docs/CONTRACT-v1.1-frozen.md`。
16. 讀取 git log，範圍從 `cc9aaa0` 到 `7625880`。
17. 以實際 git log 為 CHANGELOG 的 commit 來源。
18. 以目前 v2 程式碼為 README 功能描述來源。
19. 以 Sprint 0 到 Sprint 4 plan 為補充脈絡。
20. 不從記憶補寫尚未存在的功能。

## §三、README 更新範圍
21. README 標題改為 `Forma Studio Web v2.0`。
22. 第一段說明這是純前端 AI 設計提示詞工作坊。
23. 保留 v1.1 凍結契約入口。
24. 明確指向 `docs/CONTRACT-v1.1-frozen.md`。
25. 說明 `web/forma-studio.html` 是凍結版。
26. 說明 `web/forma-studio-v2.html` 是 v2.0 主程式。
27. 補上 8 個頁籤級工作區導覽。
28. 8 個工作區包含智慧製圖。
29. 8 個工作區包含 Claude Design。
30. 8 個工作區包含 NotebookLM。
31. 8 個工作區包含 Prompt Lab。
32. 8 個工作區包含體檢 & 增強。
33. 8 個工作區包含 Style Studio。
34. 8 個工作區包含品牌與評審。
35. 8 個工作區包含彩蛋 Lab。
36. 說明目前頂層 UI 是 7 個主 tab。
37. 說明品牌與評審位於 Claude Design 子工作區。
38. 避免宣稱 UI 有不存在的第 8 個頂層 tab。
39. 補上災後重做緣起。
40. 補上 Sprint 0 到 Sprint 5 的一行節奏。
41. 補上 Quick Start。
42. Quick Start 使用 `python3 -m http.server 8765`。
43. v2 URL 指向 `http://localhost:8765/web/forma-studio-v2.html`。
44. v1.1 URL 指向 `http://localhost:8765/web/forma-studio.html`。
45. 補上專案結構。
46. 補上開發邊界。
47. 補上 License MIT。

## §四、CHANGELOG 新增範圍
48. root 新增 `CHANGELOG.md`。
49. 參考災前 CHANGELOG 的結構，但不複製過時 commit。
50. CHANGELOG 只記錄本 repo 實際 commit。
51. 順序採時間倒序，最新在上。
52. 第一筆為 Sprint 4 commit `7625880`。
53. 第二筆為 Sprint 3 commit `72c7d88`。
54. 第三筆為 Sprint 2 commit `9c56e5c`。
55. 第四筆為 Sprint 1.8 commit `c983958`。
56. 第五筆為 Sprint 1.6 + 1.7 commit `d173add`。
57. 第六筆為 Sprint 1.5 commit `6cd1b02`。
58. 第七筆為 Sprint 1 commit `05778b6`。
59. 第八筆為 Sprint 0 commit `6ce5a9d`。
60. 第九筆為 v1.1 baseline import commit `cc9aaa0`。
61. 每個 commit 寫 1 到 3 行摘要。
62. 摘要以實作成果為主，不寫測試細節長表。
63. 保留 Attribution 區塊。
64. Attribution 標出 wuyoscar 來源。
65. Attribution 標出 EvoLinkAI 來源。
66. Attribution 標出用戶自製 Artifact 參考。
67. 最後標出 Phase B 文件狀態。

## §五、驗收方式
68. `git status --short` 應只顯示 README、CHANGELOG、PLAN 三個文件變更。
69. `web/forma-studio.html` 不應出現在 status。
70. `web/forma-studio-v2.html` 不應出現在 status。
71. `tests/` 不應出現在 status。
72. `wc -l README.md` 統計 README 行數。
73. `wc -l CHANGELOG.md` 統計 CHANGELOG 行數。
74. `wc -l docs/PLAN-sprint-5.md` 統計 PLAN 行數。
75. PLAN 行數需落在 80 到 150 行。
76. README 要可從 repo 根目錄直接理解 v2.0 現況。
77. CHANGELOG 要可追溯從 baseline 到 Sprint 4 的重做歷程。

## §六、不做事項
78. 不修改任何 HTML 程式碼。
79. 不修改任何 prompt-library JSON。
80. 不修改 service worker。
81. 不修改 manifest。
82. 不修改既有 Sprint 0 到 Sprint 4 plan。
83. 不修改既有 tests。
84. 不新增 npm、package 或 tooling。
85. 不新增規格書。
86. 不啟動長時間服務。
87. 不跑 Playwright。
88. 不把 `~/forma-rebuild/` 內容複製進 repo。
89. 不改變 v1.1 凍結契約。
90. 不把 localStorage key schema 寫成新需求。
91. 不把 Phase C 功能寫成已完成。
92. 不做 commit。
93. 不 push。

## §七、完成回報
94. 回報 `git status`。
95. 回報 README 行數。
96. 回報 CHANGELOG 行數。
97. 回報 PLAN 行數。
98. 若 status 出現範圍外文件，需先停下檢查。
99. 若 PLAN 行數低於 80 或高於 150，需調整。
100. 最終回覆只列完成事項與驗收結果。
