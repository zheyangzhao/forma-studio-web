const fs = require('fs');
const path = require('path');
const { webkit } = require('playwright');

const BASE_URL = process.env.FORMA_BASE_URL || 'http://localhost:8765';
const SCREENSHOT_DIR = process.env.FORMA_SCREENSHOT_DIR || '/tmp/forma-sprint1-screenshots';
const REPORT_PATH = path.join(SCREENSHOT_DIR, 'report.json');
const WEB_ROOT = path.join(__dirname, '../web');

fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

const report = {
  totalSteps: 8,
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
