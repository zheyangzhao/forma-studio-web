const fs = require('fs');
const path = require('path');
const { webkit } = require('playwright');

const BASE_URL = process.env.FORMA_BASE_URL || 'http://localhost:8765';
const SCREENSHOT_DIR = process.env.FORMA_SCREENSHOT_DIR || '/tmp/forma-sprint1-8-screenshots';
const REPORT_PATH = path.join(SCREENSHOT_DIR, 'report.json');
const WEB_ROOT = path.join(__dirname, '../web');

fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

const report = {
  totalSteps: 25,
  passed: [],
  failed: [],
  consoleErrors: [],
  pageErrors: [],
  screenshots: [],
};

function expect(condition, message) {
  if (!condition) throw new Error(message);
}

async function shot(page, name) {
  const file = path.join(SCREENSHOT_DIR, name);
  await page.screenshot({ path: file, fullPage: true });
  report.screenshots.push(file);
}

async function waitText(page, text) {
  await page.getByText(text, { exact: false }).first().waitFor({ state: 'visible', timeout: 15000 });
}

async function clickText(page, text) {
  await page.getByText(text, { exact: false }).first().click();
}

async function resultCount(page) {
  const text = await page.locator('text=/目前命中\\s+\\d+\\s+\\/\\s+\\d+/').first().textContent({ timeout: 10000 });
  const match = text.match(/目前命中\s+(\d+)\s+\/\s+(\d+)/);
  if (!match) throw new Error(`無法解析結果數：${text}`);
  return { visible: Number(match[1]), total: Number(match[2]) };
}

async function runStep(name, page, fn) {
  try {
    await fn();
    report.passed.push(name);
    console.log(`PASS ${name}`);
  } catch (error) {
    const failShot = path.join(SCREENSHOT_DIR, `${name.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}-failure.png`);
    try {
      await page.screenshot({ path: failShot, fullPage: true });
      report.screenshots.push(failShot);
    } catch (_) {}
    report.failed.push({ name, message: error.message, screenshot: failShot });
    console.error(`FAIL ${name}: ${error.message}`);
  }
}

function verifyPromptJson() {
  const index = JSON.parse(fs.readFileSync(path.join(__dirname, '../web/prompt-library/gallery-index.json'), 'utf8'));
  const ids = new Set();
  let sum = 0;
  for (const cat of index.categories) {
    sum += Number(cat.count || 0);
    const data = JSON.parse(fs.readFileSync(path.join(__dirname, '../web/prompt-library', cat.file), 'utf8'));
    for (const prompt of data.prompts || []) ids.add(prompt.id);
  }
  expect(ids.size === 116, `unique prompt id 數應為 116，實際 ${ids.size}`);
  expect(sum === index.total_count, `category count 加總 ${sum} 不等於 total_count ${index.total_count}`);
}

function verifyTranslationsJson() {
  const index = JSON.parse(fs.readFileSync(path.join(__dirname, '../web/prompt-library/gallery-index.json'), 'utf8'));
  const ids = new Set();
  for (const cat of index.categories) {
    const data = JSON.parse(fs.readFileSync(path.join(__dirname, '../web/prompt-library', cat.file), 'utf8'));
    for (const [idx, prompt] of (data.prompts || []).entries()) {
      ids.add(prompt.id || `${cat.slug}-${prompt.no || idx + 1}`);
    }
  }

  const translations = JSON.parse(fs.readFileSync(path.join(__dirname, '../web/prompt-library/translations-zh.json'), 'utf8'));
  const titleKeys = new Set(Object.keys(translations.titles || {}));
  const summaryKeys = new Set(Object.keys(translations.summaries || {}));
  const promptKeys = new Set(Object.keys(translations.prompts || {}));
  const missingTitles = [...ids].filter(id => !titleKeys.has(id));
  const missingSummaries = [...ids].filter(id => !summaryKeys.has(id));
  const missingPrompts = [...ids].filter(id => !promptKeys.has(id));
  const extraTitles = [...titleKeys].filter(id => !ids.has(id));
  const extraSummaries = [...summaryKeys].filter(id => !ids.has(id));
  const extraPrompts = [...promptKeys].filter(id => !ids.has(id));

  expect(translations.schema_version === 3, `schema_version 應為 3，實際 ${translations.schema_version}`);
  expect(titleKeys.size === 116, `titles 應為 116，實際 ${titleKeys.size}`);
  expect(summaryKeys.size === 116, `summaries 應為 116，實際 ${summaryKeys.size}`);
  expect(promptKeys.size === 116, `prompts 應為 116，實際 ${promptKeys.size}`);
  expect(missingTitles.length === 0, `translations titles missing: ${missingTitles.join(', ')}`);
  expect(missingSummaries.length === 0, `translations summaries missing: ${missingSummaries.join(', ')}`);
  expect(missingPrompts.length === 0, `translations prompts missing: ${missingPrompts.join(', ')}`);
  expect(extraTitles.length === 0, `translations titles extra: ${extraTitles.join(', ')}`);
  expect(extraSummaries.length === 0, `translations summaries extra: ${extraSummaries.join(', ')}`);
  expect(extraPrompts.length === 0, `translations prompts extra: ${extraPrompts.join(', ')}`);
  for (const id of ids) {
    expect(typeof translations.prompts[id] === 'string' && translations.prompts[id].trim().length > 0, `prompt translation empty: ${id}`);
  }
}

function sourcePromptById(id) {
  const index = JSON.parse(fs.readFileSync(path.join(__dirname, '../web/prompt-library/gallery-index.json'), 'utf8'));
  for (const cat of index.categories) {
    const data = JSON.parse(fs.readFileSync(path.join(__dirname, '../web/prompt-library', cat.file), 'utf8'));
    const found = (data.prompts || []).find(prompt => prompt.id === id);
    if (found) return found.prompt;
  }
  throw new Error(`source prompt not found: ${id}`);
}

(async () => {
  let browser;
  try {
    browser = await webkit.launch();
  } catch (error) {
    report.failed.push({ name: 'WebKit launch', message: error.message });
    fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2));
    console.error(`FAIL WebKit launch: ${error.message}`);
    console.log(`Report: ${REPORT_PATH}`);
    console.log(`Screenshots: ${SCREENSHOT_DIR}`);
    process.exit(1);
  }
  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    permissions: [],
  });

  await context.route(`${BASE_URL}/**`, async route => {
    const url = new URL(route.request().url());
    const rel = decodeURIComponent(url.pathname.replace(/^\/+/, '')) || 'forma-studio-v2.html';
    const file = path.normalize(path.join(WEB_ROOT, rel));
    if (!file.startsWith(WEB_ROOT)) return route.abort();
    if (!fs.existsSync(file) || !fs.statSync(file).isFile()) return route.abort();
    const ext = path.extname(file);
    const contentType = {
      '.html': 'text/html; charset=utf-8',
      '.json': 'application/json; charset=utf-8',
      '.js': 'application/javascript; charset=utf-8',
      '.css': 'text/css; charset=utf-8',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.svg': 'image/svg+xml',
      '.webp': 'image/webp',
    }[ext] || 'application/octet-stream';
    return route.fulfill({ status: 200, contentType, body: fs.readFileSync(file) });
  });

  const page = await context.newPage();

  page.on('console', msg => {
    if (msg.type() === 'error') report.consoleErrors.push(msg.text());
  });
  page.on('pageerror', err => report.pageErrors.push(err.message));

  await runStep('Test 1 v1.1 frozen smoke', page, async () => {
    await page.goto(`${BASE_URL}/forma-studio.html`, { waitUntil: 'domcontentloaded' });
    await waitText(page, 'Claude Design');
    expect((await page.title()).includes('Forma Studio'), 'title 未包含 Forma Studio');
    await waitText(page, 'NotebookLM');
    await waitText(page, '智慧製圖');
    await waitText(page, '彩蛋');
    const promptLabTabs = await page.locator('header button', { hasText: '提示詞庫' }).count();
    expect(promptLabTabs === 0, 'v1.1 不應出現提示詞庫 tab');
    await shot(page, 'sprint1-v1-smoke.png');
  });

  await runStep('Test 2 v2 existing tabs smoke', page, async () => {
    await page.goto(`${BASE_URL}/forma-studio-v2.html`, { waitUntil: 'domcontentloaded' });
    await waitText(page, 'v2.0');
    for (const label of ['Claude Design', 'NotebookLM', '智慧製圖', '提示詞庫', '彩蛋']) {
      await waitText(page, label);
    }
    await clickText(page, 'Claude Design');
    await waitText(page, '描述需求');
    await clickText(page, 'NotebookLM');
    await waitText(page, 'NotebookLM 智慧指令中樞');
    await clickText(page, '智慧製圖');
    await waitText(page, '說明您要做什麼');
    await clickText(page, '彩蛋');
    await waitText(page, '彩蛋 Lab');
    await shot(page, 'sprint1-v2-tabs.png');
  });

  await runStep('Test 3 Prompt Lab load all', page, async () => {
    await clickText(page, '提示詞庫');
    await page.locator('text=載入提示詞庫中').waitFor({ state: 'detached', timeout: 15000 }).catch(() => {});
    await waitText(page, '共 116 條 prompt');
    await waitText(page, 'wuyoscar/gpt_image_2_skill');
    await waitText(page, 'EvoLinkAI/awesome-gpt-image-2-prompts');
    await waitText(page, 'CC BY 4.0');
    const chips = await page.locator('button.rounded-full').count();
    expect(chips >= 18, `category chips 應至少 18 個（17 分類 + 全部），實際 ${chips}`);
    const count = await resultCount(page);
    expect(count.visible === 116 && count.total === 116, `結果數應為 116/116，實際 ${count.visible}/${count.total}`);
    verifyPromptJson();
    await shot(page, 'sprint1-promptlab-all.png');
  });

  await runStep('Test 4 search chess', page, async () => {
    const input = page.getByLabel('搜尋提示詞');
    await input.fill('chess');
    await waitText(page, 'Chess board mid-tournament game');
    const count = await resultCount(page);
    expect(count.visible > 0 && count.visible < 116, `chess 搜尋結果應小於 116 且大於 0，實際 ${count.visible}`);
    await shot(page, 'sprint1-promptlab-search-chess.png');
    await input.fill('');
    const reset = await resultCount(page);
    expect(reset.visible === 116, `清空搜尋後應回到 116，實際 ${reset.visible}`);
  });

  await runStep('Test 5 category chip photography', page, async () => {
    await clickText(page, '商業攝影');
    const count = await resultCount(page);
    expect(count.visible === 4, `商業攝影分類應為 4，實際 ${count.visible}`);
    await waitText(page, 'RAW iPhone');
    await waitText(page, 'Chess board');
    await shot(page, 'sprint1-promptlab-filter-photography.png');
    await clickText(page, '全部');
    const reset = await resultCount(page);
    expect(reset.visible === 116, `回到全部後應為 116，實際 ${reset.visible}`);
  });

  await runStep('Test 6 expand and copy', page, async () => {
    const firstCard = page.locator('.prompt-lab-card').first();
    await firstCard.getByText('展開').click();
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
    await chessCard.getByText('套用到 Claude Design').click();
    await waitText(page, '描述需求');
    const textarea = page.locator('#dt-step-1 textarea').first();
    await expect(await textarea.isVisible(), 'Step 1 textarea 不可見');
    const value = await textarea.inputValue();
    expect(value.length > 80, `Step 1 textarea 長度應大於 80，實際 ${value.length}`);
    expect(value.toLowerCase().includes('chess board'), 'Step 1 textarea 未包含 chess board');
    await waitText(page, '已從提示詞庫套用');
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
    const input = page.getByLabel('搜尋提示詞');
    await input.fill('介面');
    await waitText(page, 'Mobile Budgeting App Mockup');
    const count = await resultCount(page);
    expect(count.visible > 0 && count.visible < 116, `介面 搜尋結果應小於 116 且大於 0，實際 ${count.visible}`);
    await shot(page, 'sprint1-5-search-interface.png');
  });

  await runStep('Test 10 Chinese search dashboard', page, async () => {
    const input = page.getByLabel('搜尋提示詞');
    await input.fill('桌面端');
    await waitText(page, 'Desktop Operations Dashboard');
    const count = await resultCount(page);
    expect(count.visible > 0 && count.visible < 116, `桌面端 搜尋結果應小於 116 且大於 0，實際 ${count.visible}`);
    await shot(page, 'sprint1-5-search-dashboard.png');
  });

  await runStep('Test 11 bilingual card title rendering', page, async () => {
    const input = page.getByLabel('搜尋提示詞');
    await input.fill('Mobile Budgeting');
    const card = page.locator('.prompt-lab-card', { hasText: 'Mobile Budgeting App Mockup' }).first();
    await card.waitFor({ state: 'visible', timeout: 10000 });
    await card.getByText('行動端記帳 App Mockup').waitFor({ state: 'visible', timeout: 5000 });
    await card.getByText('Mobile Budgeting App Mockup').waitFor({ state: 'visible', timeout: 5000 });
    const text = await card.textContent();
    expect(text.includes('行動端記帳 App Mockup'), '卡片未包含中文 titleZh');
    expect(text.includes('Mobile Budgeting App Mockup'), '卡片未包含英文 title');
    await shot(page, 'sprint1-5-bilingual-card.png');
  });

  await runStep('Test 12 translations JSON integrity', page, async () => {
    verifyTranslationsJson();
    await page.goto(`${BASE_URL}/forma-studio-v2.html`, { waitUntil: 'domcontentloaded' });
    await clickText(page, '提示詞庫');
    await page.locator('text=載入提示詞庫中').waitFor({ state: 'detached', timeout: 15000 }).catch(() => {});
    const translations = JSON.parse(fs.readFileSync(path.join(__dirname, '../web/prompt-library/translations-zh.json'), 'utf8'));
    const expectedTitles = new Set(Object.values(translations.titles || {}));
    const renderedTitles = await page.locator('.prompt-lab-card h3').evaluateAll(nodes => nodes.map(node => node.textContent.trim()));
    const renderedZhCount = renderedTitles.filter(title => expectedTitles.has(title)).length;
    expect(renderedTitles.length === 116, `normalized card 數應為 116，實際 ${renderedTitles.length}`);
    expect(renderedZhCount === 116, `每張卡應有 titleZh，實際 ${renderedZhCount}/116`);
  });

  await runStep('Test 13 schema 3 prompt translations complete', page, async () => {
    verifyTranslationsJson();
    const translations = JSON.parse(fs.readFileSync(path.join(__dirname, '../web/prompt-library/translations-zh.json'), 'utf8'));
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
    const text = await card.textContent();
    expect(text.includes('橡木地板'), '折疊卡片應顯示 summaries[id] 的中文摘要');
    expect(!text.includes('以 photorealistic architectural visualization style 渲染'), '折疊狀態不應直接顯示中文全文');
    await shot(page, 'sprint1-6-collapsed-summary.png');
  });

  await runStep('Test 15 search oak Chinese summary keyword', page, async () => {
    const input = page.getByLabel('搜尋提示詞');
    await input.fill('橡木');
    await waitText(page, '日式極簡客廳');
    const count = await resultCount(page);
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
    expect(copied === english, '複製 prompt 應完全等於英文原文');
    expect(copied.includes('Render a serene Japanese minimalist living room interior'), '複製內容應包含英文 prompt');
    expect(!copied.includes('日式極簡客廳') && !copied.includes('橡木地板'), '複製內容不應包含中文摘要或中文全文');
  });

  await runStep('Test 18 mobile card does not overflow', page, async () => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${BASE_URL}/forma-studio-v2.html`, { waitUntil: 'domcontentloaded' });
    await clickText(page, '提示詞庫');
    await page.locator('text=載入提示詞庫中').waitFor({ state: 'detached', timeout: 15000 }).catch(() => {});
    await page.getByLabel('搜尋提示詞').fill('橡木');
    await waitText(page, '日式極簡客廳');
    const card = page.locator('.prompt-lab-card').first();
    const box = await card.boundingBox();
    expect(box && box.x >= 0 && box.width <= 390, `mobile 卡片不應溢出 viewport，box=${JSON.stringify(box)}`);
    const bodyWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(bodyWidth <= 390, `mobile 不應有橫向溢出，scrollWidth=${bodyWidth}`);
    await shot(page, 'sprint1-6-1-7-mobile-card.png');
  });

  await page.setViewportSize({ width: 1280, height: 900 });

  await runStep('Test 19 Design Step 4 completion card visible', page, async () => {
    await page.goto(`${BASE_URL}/forma-studio-v2.html`, { waitUntil: 'domcontentloaded' });
    await clickText(page, 'Claude Design');
    await page.locator('#dt-step-1 textarea').first().fill('做一張牙科衛教海報，主題是睡眠呼吸與口腔健康');
    await clickText(page, '繼續 → 設定受眾與基調');
    await clickText(page, '繼續 → 選擇製圖方式');
    await clickText(page, '社群內容');
    await page.locator('#dt-step-3 textarea').first().fill('患者衛教海報，說明睡眠呼吸、磨牙與口腔健康的關係');
    await clickText(page, '繼續 → 設定風格與生成');
    await clickText(page, '生成圖像提示詞');
    await waitText(page, '已產出圖像 prompt');
    await waitText(page, '這裡產出的是 prompt，不是圖片');
    await waitText(page, '到 Prompt Lab 找參考');
    await shot(page, 'sprint1-8-design-step4-card.png');
  });

  await runStep('Test 20 Prompt Lab apply shows Design landingNote', page, async () => {
    await page.goto(`${BASE_URL}/forma-studio-v2.html`, { waitUntil: 'domcontentloaded' });
    await clickText(page, '提示詞庫');
    await page.locator('text=載入提示詞庫中').waitFor({ state: 'detached', timeout: 15000 }).catch(() => {});
    await page.getByLabel('搜尋提示詞').fill('chess');
    const chessCard = page.locator('.prompt-lab-card', { hasText: 'Chess board mid-tournament game' }).first();
    await chessCard.getByText('套用英文 prompt 到 Claude Design', { exact: false }).click();
    await waitText(page, '已從 Prompt Lab 套用英文 prompt');
    await waitText(page, '來源：Prompt Lab 提示詞庫');
    const textarea = page.locator('#dt-step-1 textarea').first();
    const value = await textarea.inputValue();
    expect(value.toLowerCase().includes('chess board'), 'Design textarea 未預填 chess prompt');
    await shot(page, 'sprint1-8-promptlab-landing-note.png');
  });

  await runStep('Test 21 Smart selSub changes next-step actions', page, async () => {
    await page.goto(`${BASE_URL}/forma-studio-v2.html`, { waitUntil: 'domcontentloaded' });
    await clickText(page, '智慧製圖');
    await page.locator('textarea').first().fill('做一張牙科衛教海報圖片');
    await clickText(page, '確認，生成提示詞');
    await waitText(page, '進 Claude Design 精修');
    await waitText(page, '複製 prompt');
    await clickText(page, '重新開始');
    await page.locator('textarea').first().fill('把這篇文獻整理成簡報');
    await clickText(page, '確認，生成提示詞');
    await waitText(page, '進 NotebookLM');
    await waitText(page, '複製任務指令');
    await shot(page, 'sprint1-8-smart-next-actions.png');
  });

  await runStep('Test 22 NotebookLM Step 5 paste order card visible', page, async () => {
    await page.goto(`${BASE_URL}/forma-studio-v2.html`, { waitUntil: 'domcontentloaded' });
    await clickText(page, 'NotebookLM');
    await clickText(page, '簡報製作');
    await clickText(page, '口腔醫學');
    await clickText(page, 'IMRAD');

    await clickText(page, '產生指令');
    await waitText(page, 'NotebookLM Step 5 貼上順序');
    await waitText(page, '先貼自定義指示');
    await waitText(page, '再貼任務指令');
    await shot(page, 'sprint1-8-nlm-step5-order.png');
  });

  await runStep('Test 23 LabTab mode-based next steps change', page, async () => {
    await page.goto(`${BASE_URL}/forma-studio-v2.html`, { waitUntil: 'domcontentloaded' });
    await clickText(page, '彩蛋');
    await clickText(page, '病毒傳播版');
    await page.locator('textarea').first().fill('睡眠呼吸與牙科衛教簡報');
    await clickText(page, '執行實驗');
    await waitText(page, '病毒傳播版已完成');
    await waitText(page, '進 NotebookLM');
    await clickText(page, '反 AI Slop 診斷');
    await page.locator('textarea').first().fill('一個紫色漸層卡片式提示詞');
    await clickText(page, '執行實驗');
    await waitText(page, '反 AI Slop 診斷已完成');
    await waitText(page, '複製診斷結果');
    const visibleButtons = await page.locator('button:visible').evaluateAll(nodes => nodes.map(n => n.textContent.trim()));
    expect(!visibleButtons.some(text => /Audit|StyleStudio/.test(text)), `Lab anti 不應顯示未實作導向：${visibleButtons.join(' | ')}`);
    await shot(page, 'sprint1-8-lab-mode-next.png');
  });

  await runStep('Test 24 BrandPane 5-dimension helper visible', page, async () => {
    await page.goto(`${BASE_URL}/forma-studio-v2.html`, { waitUntil: 'domcontentloaded' });
    await clickText(page, 'Claude Design');
    await clickText(page, '品牌與評審');
    await clickText(page, '5 維度評審');
    await waitText(page, '5 維度評審說明');
    await waitText(page, '自評起點，不是 AI 最終品質保證');
    await waitText(page, '哲學一致性');
    await shot(page, 'sprint1-8-brand-helper.png');
  });

  await runStep('Test 25 Audit and StyleStudio actions remain hidden', page, async () => {
    await page.goto(`${BASE_URL}/forma-studio-v2.html`, { waitUntil: 'domcontentloaded' });
    for (const label of ['Claude Design', 'NotebookLM', '智慧製圖', '提示詞庫', '彩蛋']) {
      await clickText(page, label);
      await page.waitForTimeout(100);
      const buttons = await page.locator('button:visible').evaluateAll(nodes => nodes.map(n => n.textContent.trim()));
      expect(!buttons.some(text => /Audit|StyleStudio/.test(text)), `${label} 不應出現 Audit / StyleStudio button：${buttons.join(' | ')}`);
    }
  });

  await browser.close();

  if (report.consoleErrors.length || report.pageErrors.length) {
    report.failed.push({
      name: 'Console/page errors',
      message: `consoleErrors=${report.consoleErrors.length}, pageErrors=${report.pageErrors.length}`,
    });
  }

  fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2));
  console.log(`Report: ${REPORT_PATH}`);
  console.log(`Screenshots: ${SCREENSHOT_DIR}`);

  if (report.failed.length) {
    process.exitCode = 1;
  }
})();
