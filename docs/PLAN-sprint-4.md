# Forma Studio Web v2.0 — Sprint 4 localStorage 持久化規劃

## §一、為什麼把「資料相容」改寫為「localStorage 持久化」
1. Sprint 4 原本曾提到 v1.1 與 v2 的雙向資料相容。
2. 現況檢查後，v1.1 `web/forma-studio.html` 是凍結版，且沒有 localStorage state。
3. 因此做「雙向相容」沒有可同步的資料源。
4. 真正痛點是 v2 每次 reload 後全部回到初始狀態。
5. 使用者會失去最後使用 tab、Prompt Lab 收藏、Style Studio chips、Audit 歷史與 API Key session。
6. Sprint 4 改為建立 v2-only localStorage 基礎設施。
7. v1.1 不修改、不引用、不讀寫任何 v2 key。
8. 所有 key 以 `forma-v2.` 命名空間隔離。
9. 實作直接從 saved JSX 提取，不重新發明 key。
10. 決策摘要：Sprint 4 做 v2 的本機持久化，不做 v1.1-v2 雙向資料交換。

## §二、Namespace 設計
11. 前綴固定為 `forma-v2.`。
12. helper 內部接受短 key，例如 `last-tab`。
13. 實際瀏覽器 key 會是 `forma-v2.last-tab`。
14. string key 用 `LS.getStr` / `LS.setStr`。
15. object key 用 `LS.getObj` / `LS.setObj`。
16. object payload 包含 `schema_version`。
17. object payload 包含 `updated_at`。
18. object payload 的實際資料放在 `data`。
19. localStorage 不可用時降級為 session-only，不阻擋頁面。
20. `LS.clearAll()` 只清除 `forma-v2.*`。
21. `LS.list()` 只列出 `forma-v2.*` 的短 key。
22. saved JSX 確認 key 清單如下：
23. `forma-v2.api-key`
24. `forma-v2.api-key-remember`
25. `forma-v2.last-tab`
26. `forma-v2.plab.favorites`
27. `forma-v2.style.last-state`
28. `forma-v2.audit.history`
29. 沒有使用 `forma-v2.lastTab`、`forma-v2.favorites` 或 `forma-v2.styleState`。
30. 以上 camelCase 名稱只視為需求描述，實作以 saved JSX key 為準。
31. 決策摘要：key schema 沿用 saved JSX 的六個 `forma-v2.*` key。

## §三、5 項實質持久化
32. A. API Key「記住此設備」。
33. 預設仍為 session-only。
34. 使用者勾選「記住此設備」才寫入 `forma-v2.api-key`。
35. 同時寫入 `forma-v2.api-key-remember` 為 `true`。
36. 未勾選時移除 `forma-v2.api-key`，並寫入 remember 為 `false`。
37. 首次 mount 若 remember 為 `true` 且有 key，帶回 React session state。
38. UI 要明確警告 localStorage 不加密。
39. UI 提供「忘記此 key」清除 session 與 localStorage。
40. SettingsPanel 只顯示 key 是否存在，不顯示 key 內容。
41. B. 最後使用的 tab。
42. key 為 `forma-v2.last-tab`。
43. App 初始化時讀取此 key。
44. 讀到未知 tab id 時回退 `smart`。
45. `goTab()` 每次切換時寫入最新 tab。
46. reload 後回到最後一個 tab。
47. 支援目前 Sprint 3 的七個 tab id。
48. 合法 tab id：`smart`、`design`、`nlm`、`promptlab`、`audit`、`style`、`lab`。
49. C. Prompt Lab 收藏。
50. key 為 `forma-v2.plab.favorites`。
51. schema：`{ ids: string[] }`。
52. 每張 PromptLabCard 顯示星號收藏按鈕。
53. 點擊收藏會同步寫入 localStorage。
54. 頂端 filter 顯示「只看收藏」與收藏數。
55. reload 後星號與收藏 filter 數量應還原。
56. 若 localStorage 不可用，顯示降級提示。
57. 不在 Sprint 4 做匯出 JSON。
58. D. Style Studio 偏好。
59. key 為 `forma-v2.style.last-state`。
60. schema：`cat_id`、`subject`、`picks`、`size_id`、`quality_id`。
61. 初始化時讀取，非法類別、尺寸、品質回退預設。
62. 任一欄位變更即寫入 localStorage。
63. reload 後還原類別、主題、chips、尺寸、品質。
64. 操作區新增「清除偏好」。
65. 清除偏好會移除 localStorage key 並回到 demo 預設。
66. E. Audit 歷史。
67. key 為 `forma-v2.audit.history`。
68. schema：`{ items: AuditHistoryItem[] }`。
69. 每筆包含 `id`、`prompt`、`score`、`grade`、`word_count`、`created_at`、`source`。
70. 手動體檢會寫入歷史。
71. 從其他 tab bridge 進 Audit 也會寫入歷史。
72. demo sample 不寫入歷史，避免污染紀錄。
73. FIFO 保留最近 10 筆。
74. UI 顯示「體檢歷史」chip。
75. 歷史列表可點回填 prompt 並重新計分。
76. UI 提供「清除全部歷史」。
77. 決策摘要：五項持久化均有 clear path，且不影響 v1.1。

## §四、隱私邊界與安全
78. localStorage 是瀏覽器純文字儲存。
79. 不加密。
80. 不雲端同步。
81. 不上傳到 Forma Studio 後端，因為目前沒有後端。
82. API Key 是敏感憑證。
83. API Key 持久化必須 opt-in。
84. API Key UI 文案需提醒只在私人電腦使用。
85. Audit prompt 可能含商業或個人資料。
86. Audit history UI 需提示「只存在此瀏覽器 localStorage，不會上傳」。
87. SettingsPanel 隱私區需說明「純本地」「不加密」「不雲端同步」。
88. AI 增強不是 localStorage 行為，會呼叫 OpenAI API。
89. AI 增強前提醒不要輸入機密。
90. 危險清除只刪 `forma-v2.*`。
91. 不碰其他網站 key。
92. 不碰 v1.1。
93. 決策摘要：持久化以便利為目標，但敏感資料必須 opt-in 並可一鍵清除。

## §五、UI 集中點：⚙️ v2 設定面板
94. 不新增 tab。
95. 設定入口放在右上角 API Key dropdown 內。
96. 入口文案為「⚙️ v2 完整設定面板」。
97. SettingsPanel 是 modal overlay。
98. 面板第一區顯示 API Key 狀態。
99. 面板第二區顯示本地持久化狀態。
100. 顯示最後 tab。
101. 顯示 Prompt Lab 收藏數。
102. 顯示 Style Studio 偏好是否存在。
103. 顯示 Audit history 數量。
104. 顯示目前使用中的短 key 清單。
105. 每項有單獨清除按鈕。
106. 危險區提供清除全部按鈕。
107. 清除全部後可選擇 reload 讓 React state 完全回到預設。
108. 決策摘要：設定入口掛在 API Key 區最合理，因為它同時承載本地資料與隱私設定。

## §六、Sprint 4 sub-task 切分
109. T1：加入 LS helper 與 tab id validation。
110. T2：App hydration 讀 `last-tab`。
111. T3：`goTab()` 寫入 `last-tab`。
112. T4：ApiKeyInline 加 opt-in persist。
113. T5：PromptLabCard 加星號收藏。
114. T6：PromptLabTab 加 favorites state 與 filter。
115. T7：StyleStudioTab 加 `style.last-state` hydrate/write。
116. T8：StyleStudioTab 加清除偏好 action。
117. T9：AuditTab 加 history hydrate/write。
118. T10：AuditTab 加 history panel 與 clear。
119. T11：SettingsPanel modal。
120. T12：新增 Sprint 4 Playwright 驗收 spec。
121. T13：確認 JSX/Babel parse。
122. T14：確認 v1.1 diff = 0。
123. 決策摘要：每個 sub-task 都可獨立驗收，降低大檔案修改風險。

## §七、明確不做的事
124. 不修改 `web/forma-studio.html`。
125. 不 commit。
126. 不 push。
127. 不寫 Desktop。
128. 不新增後端。
129. 不做雲端同步。
130. 不加密 localStorage。
131. 不做跨裝置資料搬移。
132. 不把 API Key 預設存入 localStorage。
133. 不新增第八個 tab。
134. 不改 Prompt Lab 資料來源格式。
135. 不改 Sprint 3 Style Studio 核心 prompt 組裝規則。
136. 不讓 demo Audit sample 寫入歷史。
137. 決策摘要：Sprint 4 是 local persistence patch，不是帳號系統或資料平台。

## §八、驗收清單
138. `web/forma-studio-v2.html` JSX parse OK。
139. `web/forma-studio.html` git diff = 0。
140. v2 七個 tab smoke regression pass。
141. Sprint 3 37 個 baseline test pass。
142. Test 38：切到某 tab，reload 後仍在該 tab。
143. Test 39：Prompt Lab 收藏一筆，reload 後仍顯示收藏。
144. Test 40：Style Studio 修改類別、主題、chip、size、quality，reload 後還原。
145. Test 41：Audit 跑過一筆非 demo prompt，reload 後 history 仍存在。
146. Test 42：SettingsPanel 入口可見，清除全部流程按鈕可點。
147. localStorage key 清單只包含 saved JSX 確認的六個 key。
148. 每個 reload-test 用新 browser context。
149. 每個 reload-test 先清 localStorage，避免互相干擾。
150. `page.context().clearCookies()` 不應影響 localStorage 驗證。
151. SettingsPanel 單項清除只刪指定 `forma-v2.*` key。
152. 清除全部只刪 `forma-v2.*` key。
153. API Key dropdown 仍能 session-only 使用。
154. 未勾選「記住此設備」不留下 `forma-v2.api-key`。
155. 決策摘要：驗收聚焦「reload 後仍在」與「v1.1 未動」兩件事。
