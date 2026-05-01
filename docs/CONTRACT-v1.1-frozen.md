# v1.1 凍結契約

## 規則

`web/forma-studio.html` = v1.1 凍結版，**任何後續 PR 不得修改該檔**。

行數固定：3422 行。
任何 PR 跑 `git diff main -- web/forma-studio.html` 必須輸出 0 行差異，否則 PR 不得合併。

## 為什麼凍結

1. v1.1 是已發布的穩定版，使用者依賴
2. 4 區塊 glow 視覺設計 DNA 是後續所有 v2.0 sprint 的標準參照
3. 災難前已凍結，重建後仍維持

## 為了維持「可隨時對照 v1.1」

v2.0 程式碼會放在 `web/forma-studio-v2.html`（後續 Sprint 0 新增）。
兩個檔案並存，使用者可透過 URL 切換查看舊版。

## 例外

唯一允許修改 v1.1 的情境：

- **資安漏洞修復**（CVE 類）：必須附 CVE 編號或同等緊急理由
- **無法回避的瀏覽器棄用**：例如某 API 被 Chrome 移除導致 v1.1 完全壞掉

兩種例外都需明確 PR 描述 + commit message 說明。

## 來源

- 原始來源：`forma-studio-v2.5.git@13e2884`/`web/forma-studio.html`
- 本 repo 第 1 個 commit 直接從上游 import，未做任何修改
