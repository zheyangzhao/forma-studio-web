# Forma Studio Web v2.0 — Sprint 3 Plan

## 01. Scope
- Sprint 3 focuses on Style Studio.
- Style Studio is a new top-level tab.
- Source of truth is saved JSX.
- Do not rebuild the UX from scratch.
- Extract the Style Studio component family.
- Extract the 5 category chip data.
- Extract size and quality pickers.
- Extract English prompt composition logic.
- Integrate with the existing Sprint 2 bridge pattern.
- Preserve v1.1 frozen HTML unchanged.

## 02. Required Inputs
- Read saved JSX snapshot first.
- File: `~/forma-rebuild/snapshots/v2-saved-jsx-5518lines.txt`.
- Required functions: `StyleStudioTab`.
- Required functions: `StyleChip`.
- Required functions: `StyleChipGroup`.
- Required data: `STYLE_CATEGORIES`.
- Required data: `STYLE_SIZES`.
- Required data: `STYLE_QUALITIES`.
- Required helper: `buildStylePrompt`.
- Read recovered changelog Sprint 3.
- File: `~/forma-rebuild/docs-recovered/CHANGELOG.md`.
- Read current Sprint 2 implementation.
- File: `web/forma-studio-v2.html`.
- Treat `web/forma-studio.html` as read-only.

## 03. Sprint 3 Definition
- Add tab: `🎬 風格實驗室`.
- Final tab count becomes 7.
- Order: Smart.
- Order: Claude Design.
- Order: NotebookLM.
- Order: Prompt Lab.
- Order: Audit.
- Order: Style Studio.
- Order: Lab.
- Style Studio uses 5 major categories.
- Each category exposes grouped chips.
- Chips are multi-select.
- Prompt output is English.
- Prompt output updates live.
- Size picker supports 1:1.
- Size picker supports 2:3.
- Size picker supports 3:2.
- Quality picker supports low.
- Quality picker supports medium.
- Quality picker supports high.
- Quality picker shows approximate cost.
- Action applies prompt to Claude Design.
- Action sends prompt to Audit.

## 04. Extracted Categories
- Category 1: `人像 / 商業攝影`.
- Category 1 id: `photo`.
- Category 1 lead-in: photorealistic photograph.
- Category 1 includes lighting chips.
- Category 1 includes angle chips.
- Category 1 includes lens chips.
- Category 1 includes mood chips.
- Category 2: `海報 / 插畫`.
- Category 2 id: `poster`.
- Category 2 lead-in: editorial poster design.
- Category 2 includes style chips.
- Category 2 includes palette chips.
- Category 2 includes layout chips.
- Category 2 includes type chips.
- Category 3: `UI / 產品介面`.
- Category 3 id: `ui`.
- Category 3 lead-in: polished UI mockup.
- Category 3 includes platform chips.
- Category 3 includes theme chips.
- Category 3 includes palette chips.
- Category 3 includes density chips.
- Category 3 includes detail chips.
- Category 4: `角色 / 吉祥物`.
- Category 4 id: `character`.
- Category 4 lead-in: character design.
- Category 4 includes medium chips.
- Category 4 includes personality chips.
- Category 4 includes pose chips.
- Category 4 includes background chips.
- Category 5: `醫學圖解 / 衛教`.
- Category 5 id: `medical`.
- Category 5 lead-in: medical textbook illustration.
- Category 5 includes style chips.
- Category 5 includes palette chips.
- Category 5 includes detail chips.
- Category 5 includes audience chips.

## 05. Current v2 Fit
- Current v2 is Sprint 2 complete.
- Current v2 already has Audit.
- Current v2 already has Prompt Lab.
- Current v2 already has landingNote.
- Current v2 already has pending Design prompt state.
- Current v2 already has pending Audit text state.
- Current v2 uses `goTab(nextTab, note)`.
- Current v2 routes Audit prompts through `note.prompt`.
- Current v2 displays Design landing notes in Step 1.
- Style Studio should reuse these mechanisms.
- Do not add unrelated Sprint 4 persistence.
- Do not add settings panel work.
- Do not alter API key persistence behavior.
- Keep the implementation single-file.
- Keep `StyleChip` compatibility intact.

## 06. Implementation Plan
- Insert `STYLE_SIZES`.
- Insert `STYLE_QUALITIES`.
- Insert `STYLE_CATEGORIES`.
- Insert `StyleChipGroup`.
- Insert `buildStylePrompt`.
- Insert `StyleStudioTab`.
- Place Style Studio before Lab.
- Add style tab entry in App.
- Add `applyStyleToDesign`.
- Add `sendStyleToAudit`.
- Render `StyleStudioTab` when `tab === 'style'`.
- Update Design source label for `_source === 'style'`.
- Add Design Step 4 entry point to Style Studio.
- Preserve existing Prompt Lab apply behavior.
- Preserve existing Audit apply behavior.
- Preserve existing Smart send-to-Audit behavior.
- Preserve existing Lab behavior.
- Preserve mobile horizontal tab scroll.

## 07. Cross-Tab Rules
- Style Studio to Design passes final English prompt.
- Design receives it in Step 1 textarea.
- Design landing note names `風格實驗室`.
- Design note tone is amber.
- Design prompt item uses `_source: 'style'`.
- Style Studio to Audit passes final English prompt.
- Audit receives it via `pendingAuditText`.
- Audit immediately runs local 8-dimension audit.
- Audit textarea shows the prompt.
- Audit score and grade appear after bridge.
- The bridge does not call external APIs.

## 08. UX Rules
- Show a plain-language help card.
- Show 5 category cards.
- Show grouped chips for the active category.
- Show subject input.
- Show size buttons.
- Show quality buttons.
- Show a prompt-not-image warning.
- Show live English prompt textarea.
- Show copy button.
- Show completion card.
- Show `套用到 Claude Design`.
- Show `送去體檢`.
- Show `清空 chips`.
- Avoid hidden Style Studio actions after Sprint 3.
- Keep visual tone consistent with existing v2.

## 09. Verification Plan
- Create `tests/sprint3-verify.spec.js`.
- Copy Sprint 2 baseline structure.
- Keep tests 1-31 as baseline regression.
- Update tab-count expectations from 6 to 7.
- Update tab-order expectations to include Style Studio.
- Keep `permissions: []`.
- Keep Prompt Lab chip expectation `>= 18`.
- Add Test 32 for Style Studio tab visibility and click.
- Add Test 33 for 5 category chips.
- Add Test 34 for chip selection and English prompt composition.
- Add Test 35 for size and quality picker.
- Add Test 36 for Style Studio to Claude Design bridge.
- Add Test 37 for unlocked Style Studio action entry.
- Do not run Playwright in this sprint handoff.

## 10. Static Acceptance
- JSX parse must pass.
- v1.1 frozen diff must be zero.
- `web/forma-studio.html` must not be modified.
- `web/forma-studio-v2.html` line count is reported.
- Sprint 3 spec line count is reported.
- Sprint 3 test count is reported.
- Category names are reported.
- Final tab order is reported.
- No commit.
- No push.

## 11. Risks
- Saved JSX includes later Sprint 4 persistence.
- Current v2 does not define `LS`.
- Sprint 3 should not import Sprint 4 settings.
- The migration therefore extracts Sprint 3 behavior only.
- Existing `StyleChip` already exists in current v2.
- `StyleChipGroup` is new and separate.
- Existing tests expect six tabs in Sprint 2.
- Sprint 3 baseline must update those tab expectations.
- Style Studio output uses read-only textarea.
- Tests should target visible text and textarea values.

## 12. Done Criteria
- Style Studio is reachable from header.
- Style Studio is reachable from Design Step 4.
- Five categories render.
- Chips render for the selected category.
- Prompt includes selected English fragments.
- Prompt includes selected size.
- Prompt includes selected quality.
- Design bridge fills Step 1 textarea.
- Audit bridge computes score.
- Sprint 3 spec documents 37 tests.
- Static checks pass.
- v1.1 remains unchanged.
