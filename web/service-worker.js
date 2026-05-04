/* Forma Studio v2.2 · Service Worker (離線快取)
   快取 v2 shell、manifest、Prompt Lab JSON；OpenAI API 與使用者 prompt 絕不快取。 */

const CACHE_NAME = 'forma-studio-v2.2';
const HTML_URLS = [
  './forma-studio-v2.html',
  './manifest.json',
];
const PROMPT_LIBRARY_URLS = [
  './prompt-library/gallery-index.json',
  './prompt-library/translations-zh.json',
  './prompt-library/architecture-and-interior.json',
  './prompt-library/brand-systems-and-identity.json',
  './prompt-library/cinematic-and-animation.json',
  './prompt-library/data-visualization.json',
  './prompt-library/edit-endpoint-showcase.json',
  './prompt-library/evolink-ad-creative.json',
  './prompt-library/evolink-comparison.json',
  './prompt-library/evolink-ecommerce.json',
  './prompt-library/evolink-poster.json',
  './prompt-library/evolink-ui.json',
  './prompt-library/infographics-and-field-guides.json',
  './prompt-library/photography.json',
  './prompt-library/product-and-food.json',
  './prompt-library/scientific-and-educational.json',
  './prompt-library/technical-illustration.json',
  './prompt-library/typography-and-posters.json',
  './prompt-library/ui-ux-mockups.json',
];
const PRECACHE_URLS = [...HTML_URLS, ...PROMPT_LIBRARY_URLS];

const stripSearch = request => {
  const url = new URL(request.url);
  url.search = '';
  return url.toString();
};

async function networkFirst(request, fallbackUrl) {
  const cache = await caches.open(CACHE_NAME);
  try {
    const response = await fetch(request);
    if (response && response.ok) cache.put(stripSearch(request), response.clone());
    return response;
  } catch (error) {
    const cached = await cache.match(stripSearch(request));
    if (cached) return cached;
    if (fallbackUrl) return cache.match(fallbackUrl);
    throw error;
  }
}

async function cacheFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(stripSearch(request));
  if (cached) return cached;
  const response = await fetch(request);
  if (response && response.ok) cache.put(stripSearch(request), response.clone());
  return response;
}

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(PRECACHE_URLS.map(url => new Request(url, { cache: 'reload' }))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(names =>
      Promise.all(
        names
          .filter(n => n !== CACHE_NAME && /^forma-studio-v\d/.test(n))
          .map(n => caches.delete(n))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const { request } = event;
  // 只處理 GET 請求；POST prompt/API body 不進 cache。
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  // OpenAI API 絕對不快取
  if (url.hostname.includes('openai.com')) return;

  const path = url.pathname.replace(/^\/+/, '');
  const isSameOrigin = url.origin === self.location.origin;
  const isNavigation = request.mode === 'navigate';

  if (isSameOrigin && isNavigation && path.endsWith('forma-studio-v2.html')) {
    event.respondWith(networkFirst(request, './forma-studio-v2.html'));
    return;
  }

  const htmlOrManifest = HTML_URLS.some(u => path.endsWith(u.replace('./', '')));
  if (isSameOrigin && htmlOrManifest) {
    event.respondWith(networkFirst(request));
    return;
  }

  const promptJson = PROMPT_LIBRARY_URLS.some(u => path.endsWith(u.replace('./', '')));
  if (isSameOrigin && promptJson) {
    event.respondWith(networkFirst(request));
    return;
  }

  // CDN 資源（Tailwind / React / Babel）：cache-first，一次下載長期用
  if (url.hostname.includes('cdn.') || url.hostname.includes('cdnjs.')) {
    event.respondWith(cacheFirst(request));
  }
});
