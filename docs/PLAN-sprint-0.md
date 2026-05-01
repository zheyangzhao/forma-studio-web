# Forma Studio Web v2.0 — Sprint 0 規劃書

## 前置背景

災前 CHANGELOG 記錄的 Sprint 0：

> Sprint 0 — v2 基線（commit `ff8e11d`，2026-04-29）
>
> - 從 v1.1 複製建立 `forma-studio-v2.html`
> - 凍結 v1.1（不再修改）
> - 改 v2 標題為「Forma Studio v2.0 實驗版」+ 副標「v1.1 穩定版仍可用」
> - 新增 `docs/PLAN-v2.0-new-version.md`（397 行整體規劃）

本次災後重做 Sprint 0 只恢復 v2 基線；遺失的 397 行整體規劃留到 Sprint 0 之後另補。

## 一、Sprint 0 範圍

1. 從 `web/forma-studio.html` 複製建立 `web/forma-studio-v2.html`。
2. 只修改 v2 檔的 `<title>` 與頁面 header 標題。
3. 在 v2 標題下方加入 v1.1 穩定版連結。
4. 維持 v1.1 `web/forma-studio.html` 0 修改。
5. Sprint 完成後 commit 並 push。

## 二、變更清單

### `web/forma-studio-v2.html`

- 新增檔案，來源為 `web/forma-studio.html` 的逐字複製。
- `<title>` 改為 `Forma Studio v2.0 實驗版 · AI 設計提示詞工作坊`。
- header `<h1>` 改為 `Forma Studio v2.0 實驗版`。
- 在原 `<h1>` 下方加副標與連結；推薦候選 A。
- 不用 banner，避免 Sprint 0 變成視覺重排；不放 footer，因為版本切換資訊需要首屏可見。
- v1.1 連結 `href` 使用 `./forma-studio.html`；不使用 `/web/forma-studio.html`。

### `web/forma-studio.html`

- 不修改。
- 驗收時 `git diff main -- web/forma-studio.html` 必須 0 輸出。

### `web/v2.html`

- Sprint 0 預設不新增；短 URL 留到後續需要時再做 redirect HTML。
- 不建議 symlink 作為預設，避免 Pages 或不同檔案系統行為差異。

### 最小區分 v2 的變化

1. 修改 v2 `<title>`。
2. 修改 v2 header `<h1>`。
3. 在 v2 header 副標加入 v1.1 相對連結。
4. 可選：只在 v2 HTML 內把 `apple-mobile-web-app-title` 改為 `Forma Studio v2`。
5. 不改 shared `manifest.json`、`service-worker.js`、`theme-color`。

## 三、執行步驟

### Step 1：確認工作樹

```bash
cd "$HOME/Projects/forma-studio-web"
git status --short
```

驗證：輸出應為空；若不空，先停下來確認來源。

### Step 2：建立 v2 檔

```bash
cp web/forma-studio.html web/forma-studio-v2.html
cmp web/forma-studio.html web/forma-studio-v2.html
```

驗證：`cmp` 無輸出。

### Step 3：改 v2 文件標題

只編輯 `web/forma-studio-v2.html`。

```bash
rg -n "<title>|apple-mobile-web-app-title" web/forma-studio-v2.html
```

要做：改 `<title>` 為 v2 實驗版；可選改 `apple-mobile-web-app-title`；不改 `web/manifest.json`。

### Step 4：改 v2 header

只編輯 `web/forma-studio-v2.html`。

要做：改 header `<h1>`；在其下方 `<p>` 加入 `v1.1 穩定版仍可用`；連結使用 `href="./forma-studio.html"`。

驗證：

```bash
rg -n "Forma Studio v2.0 實驗版|v1.1 穩定版仍可用|\\.\\/forma-studio\\.html" web/forma-studio-v2.html
```

### Step 5：跑 `@babel/parser` JSX 驗證

```bash
node - <<'NODE'
const fs = require('fs');
const parser = require('@babel/parser');
const html = fs.readFileSync('web/forma-studio-v2.html', 'utf8');
const match = html.match(/<script type="text\/babel">([\s\S]*?)<\/script>/);
if (!match) throw new Error('missing text/babel script');
parser.parse(match[1], { sourceType: 'script', plugins: ['jsx'] });
console.log('JSX parse OK');
NODE
```

驗證：必須輸出 `JSX parse OK`。若本機沒有 `@babel/parser`，只能用 repo 外暫存依賴，不新增 repo 檔案。

### Step 6：確認 v1.1 仍凍結

```bash
git diff main -- web/forma-studio.html
```

驗證：必須 0 輸出。

### Step 7：瀏覽器驗收 v2

```bash
python3 -m http.server 8000
```

開啟 `http://localhost:8000/web/forma-studio-v2.html`。

驗證：頁面可載入，header 顯示 v2 實驗版，副標出現，點連結可回到 v1.1。

### Step 8：瀏覽器驗收 v1.1

開啟 `http://localhost:8000/web/forma-studio.html`。

驗證：頁面可載入，仍是原本 v1.1 標題，沒有 v2 字樣。

### Step 9：檢查 diff 範圍

```bash
git status --short
git diff --stat
git diff main -- web/forma-studio.html
```

驗證：只應新增 `web/forma-studio-v2.html`；v1.1 diff 仍為 0。

### Step 10：commit 並 push

```bash
git add web/forma-studio-v2.html
git commit
git push
```

驗證：commit 使用 §五草稿；push 成功後確認遠端分支已更新。

## 四、驗收清單

- `web/forma-studio-v2.html` 已從 `web/forma-studio.html` 複製建立。
- v2 `<title>` 顯示 `Forma Studio v2.0 實驗版`。
- v2 header `<h1>` 顯示 `Forma Studio v2.0 實驗版`。
- v2 header 下方首屏可見 `v1.1 穩定版仍可用`。
- v1.1 連結使用 `./forma-studio.html`。
- `@babel/parser` JSX 驗證通過。
- `git diff main -- web/forma-studio.html` 為 0 輸出。
- 瀏覽器可載入 `web/forma-studio-v2.html`。
- 瀏覽器可載入 `web/forma-studio.html`。
- v1.1 頁面沒有出現 v2 標題或副標。
- `git status --short` 不包含非 Sprint 0 檔案。
- 不要求 Playwright 截圖；Playwright spec 留到 Sprint 1。
- Sprint 完成後已 commit 並 push。

## 五、commit message 草稿

```text
chore: establish v2.0 sprint 0 baseline

從 v1.1 凍結版 web/forma-studio.html 複製建立 web/forma-studio-v2.html，
作為 Forma Studio v2.0 災後重做的實驗版基線。

本次只標示 v2 文件標題與頁面標題，並在 header 加入 v1.1 穩定版相對連結。
web/forma-studio.html 維持 0 修改；災前遺失的 PLAN-v2.0-new-version.md
397 行整體規劃不在本 sprint 補回。

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
```

## 六、不做的事

- 不補 `docs/PLAN-v2.0-new-version.md` 397 行整體規劃。
- 不修改 v1.1 檔案 `web/forma-studio.html`。
- 不修改 `web/manifest.json`。
- 不修改 `web/service-worker.js`。
- 不新增 `web/v2.html`，除非後續另開任務。
- 不新增 prompt-library 內容。
- 不做 UI 重設計或功能改動。
- 不新增 Playwright spec 或截圖驗收自動化。
- 不新增 GitHub Actions。
- 不新增或修改任何桌面版路徑。
