const fs = require('fs');
const path = require('path');
const { webkit } = require('playwright');

const BASE_URL = process.env.FORMA_BASE_URL || 'http://localhost:8765';
const SCREENSHOT_DIR = process.env.FORMA_SCREENSHOT_DIR || '/tmp/forma-master-screenshots';
const REPORT_PATH = path.join(SCREENSHOT_DIR, 'report.json');
const WEB_ROOT = path.join(__dirname, '../web');
const V2_HTML_PATH = path.join(WEB_ROOT, 'forma-studio-v2.html');
const DEFAULT_VIEWPORT = { width: 1280, height: 900 };
const DEFAULT_PERMISSIONS = [];

fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

const report = {
  totalSteps: Number(process.env.FORMA_TOTAL_STEPS || 72),
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

async function clickHeaderTab(page, text) {
  const escaped = text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const tab = page.locator('header').getByRole('button', { name: new RegExp(escaped) }).first();
  await tab.waitFor({ state: 'visible', timeout: 15000 });
  await tab.click();
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

function contentTypeFor(file) {
  return {
    '.html': 'text/html; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.webp': 'image/webp',
  }[path.extname(file)] || 'application/octet-stream';
}

async function routeWebRoot(context) {
  await context.route(`${BASE_URL}/**`, async route => {
    const url = new URL(route.request().url());
    const rel = decodeURIComponent(url.pathname.replace(/^\/+/, '')) || 'forma-studio-v2.html';
    const file = path.normalize(path.join(WEB_ROOT, rel));
    if (!file.startsWith(WEB_ROOT)) return route.abort();
    if (!fs.existsSync(file) || !fs.statSync(file).isFile()) return route.abort();
    return route.fulfill({ status: 200, contentType: contentTypeFor(file), body: fs.readFileSync(file) });
  });
}

function trackContextErrors(context) {
  context.on('page', page => {
    page.on('console', msg => {
      if (msg.type() === 'error') report.consoleErrors.push(msg.text());
    });
    page.on('pageerror', err => report.pageErrors.push(err.message));
  });
}

async function createBrowser() {
  try {
    return await webkit.launch();
  } catch (error) {
    report.failed.push({ name: 'WebKit launch', message: error.message });
    fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2));
    console.error(`FAIL WebKit launch: ${error.message}`);
    console.log(`Report: ${REPORT_PATH}`);
    console.log(`Screenshots: ${SCREENSHOT_DIR}`);
    process.exit(1);
  }
}

async function createContext(browser, options = {}) {
  const context = await browser.newContext({
    viewport: options.viewport || DEFAULT_VIEWPORT,
    permissions: options.permissions || DEFAULT_PERMISSIONS,
  });
  trackContextErrors(context);
  await routeWebRoot(context);
  return context;
}

async function newIsolatedPage(browser, viewport = DEFAULT_VIEWPORT) {
  const context = await createContext(browser, { viewport });
  await context.clearCookies();
  const page = await context.newPage();
  return { context, page };
}

async function writeReport(browser) {
  if (browser) await browser.close();
  if (report.consoleErrors.length || report.pageErrors.length) {
    report.failed.push({
      name: 'Console/page errors',
      message: `consoleErrors=${report.consoleErrors.length}, pageErrors=${report.pageErrors.length}`,
    });
  }
  fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2));
  console.log(`Report: ${REPORT_PATH}`);
  console.log(`Screenshots: ${SCREENSHOT_DIR}`);
  if (report.failed.length) process.exitCode = 1;
}

function promptIndex() {
  return JSON.parse(fs.readFileSync(path.join(__dirname, '../web/prompt-library/gallery-index.json'), 'utf8'));
}

function verifyPromptJson() {
  const index = promptIndex();
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
  const ids = new Set();
  for (const cat of promptIndex().categories) {
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
  for (const cat of promptIndex().categories) {
    const data = JSON.parse(fs.readFileSync(path.join(__dirname, '../web/prompt-library', cat.file), 'utf8'));
    const found = (data.prompts || []).find(prompt => prompt.id === id);
    if (found) return found.prompt;
  }
  throw new Error(`source prompt not found: ${id}`);
}

function sourceV2Html() {
  return fs.readFileSync(V2_HTML_PATH, 'utf8');
}

function translationsJson() {
  return JSON.parse(fs.readFileSync(path.join(__dirname, '../web/prompt-library/translations-zh.json'), 'utf8'));
}

module.exports = {
  BASE_URL,
  SCREENSHOT_DIR,
  REPORT_PATH,
  WEB_ROOT,
  V2_HTML_PATH,
  DEFAULT_VIEWPORT,
  DEFAULT_PERMISSIONS,
  report,
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
};
