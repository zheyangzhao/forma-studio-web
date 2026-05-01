# Forma Studio Web

AI 設計提示詞工作坊（純 Web 版）。

從 [forma-studio-v2.5](https://github.com/zheyangzhao/forma-studio-v2.5) 的 web v1.1 為基線重新出發，**桌面版本停用**，本 repo 專注網頁版開發與重做 v2.0。

## 結構

```
web/
├── forma-studio.html          # v1.1 凍結版（4 區塊 glow，3 tab，3422 行）
├── prompt-library/            # 116 條 prompt（18 個 JSON）
├── manifest.json
├── service-worker.js
└── README.md

docs/
└── CONTRACT-v1.1-frozen.md    # v1.1 凍結契約

LICENSE
```

## v1.1 凍結

`web/forma-studio.html` 屬 v1.1 凍結版，**任何 PR 不得修改該檔**。詳見 `docs/CONTRACT-v1.1-frozen.md`。

## v2.0 重做計劃

v2.0 主程式（`web/forma-studio-v2.html`）將從 v1.1 為基底，按 17 個 sprint 高保真重做：

- Phase A：Sprint 0 → Sprint 1.8（v2 基線 + Prompt Lab + 116 翻譯 + UX 引導）
- Phase B：Sprint 2 → Sprint 5（Audit + Style + localStorage + README）
- Phase C：B-lite + Truly-Neutral + PPT Flow Lite
- 之後（可選）：C-1 Smart glow 化 + C-2 快速/完整分流

進度詳見後續 commit 與 `docs/CHANGELOG.md`（待 Sprint 0 建立）。

## 災後重建緣起

2026-05-01 因誤刪事件，原 v2.0 主程式 5915 行遺失。本 repo 為從 v1.1 基線重做的成果。完整救援與規劃資料保存於本機 `~/forma-rebuild/`（不上版控）。

## License

MIT — 見 LICENSE。
