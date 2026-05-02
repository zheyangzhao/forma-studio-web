/*
 * v2.1 master acceptance spec. Running this file is equivalent to running
 * the full baseline: v1.1 frozen smoke, v2.0/C-series regression, and v2.1.
 */
const {
  BASE_URL,
  clickHeaderTab,
  clickText,
  createBrowser,
  createContext,
  expect,
  newIsolatedPage,
  resultCount,
  runStep,
  shot,
  sourcePromptById,
  sourceV2Html,
  translationsJson,
  verifyPromptJson,
  verifyTranslationsJson,
  waitText,
  writeReport,
} = require('./helpers');
(async () => {
  const browser = await createBrowser();
  const context = await createContext(browser);
  const page = await context.newPage();
  await runStep('Test 1 v1.1 frozen smoke', page, async () => {
    await page.goto(`${BASE_URL}/forma-studio.html`, { waitUntil: 'domcontentloaded' });
    await waitText(page, 'Claude Design'); expect((await page.title()).includes('Forma Studio'), 'title 未包含 Forma Studio');
    await waitText(page, 'NotebookLM'); await waitText(page, '智慧製圖');
    await waitText(page, '彩蛋');
    const promptLabTabs = await page.locator('header button', { hasText: '提示詞庫' }).count();
    expect(promptLabTabs === 0, 'v1.1 不應出現提示詞庫 tab'); await shot(page, 'sprint1-v1-smoke.png');
  });
  await runStep('Test 2 v2 existing tabs smoke', page, async () => {
    await page.goto(`${BASE_URL}/forma-studio-v2.html`, { waitUntil: 'domcontentloaded' });
    await waitText(page, 'v2.0');
    for (const label of ['智慧製圖', 'Claude Design', 'NotebookLM', '提示詞庫', '體檢 & 增強', '風格實驗室', '設定']) {
      await waitText(page, label);
    }
    const tabLabels = await page.locator('header .border-t button').evaluateAll(nodes => nodes.map(n => n.textContent.trim()));
    expect(tabLabels.join(' | ').includes('🖼️ 智慧製圖 | 🎨 Claude Design | 📑 NotebookLM | 📚 提示詞庫 | 🩺 體檢 & 增強 | 🎬 風格實驗室'), `tab 順序不符：${tabLabels.join(' | ')}`);
    await clickText(page, 'Claude Design'); await waitText(page, '描述需求');
    await clickText(page, 'NotebookLM'); await waitText(page, 'NotebookLM 智慧指令中樞');
    await clickText(page, '智慧製圖'); await waitText(page, '說明您要做什麼');
    await page.locator('header button', { hasText: '風格實驗室' }).first().click();
    await waitText(page, '5 類別 + 風格 chips'); await clickText(page, 'Claude Design');
    await clickText(page, '進階實驗工具'); await waitText(page, '彩蛋 Lab');
    await clickText(page, '體檢 & 增強'); await waitText(page, 'prompt 健檢工具');
    await shot(page, 'sprint3-v2-tabs.png');
  });
  await runStep('Test 3 Prompt Lab load all', page, async () => {
    await clickText(page, '提示詞庫');
    await page.locator('text=載入提示詞庫中').waitFor({ state: 'detached', timeout: 15000 }).catch(() => {});
    await waitText(page, '共 116 條 prompt'); await waitText(page, 'wuyoscar/gpt_image_2_skill');
    await waitText(page, 'EvoLinkAI/awesome-gpt-image-2-prompts'); await waitText(page, 'CC BY 4.0');
    const chips = await page.locator('button.rounded-full').count();
    expect(chips >= 18, `category chips 應至少 18 個（17 分類 + 全部），實際 ${chips}`);
    const count = await resultCount(page);
    expect(count.visible === 116 && count.total === 116, `結果數應為 116/116，實際 ${count.visible}/${count.total}`);
    verifyPromptJson(); await shot(page, 'sprint1-promptlab-all.png');
  });
  await runStep('Test 4 search chess', page, async () => {
    const input = page.getByLabel('搜尋提示詞'); await input.fill('chess');
    await waitText(page, 'Chess board mid-tournament game'); const count = await resultCount(page);
    expect(count.visible > 0 && count.visible < 116, `chess 搜尋結果應小於 116 且大於 0，實際 ${count.visible}`);
    await shot(page, 'sprint1-promptlab-search-chess.png'); await input.fill('');
    const reset = await resultCount(page);
    expect(reset.visible === 116, `清空搜尋後應回到 116，實際 ${reset.visible}`);
  });
  await runStep('Test 5 category chip photography', page, async () => {
    await clickText(page, '商業攝影'); const count = await resultCount(page);
    expect(count.visible === 4, `商業攝影分類應為 4，實際 ${count.visible}`);
    await waitText(page, 'RAW iPhone'); await waitText(page, 'Chess board');
    await shot(page, 'sprint1-promptlab-filter-photography.png'); await clickText(page, '全部');
    const reset = await resultCount(page);
    expect(reset.visible === 116, `回到全部後應為 116，實際 ${reset.visible}`);
  });
  await runStep('Test 6 expand and copy', page, async () => {
    const firstCard = page.locator('.prompt-lab-card').first(); await firstCard.getByText('展開').click();
    await firstCard.getByText('完整 attribution').waitFor({ state: 'visible', timeout: 5000 });
    const promptText = await firstCard.locator('p').first().textContent();
    expect(promptText.trim().length > 80, `完整 prompt 長度應大於 80，實際 ${promptText.trim().length}`);
    await firstCard.getByText('複製 prompt').click();
    await firstCard.getByText('已複製').waitFor({ state: 'visible', timeout: 5000 });
    try {
      const clip = await page.evaluate(() => navigator.clipboard.readText());
      expect(clip.includes(promptText.trim().slice(0, 40)), 'clipboard text 未包含 prompt 前段');
    } catch (_) {}
    await shot(page, 'sprint1-promptlab-copy.png');
  });
  await runStep('Test 7 apply to Claude Design', page, async () => {
    await page.getByLabel('搜尋提示詞').fill('chess');
    const chessCard = page.locator('.prompt-lab-card', { hasText: 'Chess board mid-tournament game' }).first();
    await chessCard.getByText('套用到 Claude Design').click(); await waitText(page, '描述需求');
    const textarea = page.locator('#dt-step-1 textarea').first(); await expect(await textarea.isVisible(), 'Step 1 textarea 不可見');
    const value = await textarea.inputValue();
    expect(value.length > 80, `Step 1 textarea 長度應大於 80，實際 ${value.length}`);
    expect(value.toLowerCase().includes('chess board'), 'Step 1 textarea 未包含 chess board'); await waitText(page, '已從提示詞庫套用');
    await shot(page, 'sprint1-after-apply-design.png');
  });
  await runStep('Test 8 mobile layout', page, async () => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${BASE_URL}/forma-studio-v2.html`, { waitUntil: 'domcontentloaded' });
    await clickText(page, '提示詞庫');
    await page.locator('text=載入提示詞庫中').waitFor({ state: 'detached', timeout: 15000 }).catch(() => {});
    await page.getByLabel('搜尋提示詞').waitFor({ state: 'visible', timeout: 10000 });
    const box = await page.locator('.prompt-lab-card').first().boundingBox();
    expect(box && box.width <= 390, `第一張卡片寬度不應超出 viewport，實際 ${box && box.width}`);
    const bodyWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(bodyWidth <= 390, `mobile 不應有橫向溢出，scrollWidth=${bodyWidth}`);
    await shot(page, 'sprint1-promptlab-mobile.png');
  });
  await page.setViewportSize({ width: 1280, height: 900 });
  await runStep('Test 9 Chinese search interface', page, async () => {
    await page.goto(`${BASE_URL}/forma-studio-v2.html`, { waitUntil: 'domcontentloaded' });
    await clickText(page, '提示詞庫');
    await page.locator('text=載入提示詞庫中').waitFor({ state: 'detached', timeout: 15000 }).catch(() => {});
    const input = page.getByLabel('搜尋提示詞'); await input.fill('介面');
    await waitText(page, 'Mobile Budgeting App Mockup'); const count = await resultCount(page);
    expect(count.visible > 0 && count.visible < 116, `介面 搜尋結果應小於 116 且大於 0，實際 ${count.visible}`);
    await shot(page, 'sprint1-5-search-interface.png');
  });
  await runStep('Test 10 Chinese search dashboard', page, async () => {
    const input = page.getByLabel('搜尋提示詞'); await input.fill('桌面端');
    await waitText(page, 'Desktop Operations Dashboard'); const count = await resultCount(page);
    expect(count.visible > 0 && count.visible < 116, `桌面端 搜尋結果應小於 116 且大於 0，實際 ${count.visible}`);
    await shot(page, 'sprint1-5-search-dashboard.png');
  });
  await runStep('Test 11 bilingual card title rendering', page, async () => {
    const input = page.getByLabel('搜尋提示詞'); await input.fill('Mobile Budgeting');
    const card = page.locator('.prompt-lab-card', { hasText: 'Mobile Budgeting App Mockup' }).first();
    await card.waitFor({ state: 'visible', timeout: 10000 });
    await card.getByText('行動端記帳 App Mockup').waitFor({ state: 'visible', timeout: 5000 });
    await card.getByText('Mobile Budgeting App Mockup').waitFor({ state: 'visible', timeout: 5000 });
    const text = await card.textContent(); expect(text.includes('行動端記帳 App Mockup'), '卡片未包含中文 titleZh');
    expect(text.includes('Mobile Budgeting App Mockup'), '卡片未包含英文 title'); await shot(page, 'sprint1-5-bilingual-card.png');
  });
  await runStep('Test 12 translations JSON integrity', page, async () => {
    verifyTranslationsJson();
    await page.goto(`${BASE_URL}/forma-studio-v2.html`, { waitUntil: 'domcontentloaded' });
    await clickText(page, '提示詞庫');
    await page.locator('text=載入提示詞庫中').waitFor({ state: 'detached', timeout: 15000 }).catch(() => {});
    const translations = translationsJson();
    const expectedTitles = new Set(Object.values(translations.titles || {}));
    const renderedTitles = await page.locator('.prompt-lab-card h3').evaluateAll(nodes => nodes.map(node => node.textContent.trim()));
    const renderedZhCount = renderedTitles.filter(title => expectedTitles.has(title)).length;
    expect(renderedTitles.length === 116, `normalized card 數應為 116，實際 ${renderedTitles.length}`);
    expect(renderedZhCount === 116, `每張卡應有 titleZh，實際 ${renderedZhCount}/116`);
  });
  await runStep('Test 13 schema 3 prompt translations complete', page, async () => {
    verifyTranslationsJson(); const translations = translationsJson();
    const promptValues = Object.values(translations.prompts || {});
    const empty = promptValues.filter(text => !String(text).trim()).length;
    expect(translations.schema_version === 3, 'translations-zh.json schema_version 必須是 3');
    expect(promptValues.length === 116, `prompts count 應為 116，實際 ${promptValues.length}`);
    expect(empty === 0, `prompts 不應有空字串，實際 ${empty}`);
  });
  await runStep('Test 14 collapsed card shows Chinese summary', page, async () => {
    await page.goto(`${BASE_URL}/forma-studio-v2.html`, { waitUntil: 'domcontentloaded' });
    await clickText(page, '提示詞庫');
    await page.locator('text=載入提示詞庫中').waitFor({ state: 'detached', timeout: 15000 }).catch(() => {});
    await page.getByLabel('搜尋提示詞').fill('Japanese Minimalist');
    const card = page.locator('.prompt-lab-card', { hasText: 'Japanese Minimalist Living Room' }).first();
    await card.waitFor({ state: 'visible', timeout: 10000 });
    await card.getByText('寫實渲染日式極簡客廳:橡木地板', { exact: false }).waitFor({ state: 'visible', timeout: 5000 });
    const text = await card.textContent(); expect(text.includes('橡木地板'), '折疊卡片應顯示 summaries[id] 的中文摘要');
    expect(!text.includes('以 photorealistic architectural visualization style 渲染'), '折疊狀態不應直接顯示中文全文'); await shot(page, 'sprint1-6-collapsed-summary.png');
  });
  await runStep('Test 15 search oak Chinese summary keyword', page, async () => {
    const input = page.getByLabel('搜尋提示詞'); await input.fill('橡木');
    await waitText(page, '日式極簡客廳'); const count = await resultCount(page);
    expect(count.visible > 0 && count.visible < 116, `橡木 搜尋結果應小於 116 且大於 0，實際 ${count.visible}`);
    await shot(page, 'sprint1-6-search-oak.png');
  });
  await runStep('Test 16 expanded card shows Chinese full prompt and English original', page, async () => {
    const card = page.locator('.prompt-lab-card', { hasText: 'Japanese Minimalist Living Room' }).first();
    await card.getByText('展開').click();
    await card.getByText('英文原文（可複製）').waitFor({ state: 'visible', timeout: 5000 });
    await card.getByText('以 photorealistic architectural visualization style 渲染一間寧靜的日式極簡客廳', { exact: false }).waitFor({ state: 'visible', timeout: 5000 });
    await card.getByText('Render a serene Japanese minimalist living room interior', { exact: false }).waitFor({ state: 'visible', timeout: 5000 });
    await shot(page, 'sprint1-7-expanded-bilingual.png');
  });
  await runStep('Test 17 copy prompt remains English canonical', page, async () => {
    const english = sourcePromptById('architecture-and-interior-117');
    await page.evaluate(() => {
      Object.defineProperty(navigator, 'clipboard', {
        configurable: true,
        value: {
          writeText: async text => { window.__formaCopiedText = text; },
        },
      });
      window.__formaCopiedText = '';
    });
    const card = page.locator('.prompt-lab-card', { hasText: 'Japanese Minimalist Living Room' }).first();
    await card.getByText('複製 prompt').click();
    await card.getByText('已複製').waitFor({ state: 'visible', timeout: 5000 });
    const copied = await page.evaluate(() => window.__formaCopiedText || '');
    expect(copied === english, '複製 prompt 應完全等於英文原文'); expect(copied.includes('Render a serene Japanese minimalist living room interior'), '複製內容應包含英文 prompt');
    expect(!copied.includes('日式極簡客廳') && !copied.includes('橡木地板'), '複製內容不應包含中文摘要或中文全文');
  });
  await runStep('Test 18 mobile card does not overflow', page, async () => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${BASE_URL}/forma-studio-v2.html`, { waitUntil: 'domcontentloaded' });
    await clickText(page, '提示詞庫');
    await page.locator('text=載入提示詞庫中').waitFor({ state: 'detached', timeout: 15000 }).catch(() => {});
    await page.getByLabel('搜尋提示詞').fill('橡木'); await waitText(page, '日式極簡客廳');
    const card = page.locator('.prompt-lab-card').first(); const box = await card.boundingBox();
    expect(box && box.x >= 0 && box.width <= 390, `mobile 卡片不應溢出 viewport，box=${JSON.stringify(box)}`);
    const bodyWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(bodyWidth <= 390, `mobile 不應有橫向溢出，scrollWidth=${bodyWidth}`);
    await shot(page, 'sprint1-6-1-7-mobile-card.png');
  });
  await page.setViewportSize({ width: 1280, height: 900 });
  await runStep('Test 19 Design Step 4 completion card visible', page, async () => {
    await page.goto(`${BASE_URL}/forma-studio-v2.html`, { waitUntil: 'domcontentloaded' });
    await clickText(page, 'Claude Design'); await page.locator('#dt-step-1 textarea').first().fill('做一張牙科衛教海報，主題是睡眠呼吸與口腔健康');
    await clickText(page, '繼續 → 設定受眾與基調'); await clickText(page, '繼續 → 選擇製圖方式');
    await clickText(page, '社群內容'); await page.locator('#dt-step-3 textarea').first().fill('患者衛教海報，說明睡眠呼吸、磨牙與口腔健康的關係');
    await clickText(page, '繼續 → 設定風格與生成'); await clickText(page, '生成圖像提示詞');
    await waitText(page, '已產出圖像 prompt'); await waitText(page, '這裡產出的是 prompt，不是圖片');
    await waitText(page, '到 Prompt Lab 找參考'); await shot(page, 'sprint1-8-design-step4-card.png');
  });
  await runStep('Test 20 Prompt Lab apply shows Design landingNote', page, async () => {
    await page.goto(`${BASE_URL}/forma-studio-v2.html`, { waitUntil: 'domcontentloaded' });
    await clickText(page, '提示詞庫');
    await page.locator('text=載入提示詞庫中').waitFor({ state: 'detached', timeout: 15000 }).catch(() => {});
    await page.getByLabel('搜尋提示詞').fill('chess');
    const chessCard = page.locator('.prompt-lab-card', { hasText: 'Chess board mid-tournament game' }).first();
    await chessCard.getByText('套用英文 prompt 到 Claude Design', { exact: false }).click();
    await waitText(page, '已從 Prompt Lab 套用英文 prompt'); await waitText(page, '來源：Prompt Lab 提示詞庫');
    const textarea = page.locator('#dt-step-1 textarea').first(); const value = await textarea.inputValue();
    expect(value.toLowerCase().includes('chess board'), 'Design textarea 未預填 chess prompt'); await shot(page, 'sprint1-8-promptlab-landing-note.png');
  });
  await runStep('Test 21 Smart selSub changes next-step actions', page, async () => {
    await page.goto(`${BASE_URL}/forma-studio-v2.html`, { waitUntil: 'domcontentloaded' });
    await clickHeaderTab(page, '智慧製圖'); await page.locator('textarea').first().fill('做一張牙科衛教海報圖片');
    await clickText(page, '確認，生成提示詞'); await waitText(page, '前往 Claude Design 精修');
    await waitText(page, '送去體檢'); await clickText(page, '重新開始');
    await page.locator('textarea').first().fill('把這篇文獻整理成簡報'); await clickText(page, '確認，生成提示詞');
    await waitText(page, '前往 NotebookLM tab 看完整流程'); await waitText(page, 'NotebookLM 任務指令已產出');
    await shot(page, 'sprint1-8-smart-next-actions.png');
  });
  await runStep('Test 22 NotebookLM Step 5 paste order card visible', page, async () => {
    await page.goto(`${BASE_URL}/forma-studio-v2.html`, { waitUntil: 'domcontentloaded' });
    await clickText(page, 'NotebookLM'); await clickText(page, '簡報製作');
    await clickText(page, '口腔醫學'); await clickText(page, 'IMRAD');
    await clickText(page, '產生指令'); await waitText(page, '完成這步：兩段 NotebookLM 指令已產出');
    await waitText(page, '任務指令'); await waitText(page, '自定義指示');
    await shot(page, 'sprint1-8-nlm-step5-order.png');
  });
  await runStep('Test 23 LabTab mode-based next steps change', page, async () => {
    await page.goto(`${BASE_URL}/forma-studio-v2.html`, { waitUntil: 'domcontentloaded' });
    await clickHeaderTab(page, 'Claude Design');
    await page.getByRole('button', { name: /進階實驗工具/ }).first().click();
    await page.waitForTimeout(500);
    await page.getByRole('button', { name: /病毒傳播版/ }).last().click();
    await page.locator('textarea[placeholder*="輸入內容"]').last().fill('睡眠呼吸與牙科衛教簡報'); await clickText(page, '執行實驗');
    await waitText(page, '病毒傳播版已完成'); await waitText(page, '進 NotebookLM');
    await page.getByRole('button', { name: /反 AI Slop 診斷/ }).last().click();
    await page.locator('textarea[placeholder*="輸入內容"]').last().fill('一個紫色漸層卡片式提示詞'); await clickText(page, '執行實驗');
    await waitText(page, '反 AI Slop 診斷已完成'); await waitText(page, '複製診斷結果');
    await waitText(page, '前往 體檢 & 增強');
    const visibleButtons = await page.locator('button:visible').evaluateAll(nodes => nodes.map(n => n.textContent.trim()));
    expect(!visibleButtons.some(text => /StyleStudio/.test(text)), `Lab anti 不應顯示 StyleStudio button：${visibleButtons.join(' | ')}`);
    await shot(page, 'sprint1-8-lab-mode-next.png');
  });
  await runStep('Test 24 BrandPane 5-dimension helper visible', page, async () => {
    await page.goto(`${BASE_URL}/forma-studio-v2.html`, { waitUntil: 'domcontentloaded' });
    await clickText(page, 'Claude Design'); await clickText(page, '品牌與評審');
    await clickText(page, '5 維度評審'); await waitText(page, '5 維度評審說明');
    await waitText(page, '自評起點，不是 AI 最終品質保證'); await waitText(page, '哲學一致性');
    await shot(page, 'sprint1-8-brand-helper.png');
  });
  await runStep('Test 25 StyleStudio tab exists while Audit is unlocked', page, async () => {
    await page.goto(`${BASE_URL}/forma-studio-v2.html`, { waitUntil: 'domcontentloaded' });
    await waitText(page, '體檢 & 增強'); await waitText(page, '風格實驗室');
    for (const label of ['Claude Design', 'NotebookLM', '智慧製圖', '提示詞庫', '設定']) {
      await clickText(page, label);
      await page.waitForTimeout(100);
      const buttons = await page.locator('button:visible').evaluateAll(nodes => nodes.map(n => n.textContent.trim()));
      expect(!buttons.some(text => /StyleStudio/.test(text)), `${label} 不應出現未中文化 StyleStudio button：${buttons.join(' | ')}`);
    }
  });
  await runStep('Test 26 Audit tab visible and clickable in seven-tab workflow', page, async () => {
    await page.goto(`${BASE_URL}/forma-studio-v2.html`, { waitUntil: 'domcontentloaded' });
    const tabs = await page.locator('header .border-t button').evaluateAll(nodes => nodes.map(n => n.textContent.trim()));
    expect(tabs.length === 7, `v2 應有 6 個主 tab + 設定入口，實際 ${tabs.length}：${tabs.join(' | ')}`);
    expect(tabs[4].includes('體檢 & 增強'), `第 5 個顯示位置應為 Audit，實際 ${tabs[4]}`);
    expect(tabs[5].includes('風格實驗室'), `第 6 個顯示位置應為 StyleStudio，實際 ${tabs[5]}`);
    expect(tabs[6].includes('設定'), `第 7 個顯示位置應為 Settings，實際 ${tabs[6]}`);
    await clickText(page, '體檢 & 增強'); await waitText(page, 'prompt 健檢工具');
    await waitText(page, '這個 tab 是做什麼的'); await shot(page, 'sprint2-audit-tab.png');
  });
  await runStep('Test 27 Audit prompt input shows 8 dimensions and score', page, async () => {
    await clickText(page, '體檢 & 增強'); const auditPrompt = 'Design a patient education poster for O2Win Dental for adult patients after implant surgery. Core message: good aftercare reduces swelling and infection risk. Use clean composition, strong visual hierarchy, crisp typography, white and teal palette, soft clinic lighting, portrait 1024x1536, production-quality. Include in-image text "植牙術後照護", "冰敷 24 小時", "按時回診". No fake logos, no generic card walls. Source: original clinic brief.';
    const textarea = page.locator('main textarea').first(); await textarea.fill(auditPrompt);
    await clickText(page, '開始體檢'); await waitText(page, 'Score');
    await waitText(page, 'Grade');
    for (const label of ['任務意圖', '受眾與情境', '核心訊息', '構圖 / 版面 / 色彩', 'in-image 文字', 'size / quality / 反 negative', '反 AI Slop', 'Source attribution']) {
      await waitText(page, label);
    }
    const dimensionRows = await page.locator('main button').filter({ hasText: /任務意圖|受眾與情境|核心訊息|構圖 \/ 版面 \/ 色彩|in-image 文字|size \/ quality \/ 反 negative|反 AI Slop|Source attribution/ }).count();
    expect(dimensionRows >= 8, `Audit 維度列應至少 8，實際 ${dimensionRows}`);
    await shot(page, 'sprint2-audit-8-dimensions.png');
  });
  await runStep('Test 28 Audit grade label appears A-F', page, async () => {
    await clickText(page, '體檢 & 增強'); const gradeText = await page.locator('main').textContent();
    expect(/Grade\s*[ABCDF]/.test(gradeText.replace(/\s+/g, ' ')) || /\b[ABCDF]\b/.test(gradeText), 'Audit 結果應顯示 A/B/C/D/F grade'); await waitText(page, 'Grade');
  });
  await runStep('Test 29 AI enhance button visible and click-safe without API key', page, async () => {
    await clickText(page, '體檢 & 增強');
    const btn = page.getByRole('button', { name: /AI 增強/ }).first();
    await btn.waitFor({ state: 'visible', timeout: 5000 });
    await btn.click(); await waitText(page, '需先在右上角');
    await shot(page, 'sprint2-audit-enhance-button.png');
  });
  await runStep('Test 30 Sprint 1.8 hidden Audit actions are now visible', page, async () => {
    await page.goto(`${BASE_URL}/forma-studio-v2.html`, { waitUntil: 'domcontentloaded' });
    await clickHeaderTab(page, '智慧製圖'); await page.locator('textarea').first().fill('做一張牙科衛教海報圖片');
    await clickText(page, '確認，生成提示詞'); await waitText(page, '送去體檢');
    await page.getByRole('button', { name: /送去體檢/ }).last().click();
    await waitText(page, '體檢 & 增強'); await waitText(page, 'Score');
    // 重新載入清掉 landingNote banner（避免覆蓋 Claude Design tab click）
    await page.goto(`${BASE_URL}/forma-studio-v2.html`, { waitUntil: 'domcontentloaded' });
    await clickHeaderTab(page, 'Claude Design');
    await page.getByRole('button', { name: /進階實驗工具/ }).first().click();
    await page.waitForTimeout(500);
    await page.getByRole('button', { name: /反 AI Slop 診斷/ }).last().click();
    await page.locator('textarea[placeholder*="輸入內容"]').last().fill('一個 purple gradient generic card wall poster'); await clickText(page, '執行實驗');
    await waitText(page, '前往 體檢 & 增強'); await shot(page, 'sprint2-audit-actions-unlocked.png');
  });
  await runStep('Test 31 Audit onboarding card, weak sample, and neutral placeholder', page, async () => {
    await page.goto(`${BASE_URL}/forma-studio-v2.html`, { waitUntil: 'domcontentloaded' });
    await clickText(page, '體檢 & 增強'); await waitText(page, '這個 tab 是做什麼的');
    await waitText(page, '弱例'); await waitText(page, 'stunning');
    const placeholder = await page.locator('main textarea').first().getAttribute('placeholder');
    expect(placeholder.includes('AURORA CAFE') && placeholder.includes('Opening 12.15'), `placeholder 應為通用咖啡店情境，實際 ${placeholder}`);
    await shot(page, 'sprint2-audit-onboarding.png');
  });
  await runStep('Test 32 seventh workflow includes Style Studio tab visible and clickable', page, async () => {
    await page.goto(`${BASE_URL}/forma-studio-v2.html`, { waitUntil: 'domcontentloaded' });
    const tabs = await page.locator('header .border-t button').evaluateAll(nodes => nodes.map(n => n.textContent.trim()));
    expect(tabs.length === 7, `應有 6 個主 tab + 設定入口，實際 ${tabs.length}：${tabs.join(' | ')}`);
    expect(tabs.slice(0, 6).join(' | ') === '🖼️ 智慧製圖 | 🎨 Claude Design | 📑 NotebookLM | 📚 提示詞庫 | 🩺 體檢 & 增強 | 🎬 風格實驗室' && tabs[6].includes('設定'), `tab 順序不符：${tabs.join(' | ')}`);
    await page.locator('header button', { hasText: '風格實驗室' }).first().click();
    await waitText(page, '🎬 風格實驗室'); await waitText(page, '5 類別 + 風格 chips');
    await shot(page, 'sprint3-style-tab-visible.png');
  });
  await runStep('Test 33 Style Studio shows five category chips', page, async () => {
    await page.goto(`${BASE_URL}/forma-studio-v2.html`, { waitUntil: 'domcontentloaded' });
    await page.locator('header button', { hasText: '風格實驗室' }).first().click();
    for (const label of ['人像 / 商業攝影', '海報 / 插畫', 'UI / 產品介面', '角色 / 吉祥物', '醫學圖解 / 衛教']) {
      await waitText(page, label);
    }
    const categoryButtons = await page.locator('main button').filter({ hasText: /人像 \/ 商業攝影|海報 \/ 插畫|UI \/ 產品介面|角色 \/ 吉祥物|醫學圖解 \/ 衛教/ }).count();
    expect(categoryButtons === 5, `Style Studio 類別應為 5，實際 ${categoryButtons}`);
    await waitText(page, '極簡留白'); await waitText(page, '薄荷奶油');
    await shot(page, 'sprint3-style-categories.png');
  });
  await runStep('Test 34 selecting chips updates composed English prompt', page, async () => {
    await page.goto(`${BASE_URL}/forma-studio-v2.html`, { waitUntil: 'domcontentloaded' });
    await page.locator('header button', { hasText: '風格實驗室' }).first().click();
    await page.locator('main input').first().fill('Dental clinic patient education poster about implant aftercare'); await clickText(page, '瑞士國際風');
    await clickText(page, '薄荷奶油'); const prompt = await page.locator('main textarea[readonly]').first().inputValue();
    expect(prompt.includes('Editorial poster design featuring Dental clinic patient education poster about implant aftercare'), '英文 prompt 未包含 subject 與 category lead-in'); expect(prompt.includes('Swiss International style'), '英文 prompt 未包含瑞士國際風英文片段');
    expect(prompt.includes('soft mint green and warm cream palette'), '英文 prompt 未包含薄荷奶油英文片段'); expect(prompt.includes('no generic card walls'), '英文 prompt 未包含 negative prompt');
    await shot(page, 'sprint3-style-prompt-composed.png');
  });
  await runStep('Test 35 size and quality pickers are usable', page, async () => {
    await page.goto(`${BASE_URL}/forma-studio-v2.html`, { waitUntil: 'domcontentloaded' });
    await page.locator('header button', { hasText: '風格實驗室' }).first().click();
    await clickText(page, '3:2 橫式'); await clickText(page, 'medium');
    const prompt = await page.locator('main textarea[readonly]').first().inputValue(); expect(prompt.includes('1536x1024'), '英文 prompt 未包含 3:2 尺寸');
    expect(prompt.includes('high quality, sharp details'), '英文 prompt 未包含 medium 品質英文'); await waitText(page, '≈ $0.04');
    await shot(page, 'sprint3-style-size-quality.png');
  });
  await runStep('Test 36 Style Studio applies to Claude Design through landingNote bridge', page, async () => {
    await page.goto(`${BASE_URL}/forma-studio-v2.html`, { waitUntil: 'domcontentloaded' });
    await page.locator('header button', { hasText: '風格實驗室' }).first().click();
    await page.locator('main input').first().fill('Mobile app dashboard for dental clinic operations'); await clickText(page, 'UI / 產品介面');
    await clickText(page, 'Web 桌面'); await clickText(page, '金融科技');
    await page.getByRole('button', { name: /套用到 Claude Design/ }).last().click();
    await waitText(page, '已套用風格實驗室組好的英文 prompt'); await waitText(page, '來源：風格實驗室');
    const textarea = page.locator('#dt-step-1 textarea').first(); const value = await textarea.inputValue();
    expect(value.includes('Polished UI mockup of Mobile app dashboard for dental clinic operations'), 'Design textarea 未收到 Style Studio prompt'); expect(value.includes('desktop web browser frame'), 'Design textarea 未包含 Style Studio chip 英文片段');
    await shot(page, 'sprint3-style-apply-design.png');
  });
  await runStep('Test 37 Sprint 1.8 hidden StyleStudio actions are now unlocked', page, async () => {
    await page.goto(`${BASE_URL}/forma-studio-v2.html`, { waitUntil: 'domcontentloaded' });
    await clickText(page, 'Claude Design'); await page.locator('#dt-step-1 textarea').first().fill('做一張牙科衛教海報，主題是植牙術後照護');
    await clickText(page, '繼續 → 設定受眾與基調'); await clickText(page, '繼續 → 選擇製圖方式');
    await clickText(page, '社群內容'); await page.locator('#dt-step-3 textarea').first().fill('患者衛教海報，說明植牙術後照護');
    await clickText(page, '繼續 → 設定風格與生成'); await waitText(page, '開啟風格實驗室');
    await clickText(page, '開啟風格實驗室'); await waitText(page, '🎬 風格實驗室');
    await page.getByRole('button', { name: /送去體檢/ }).last().click();
    await waitText(page, '體檢 & 增強'); await waitText(page, 'Score');
    await shot(page, 'sprint3-style-actions-unlocked.png');
  });
  await runStep('Test 38 lastTab persists across reload', page, async () => {
    const iso = await newIsolatedPage(browser);
    try {
      await iso.page.goto(`${BASE_URL}/forma-studio-v2.html`, { waitUntil: 'domcontentloaded' });
      await iso.page.locator('header button', { hasText: '風格實驗室' }).first().click();
      await waitText(iso.page, '5 類別 + 風格 chips');
      await iso.page.reload({ waitUntil: 'domcontentloaded' });
      await waitText(iso.page, '5 類別 + 風格 chips');
      const active = await iso.page.locator('header .tab-on').first().textContent();
      expect(active.includes('風格實驗室'), `reload 後 active tab 應為風格實驗室，實際 ${active}`);
      await shot(iso.page, 'sprint4-last-tab-persist.png');
    } finally {
      await iso.context.close();
    }
  });
  await runStep('Test 39 Prompt Lab favorite persists across reload', page, async () => {
    const iso = await newIsolatedPage(browser);
    try {
      await iso.page.goto(`${BASE_URL}/forma-studio-v2.html`, { waitUntil: 'domcontentloaded' });
      await iso.page.locator('header button', { hasText: '提示詞庫' }).first().click();
      await iso.page.locator('text=載入提示詞庫中').waitFor({ state: 'detached', timeout: 15000 }).catch(() => {});
      await iso.page.locator('article').first().waitFor({ state: 'visible', timeout: 15000 });
      const firstTitle = await iso.page.locator('article h3').first().textContent();
      await iso.page.locator('article button[title="加入收藏"]').first().click();
      const stored = await iso.page.evaluate(() => localStorage.getItem('forma-v2.plab.favorites'));
      expect(stored && stored.includes('ids'), '收藏未寫入 forma-v2.plab.favorites');
      await iso.page.reload({ waitUntil: 'domcontentloaded' });
      await iso.page.locator('text=載入提示詞庫中').waitFor({ state: 'detached', timeout: 15000 }).catch(() => {});
      await iso.page.getByRole('button', { name: /只看收藏/ }).first().click();
      await waitText(iso.page, firstTitle.trim().slice(0, 8));
      const count = await resultCount(iso.page);
      expect(count.visible === 1, `只看收藏應命中 1 筆，實際 ${count.visible}`);
      await shot(iso.page, 'sprint4-promptlab-favorite-persist.png');
    } finally {
      await iso.context.close();
    }
  });
  await runStep('Test 40 Style Studio selection persists across reload', page, async () => {
    const iso = await newIsolatedPage(browser);
    try {
      await iso.page.goto(`${BASE_URL}/forma-studio-v2.html`, { waitUntil: 'domcontentloaded' });
      await iso.page.locator('header button', { hasText: '風格實驗室' }).first().click();
      await clickText(iso.page, 'UI / 產品介面');
      await iso.page.locator('main input').first().fill('Dental analytics desktop dashboard');
      await clickText(iso.page, 'Web 桌面');
      await clickText(iso.page, 'medium');
      const stored = await iso.page.evaluate(() => localStorage.getItem('forma-v2.style.last-state'));
      expect(stored && stored.includes('Dental analytics desktop dashboard'), 'Style state 未寫入 localStorage');
      await iso.page.reload({ waitUntil: 'domcontentloaded' });
      await waitText(iso.page, '5 類別 + 風格 chips');
      const inputValue = await iso.page.locator('main input').first().inputValue();
      const prompt = await iso.page.locator('main textarea[readonly]').first().inputValue();
      expect(inputValue === 'Dental analytics desktop dashboard', `Style subject 未還原：${inputValue}`);
      expect(prompt.includes('Polished UI mockup of Dental analytics desktop dashboard'), 'Style 類別或 subject 未還原到 prompt');
      expect(prompt.includes('desktop web browser frame'), 'Style chip 未還原');
      expect(prompt.includes('high quality, sharp details'), 'Style quality 未還原');
      await shot(iso.page, 'sprint4-style-state-persist.png');
    } finally {
      await iso.context.close();
    }
  });
  await runStep('Test 41 Audit history persists across reload', page, async () => {
    const iso = await newIsolatedPage(browser);
    try {
      await iso.page.goto(`${BASE_URL}/forma-studio-v2.html`, { waitUntil: 'domcontentloaded' });
      await iso.page.locator('header button', { hasText: '體檢 & 增強' }).first().click();
      const prompt = 'Design a crisp portrait poster for dental implant aftercare patients, with in-image text "植牙術後照護", "冰敷 24 小時", and "按時回診". Use a clean white and teal clinic palette, structured layout, clear hierarchy, portrait 1024x1536, production-quality typography, no fake logos, no generic card walls. Source: internal QA test.';
      await iso.page.locator('main textarea').first().fill(prompt);
      await iso.page.getByRole('button', { name: /開始體檢|重新體檢/ }).first().click();
      // 等 audit useEffect 寫入 localStorage（非同步 React state → effect）
      await iso.page.waitForFunction(
        () => {
          const v = localStorage.getItem('forma-v2.audit.history');
          return v && v.includes('implant aftercare');
        },
        { timeout: 10000 }
      );
      const stored = await iso.page.evaluate(() => localStorage.getItem('forma-v2.audit.history'));
      expect(stored && stored.includes('implant aftercare'), 'Audit history 未寫入 localStorage');
      await iso.page.reload({ waitUntil: 'domcontentloaded' });
      await waitText(iso.page, 'prompt 健檢工具');
      await iso.page.getByRole('button', { name: /體檢歷史/ }).first().click();
      await waitText(iso.page, '最近 10 筆體檢');
      await waitText(iso.page, 'implant aftercare');
      await shot(iso.page, 'sprint4-audit-history-persist.png');
    } finally {
      await iso.context.close();
    }
  });
  await runStep('Test 42 SettingsPanel entry and clear-all flow are clickable', page, async () => {
    const iso = await newIsolatedPage(browser);
    try {
      await iso.page.goto(`${BASE_URL}/forma-studio-v2.html`, { waitUntil: 'domcontentloaded' });
      await iso.page.locator('header button', { hasText: '⚙️ 設定' }).first().click();
      await waitText(iso.page, 'v2 設定');
      await waitText(iso.page, '本地持久化狀態');
      await iso.page.getByRole('button', { name: /我要清除所有 v2 本地資料/ }).click();
      await waitText(iso.page, '確認清除全部');
      iso.page.once('dialog', dialog => dialog.dismiss());
      await iso.page.getByRole('button', { name: '確認清除全部' }).click();
      await shot(iso.page, 'sprint4-settings-panel-clear-all.png');
    } finally {
      await iso.context.close();
    }
  });
  await runStep('Test 43 Phase C top-level tabs are B-lite structure plus Settings', page, async () => {
    await page.goto(`${BASE_URL}/forma-studio-v2.html`, { waitUntil: 'domcontentloaded' });
    const tabs = await page.locator('header .border-t button').evaluateAll(nodes => nodes.map(n => n.textContent.trim()));
    expect(tabs.length === 7, `應為 6 個主 tab + 設定入口，實際 ${tabs.length}：${tabs.join(' | ')}`);
    expect(tabs.slice(0, 6).join(' | ') === '🖼️ 智慧製圖 | 🎨 Claude Design | 📑 NotebookLM | 📚 提示詞庫 | 🩺 體檢 & 增強 | 🎬 風格實驗室', `Phase C tab 順序不符：${tabs.join(' | ')}`);
    expect(tabs[6].includes('設定'), `最後入口應為設定：${tabs[6]}`);
  });
  await runStep('Test 44 Phase C default landing is Smart', page, async () => {
    const iso = await newIsolatedPage(browser);
    try {
      await iso.page.goto(`${BASE_URL}/forma-studio-v2.html`, { waitUntil: 'domcontentloaded' });
      const active = await iso.page.locator('header .border-t button.tab-on').first().textContent();
      expect(active.includes('智慧製圖'), `預設首頁應為 Smart，實際 ${active}`);
      await waitText(iso.page, '說明您要做什麼');
    } finally {
      await iso.context.close();
    }
  });
  await runStep('Test 45 Phase C Claude Design contains advanced Lab drawer and slide subflow', page, async () => {
    await page.goto(`${BASE_URL}/forma-studio-v2.html`, { waitUntil: 'domcontentloaded' });
    await clickText(page, 'Claude Design'); await clickText(page, '進階實驗工具');
    await waitText(page, '彩蛋 Lab'); await waitText(page, '病毒傳播版');
    await clickText(page, '投影片簡報'); await waitText(page, 'PPT Flow Lite');
  });
  await runStep('Test 46 Phase C neutral copy replaces dental onboarding defaults', page, async () => {
    await page.goto(`${BASE_URL}/forma-studio-v2.html`, { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => {
      localStorage.removeItem('forma-v2.last-tab');
      localStorage.removeItem('forma-v2.style.last-state');
    });
    await page.goto(`${BASE_URL}/forma-studio-v2.html`, { waitUntil: 'domcontentloaded' });
    await clickHeaderTab(page, '體檢 & 增強'); const placeholder = await page.locator('main textarea').first().getAttribute('placeholder');
    expect(placeholder.includes('AURORA CAFE') && !placeholder.includes('O2Win Dental'), `Audit placeholder 未去醫療化：${placeholder}`);
    await clickHeaderTab(page, '風格實驗室'); const styleInput = await page.locator('main input').first().inputValue();
    expect(styleInput.includes('AURORA CAFE') || styleInput.includes('Coffee shop'), `Style Studio 預設應為咖啡店通用 demo：${styleInput}`);
  });
  await runStep('Test 47 Phase C Truly-Neutral subject_terms does not force medical domain', page, async () => {
    await page.goto(`${BASE_URL}/forma-studio-v2.html`, { waitUntil: 'domcontentloaded' });
    await clickHeaderTab(page, '智慧製圖'); await page.locator('textarea[placeholder*="補充說明"]').first().fill('製作紫微斗數入門課程的 10 頁簡報');
    await waitText(page, '抽取主題詞'); const body = await page.locator('body').innerText();
    expect(body.includes('紫微斗數') && body.includes('不歸類領域'), 'Smart 應顯示 subject_terms 中性判斷'); expect(!body.includes('領域自動選「口腔醫學」'), 'Smart 不應強制歸類口腔醫學');
  });
  await runStep('Test 48 Phase C PPT Flow Lite shows seven planning blocks', page, async () => {
    await page.goto(`${BASE_URL}/forma-studio-v2.html`, { waitUntil: 'domcontentloaded' });
    await clickHeaderTab(page, '智慧製圖'); await page.locator('textarea[placeholder*="補充說明"]').first().fill('咖啡店開幕宣傳簡報，給附近居民看');
    await waitText(page, '簡報製作'); await clickText(page, '確認，生成提示詞');
    for (const label of ['PPT Flow Lite', '任務摘要', '3 套風格方案', 'AI 反問清單', '素材引用清單', 'Markdown 大綱', '完整 deck prompt', '下一步工具建議']) {
      await waitText(page, label);
    }
  });
  await runStep('Test 49 Phase C Smart triggers PPT Flow condition path', page, async () => {
    await page.goto(`${BASE_URL}/forma-studio-v2.html`, { waitUntil: 'domcontentloaded' });
    await clickHeaderTab(page, '智慧製圖'); await page.locator('textarea[placeholder*="補充說明"]').first().fill('幫我做 8 頁產品發表 PPT');
    await waitText(page, '任務：簡報製作'); await clickText(page, '確認，生成提示詞');
    await waitText(page, 'PPT Flow Lite'); await waitText(page, '瀏覽器版不直接生成 PPTX 檔');
  });
  await runStep('Test 50 Phase C NotebookLM triggers PPT Flow condition path', page, async () => {
    await page.goto(`${BASE_URL}/forma-studio-v2.html`, { waitUntil: 'domcontentloaded' });
    await clickText(page, 'NotebookLM'); await clickText(page, '簡報製作');
    await clickText(page, '自訂領域'); await page.locator('input[placeholder*=\"中文系教授\"]').fill('咖啡店開幕企劃');
    await clickText(page, '確認'); await clickText(page, 'GUIDE');
    await clickText(page, '產生指令'); await waitText(page, 'PPT Flow Lite');
    await waitText(page, '來源：NotebookLM');
  });
  await runStep('Test 51 C1 Smart shows four glow blocks simultaneously', page, async () => {
    await page.goto(`${BASE_URL}/forma-studio-v2.html`, { waitUntil: 'domcontentloaded' });
    await clickHeaderTab(page, '智慧製圖');
    for (const label of ['說明需求', '確認 AI 建議', '選擇下一步', '輸出 prompt']) {
      await waitText(page, label);
    }
    for (const id of ['#smart-step-1', '#smart-step-2', '#smart-step-3', '#smart-step-4']) {
      await page.locator(id).waitFor({ state: 'visible', timeout: 10000 });
    }
    const c1 = await page.locator('#smart-step-1').getAttribute('class'); const c2 = await page.locator('#smart-step-2').getAttribute('class');
    const c3 = await page.locator('#smart-step-3').getAttribute('class'); const c4 = await page.locator('#smart-step-4').getAttribute('class');
    expect(c1.includes('glow-active'), `Step 1 應為 active glow：${c1}`);
    expect(c2.includes('step-future') && c3.includes('step-future') && c4.includes('step-future'), `Step 2-4 應為 future：${[c2,c3,c4].join(' | ')}`);
    await shot(page, 'c1-smart-four-blocks.png');
  });
  await runStep('Test 52 C1 Smart textarea advances to Step 2 active glow', page, async () => {
    await page.goto(`${BASE_URL}/forma-studio-v2.html`, { waitUntil: 'domcontentloaded' });
    await clickHeaderTab(page, '智慧製圖'); await page.locator('textarea[placeholder*="補充說明"]').first().fill('製作紫微斗數入門課程的 10 頁簡報');
    await waitText(page, '抽取主題詞'); const c1 = await page.locator('#smart-step-1').getAttribute('class');
    const c2 = await page.locator('#smart-step-2').getAttribute('class');
    expect(c1.includes('step-dimmed'), `Step 1 應變 done/dimmed：${c1}`);
    expect(c2.includes('glow-active'), `Step 2 應為 active glow：${c2}`);
    await shot(page, 'c1-step2-active.png');
  });
  await runStep('Test 53 C2 Step 2 shows recommended next route', page, async () => {
    await page.goto(`${BASE_URL}/forma-studio-v2.html`, { waitUntil: 'domcontentloaded' });
    await clickHeaderTab(page, '智慧製圖'); await page.locator('textarea[placeholder*="補充說明"]').first().fill('做一張咖啡店開幕 A4 海報圖片');
    await waitText(page, '推薦下一步路徑'); await waitText(page, '進 Claude Design 精修');
    await waitText(page, '推薦進 Claude Design 精修');
  });
  await runStep('Test 54 C2 Step 3 shows four action cards', page, async () => {
    await page.goto(`${BASE_URL}/forma-studio-v2.html`, { waitUntil: 'domcontentloaded' });
    await clickHeaderTab(page, '智慧製圖'); await page.locator('textarea[placeholder*="補充說明"]').first().fill('把這篇文獻整理成簡報');
    await waitText(page, '推薦下一步路徑'); await clickText(page, '確認，生成提示詞');
    const c3 = await page.locator('#smart-step-3').getAttribute('class');
    expect(c3.includes('glow-active'), `Step 3 應為 active glow：${c3}`);
    for (const label of ['直接複製', '進 Claude Design 精修', '進 NotebookLM 完整 5 step', '送完整體檢']) {
      const btn = page.getByRole('button', { name: new RegExp(label) }).first();
      await btn.waitFor({ state: 'visible', timeout: 10000 });
      expect(await btn.isEnabled(), `${label} 應可點`);
    }
    await shot(page, 'c2-step3-actions.png');
  });
  await runStep('Test 55 C2 direct copy activates Step 4 success', page, async () => {
    await page.goto(`${BASE_URL}/forma-studio-v2.html`, { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => {
      Object.defineProperty(navigator, 'clipboard', {
        configurable: true,
        value: { writeText: async text => { window.__formaSmartCopied = text; } },
      });
      window.__formaSmartCopied = '';
    });
    await clickHeaderTab(page, '智慧製圖'); await page.locator('textarea[placeholder*="補充說明"]').first().fill('做一張咖啡店開幕海報');
    await waitText(page, '推薦下一步路徑'); await clickText(page, '確認，生成提示詞');
    await page.getByRole('button', { name: /直接複製/ }).first().click();
    await waitText(page, '複製成功'); const c4 = await page.locator('#smart-step-4').getAttribute('class');
    expect(c4.includes('glow-active'), `Step 4 應為 active glow：${c4}`);
    const copied = await page.evaluate(() => window.__formaSmartCopied || '');
    expect(copied.includes('Prompt') || copied.includes('指令'), '直接複製應寫入 prompt 文字'); await shot(page, 'c2-direct-copy-step4.png');
  });
  await runStep('Test 56 C2 Claude Design action switches tab with landingNote', page, async () => {
    await page.goto(`${BASE_URL}/forma-studio-v2.html`, { waitUntil: 'domcontentloaded' });
    await clickHeaderTab(page, '智慧製圖'); await page.locator('textarea[placeholder*="補充說明"]').first().fill('做一張咖啡店開幕海報圖片');
    await waitText(page, '推薦下一步路徑'); await clickText(page, '確認，生成提示詞');
    await page.getByRole('button', { name: /進 Claude Design 精修/ }).first().click();
    await waitText(page, '已從 Smart 帶入 prompt'); await waitText(page, '來源：Smart 智慧製圖');
    const active = await page.locator('header .tab-on').first().textContent();
    expect(active.includes('Claude Design'), `應切到 Design tab，實際 ${active}`);
    const value = await page.locator('#dt-step-1 textarea').first().inputValue(); expect(value.includes('咖啡店') || value.includes('圖像生成 Prompt'), 'Design textarea 應收到 Smart prompt');
    await shot(page, 'c2-design-landing-note.png');
  });
  await runStep('Test 57 C2 NotebookLM action switches tab with landingNote', page, async () => {
    await page.goto(`${BASE_URL}/forma-studio-v2.html`, { waitUntil: 'domcontentloaded' });
    await clickHeaderTab(page, '智慧製圖'); await page.locator('textarea[placeholder*="補充說明"]').first().fill('把這篇文獻整理成 10 頁簡報');
    await waitText(page, '推薦下一步路徑'); await clickText(page, '確認，生成提示詞');
    await page.getByRole('button', { name: /進 NotebookLM 完整 5 step/ }).first().click();
    await waitText(page, '已從 Smart 建議進 NotebookLM 完整流程'); await waitText(page, '來源：Smart 智慧製圖');
    const active = await page.locator('header .tab-on').first().textContent();
    expect(active.includes('NotebookLM'), `應切到 NLM tab，實際 ${active}`);
    await shot(page, 'c2-nlm-landing-note.png');
  });
  await runStep('Test 58 C2 Audit action switches tab with landingNote', page, async () => {
    await page.goto(`${BASE_URL}/forma-studio-v2.html`, { waitUntil: 'domcontentloaded' });
    await clickHeaderTab(page, '智慧製圖'); await page.locator('textarea[placeholder*="補充說明"]').first().fill('做一張產品發表海報 prompt，要求清楚文字與版面');
    await waitText(page, '推薦下一步路徑'); await clickText(page, '確認，生成提示詞');
    await page.getByRole('button', { name: /送完整體檢/ }).first().click();
    await waitText(page, '來自Smart 智慧製圖的 prompt'); await waitText(page, '來源：Smart 智慧製圖');
    await waitText(page, 'Score'); const active = await page.locator('header .tab-on').first().textContent();
    expect(active.includes('體檢 & 增強'), `應切到 Audit tab，實際 ${active}`);
    await shot(page, 'c2-audit-landing-note.png');
  });
  await runStep('Test 59 C3 Smart quick audit section exists collapsed', page, async () => {
    await page.goto(`${BASE_URL}/forma-studio-v2.html`, { waitUntil: 'domcontentloaded' });
    await clickHeaderTab(page, '智慧製圖'); const section = page.locator('#smart-quick-audit');
    await section.waitFor({ state: 'visible', timeout: 10000 });
    await expect(await section.getByText('⚡ 快速體檢').count() === 1, '快速體檢段應存在');
    const scoreVisible = await section.getByText('Score', { exact: true }).isVisible().catch(() => false);
    expect(!scoreVisible, '快速體檢預設應折疊，不顯示 Score');
  });
  await runStep('Test 60 C3 expand quick audit shows score grade pass fixes', page, async () => {
    await page.goto(`${BASE_URL}/forma-studio-v2.html`, { waitUntil: 'domcontentloaded' });
    await clickHeaderTab(page, '智慧製圖'); await page.locator('textarea[placeholder*="補充說明"]').first().fill('做一張產品發表海報 prompt，要求清楚文字、版面、尺寸與受眾');
    await waitText(page, '推薦下一步路徑'); await clickText(page, '確認，生成提示詞');
    await page.locator('#smart-quick-audit').getByRole('button', { name: /快速體檢/ }).click();
    await page.locator('#smart-quick-audit').getByText('Score', { exact: true }).waitFor({ state: 'visible', timeout: 10000 });
    await page.locator('#smart-quick-audit').getByText('Grade', { exact: true }).waitFor({ state: 'visible', timeout: 10000 });
    await waitText(page, '3 通過'); await waitText(page, '3 補強');
    await shot(page, 'c3-quick-audit-expanded.png');
  });
  await runStep('Test 61 C3 apply quick fixes mutates Smart textarea', page, async () => {
    await page.goto(`${BASE_URL}/forma-studio-v2.html`, { waitUntil: 'domcontentloaded' });
    await clickHeaderTab(page, '智慧製圖'); const smartTextarea = page.locator('textarea[placeholder*="補充說明"]').first();
    await smartTextarea.fill('做一張產品海報'); await waitText(page, '推薦下一步路徑');
    await clickText(page, '確認，生成提示詞'); const before = await smartTextarea.inputValue();
    await page.locator('#smart-quick-audit').getByRole('button', { name: /快速體檢/ }).click();
    await page.getByRole('button', { name: /^套用補強$/ }).click();
    const after = await smartTextarea.inputValue(); expect(after.length > before.length, '套用補強後 Smart textarea 內容應變長');
    expect(after.includes('快速體檢補強'), 'textarea 應包含快速體檢補強區塊');
  });
  await runStep('Test 62 C3 send full Audit from quick audit switches tab', page, async () => {
    await page.goto(`${BASE_URL}/forma-studio-v2.html`, { waitUntil: 'domcontentloaded' });
    await clickHeaderTab(page, '智慧製圖'); await page.locator('textarea[placeholder*="補充說明"]').first().fill('做一張課程招生海報，包含清楚標題、受眾與尺寸');
    await waitText(page, '推薦下一步路徑'); await clickText(page, '確認，生成提示詞');
    await page.locator('#smart-quick-audit').getByRole('button', { name: /快速體檢/ }).click();
    await page.getByRole('button', { name: /^送完整 Audit$/ }).click();
    await waitText(page, '來源：Smart 智慧製圖'); const active = await page.locator('header .tab-on').first().textContent();
    expect(active.includes('體檢 & 增強'), `應切到 Audit tab，實際 ${active}`);
  });
  await runStep('Test 63 C4 Smart Step 1 shows 6-8 Prompt Lab chips', page, async () => {
    await page.goto(`${BASE_URL}/forma-studio-v2.html`, { waitUntil: 'domcontentloaded' });
    await clickHeaderTab(page, '智慧製圖');
    await page.locator('.smart-gallery-chip').first().waitFor({ state: 'visible', timeout: 15000 });
    const count = await page.locator('.smart-gallery-chip').count();
    expect(count >= 6 && count <= 8, `Prompt Lab chips 應為 6-8 個，實際 ${count}`);
    await waitText(page, '快速範例 chips');
  });
  await runStep('Test 64 C4 clicking Prompt Lab chip fills Smart textarea', page, async () => {
    await page.goto(`${BASE_URL}/forma-studio-v2.html`, { waitUntil: 'domcontentloaded' });
    await clickHeaderTab(page, '智慧製圖'); const chip = page.locator('.smart-gallery-chip').first();
    await chip.waitFor({ state: 'visible', timeout: 15000 });
    await chip.click(); const value = await page.locator('textarea[placeholder*="補充說明"]').first().inputValue();
    expect(value.length > 80, `chip 應填入 prompt 全文，實際長度 ${value.length}`);
    expect(/design|create|generate|poster|mockup|photo|prompt/i.test(value), 'chip 填入內容應像 prompt 全文');
  });
  await runStep('Test 65 C4 Smart Step 4 shows 3-6 similar examples', page, async () => {
    await page.goto(`${BASE_URL}/forma-studio-v2.html`, { waitUntil: 'domcontentloaded' });
    await clickHeaderTab(page, '智慧製圖'); await page.locator('textarea[placeholder*="補充說明"]').first().fill('做一張咖啡店開幕海報，溫暖編輯風，直式');
    await waitText(page, '推薦下一步路徑'); await clickText(page, '確認，生成提示詞');
    await page.locator('#smart-similar-examples article').first().waitFor({ state: 'visible', timeout: 15000 });
    const count = await page.locator('#smart-similar-examples article').count();
    expect(count >= 3 && count <= 6, `相近範例卡片應為 3-6 張，實際 ${count}`);
    await waitText(page, '📚 相近範例');
  });
  await runStep('Test 66 C4 open full Prompt Lab switches tab with landingNote', page, async () => {
    await page.goto(`${BASE_URL}/forma-studio-v2.html`, { waitUntil: 'domcontentloaded' });
    await clickHeaderTab(page, '智慧製圖'); await page.locator('textarea[placeholder*="補充說明"]').first().fill('做一張 UI dashboard mockup');
    await waitText(page, '推薦下一步路徑'); await clickText(page, '確認，生成提示詞');
    await page.locator('#smart-similar-examples').getByRole('button', { name: /^開完整 Prompt Lab$/ }).first().click();
    await waitText(page, '已從 Smart 開啟完整 Prompt Lab'); await waitText(page, '來源：Smart 智慧製圖');
    const active = await page.locator('header .tab-on').first().textContent();
    expect(active.includes('提示詞庫'), `應切到 Prompt Lab tab，實際 ${active}`);
  });
  await runStep('Test 67 C5 Smart literature input shows prefilled NLM button', page, async () => {
    await page.goto(`${BASE_URL}/forma-studio-v2.html`, { waitUntil: 'domcontentloaded' });
    await clickHeaderTab(page, '智慧製圖'); await page.locator('textarea[placeholder*="補充說明"]').first().fill('文獻整理：請把這些研究整理成摘要與簡報');
    await waitText(page, '推薦下一步路徑');
    const btn = page.getByRole('button', { name: /進 NotebookLM 完整 5 step（已預填 4 步）/ }).first();
    await btn.waitFor({ state: 'visible', timeout: 10000 });
    expect(await btn.isEnabled(), 'NLM 預填按鈕應可點');
  });
  await runStep('Test 68 C5 prefilled NLM bridge switches tab and fills state', page, async () => {
    await page.goto(`${BASE_URL}/forma-studio-v2.html`, { waitUntil: 'domcontentloaded' });
    await clickHeaderTab(page, '智慧製圖'); await page.locator('textarea[placeholder*="補充說明"]').first().fill('文獻整理：請把這些研究整理成摘要與簡報');
    await waitText(page, '推薦下一步路徑');
    await page.getByRole('button', { name: /進 NotebookLM 完整 5 step（已預填 4 步）/ }).first().click();
    await waitText(page, '已從 Smart 預填 NotebookLM 前 4 步'); await waitText(page, '已從 Smart 預填，可直接到 Step 5 產生指令');
    const active = await page.locator('header .tab-on').first().textContent();
    expect(active.includes('NotebookLM'), `應切到 NLM tab，實際 ${active}`);
    await waitText(page, '文件整理'); await waitText(page, 'IMRAD 實證框架');
    const customDomain = await page.locator('input[placeholder*="中文系教授"]').inputValue();
    expect(customDomain.includes('文獻') || customDomain.includes('研究'), `domain 應已預填，實際 ${customDomain}`);
    await shot(page, 'c5-nlm-prefilled.png');
  });
  await runStep('Test 69 v2.1 pendingPayload state exists with schema variants', page, async () => {
    const source = sourceV2Html(); expect(source.includes('const [pendingPayload, setPendingPayload] = useState(null);'), 'App 應使用單一 pendingPayload state');
    expect(source.includes("kind='note-only'"), 'dispatch 應支援 note-only kind');
    for (const kind of ['design-prompt', 'audit-text', 'nlm-state', 'note-only']) {
      expect(source.includes(kind), `pendingPayload 應包含 ${kind} kind`);
    }
    for (const field of ['targetTab:', 'sourceTab,', 'kind,', 'payload,', 'note:']) {
      expect(source.includes(field), `pendingPayload schema 缺少 ${field}`);
    }
    expect(!source.includes('setPendingDesignPrompt'), '舊 setPendingDesignPrompt 應不存在'); expect(!source.includes('setPendingAuditText'), '舊 setPendingAuditText 應不存在');
    expect(!source.includes('setPendingNLMState'), '舊 setPendingNLMState 應不存在');
  });
  await runStep('Test 70 v2.1 dispatch switches targetTab and pre-fills Design', page, async () => {
    await page.goto(`${BASE_URL}/forma-studio-v2.html`, { waitUntil: 'domcontentloaded' });
    await clickHeaderTab(page, '智慧製圖'); await page.locator('textarea[placeholder*="補充說明"]').first().fill('做一張 v2.1 schema regression poster 圖片');
    await waitText(page, '推薦下一步路徑'); await clickText(page, '確認，生成提示詞');
    await page.getByRole('button', { name: /進 Claude Design 精修/ }).first().click();
    await waitText(page, '已從 Smart 帶入 prompt'); const active = await page.locator('header .tab-on').first().textContent();
    expect(active.includes('Claude Design'), `dispatch 應切到 design，實際 ${active}`);
    const value = await page.locator('#dt-step-1 textarea').first().inputValue(); expect(/schema regression|圖像生成 Prompt|poster/i.test(value), 'dispatch design-prompt 應預填 Design Step 1');
  });
  await runStep('Test 71 v2.1 consume downgrades payload to note-only without replay', page, async () => {
    const source = sourceV2Html(); expect(source.includes("consumePendingPayload?.('design-prompt')"), 'DesignTab 應消費 design-prompt');
    expect(source.includes("consumePendingPayload?.('audit-text')"), 'AuditTab 應消費 audit-text'); expect(source.includes("consumePendingPayload?.('nlm-state')"), 'NLMTab 應消費 nlm-state');
    expect(source.includes("kind: 'note-only', payload: null"), 'consume 後應移除 payload，保留 note-only banner'); expect(!source.includes('consumePendingDesignPrompt'), '舊 design consume helper 應不存在');
    expect(!source.includes('clearPendingAuditText'), '舊 audit consume helper 應不存在'); expect(!source.includes('consumePendingNLMState'), '舊 nlm consume helper 應不存在');
  });
  await runStep('Test 72 v2.1 landingNote comes from pendingPayload.note only', page, async () => {
    const source = sourceV2Html(); expect(source.includes('const landingNote = pendingPayload?.note || null;'), 'landingNote 應從 pendingPayload.note derive');
    expect(!source.includes('const [landingNote, setLandingNote]'), '舊 landingNote state 應不存在'); expect(!source.includes('setLandingNote('), '不應再直接呼叫 setLandingNote(...)');
    await page.goto(`${BASE_URL}/forma-studio-v2.html`, { waitUntil: 'domcontentloaded' });
    await clickHeaderTab(page, '智慧製圖'); await page.locator('textarea[placeholder*="補充說明"]').first().fill('做一張 v2.1 note bridge 海報圖片');
    await waitText(page, '推薦下一步路徑'); await clickText(page, '確認，生成提示詞');
    await page.getByRole('button', { name: /送完整體檢/ }).first().click();
    await waitText(page, '來自Smart 智慧製圖的 prompt'); await waitText(page, '來源：Smart 智慧製圖');
  });
  await writeReport(browser);
})();
