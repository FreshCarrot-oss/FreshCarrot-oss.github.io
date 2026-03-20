/* Файл: assets/js/router.js */
/* Hash SPA-роутер — обрабатывает все переходы между страницами */

import { pageEnter, pageLeave } from './animations.js';
import { setActiveNavLink }     from './ui.js';

// ── Реестр маршрутов ──────────────────────────────────────────
const routes = {};
let currentRoute = null;
let isTransitioning = false;

// ── Регистрация маршрута ──────────────────────────────────────
export function addRoute(pattern, handler) {
  routes[pattern] = handler;
}

// ── Разбор текущего хэша ──────────────────────────────────────
function parseHash() {
  const raw  = window.location.hash.slice(1) || '/';
  const [pathPart, queryPart] = raw.split('?');
  const path = pathPart || '/';

  // Параметры строки запроса
  const query = {};
  if (queryPart) {
    queryPart.split('&').forEach(pair => {
      const [k, v] = pair.split('=');
      if (k) query[decodeURIComponent(k)] = decodeURIComponent(v || '');
    });
  }

  return { path, query };
}

// ── Сопоставление пути с шаблоном ──────────────────────────────
function matchRoute(path) {
  for (const [pattern, handler] of Object.entries(routes)) {
    // Точное совпадение
    if (pattern === path) {
      return { handler, params: {} };
    }

    // Шаблон с параметрами вида /test/:id
    const patternParts = pattern.split('/');
    const pathParts    = path.split('/');

    if (patternParts.length !== pathParts.length) continue;

    const params = {};
    let matched = true;

    for (let i = 0; i < patternParts.length; i++) {
      if (patternParts[i].startsWith(':')) {
        params[patternParts[i].slice(1)] = decodeURIComponent(pathParts[i]);
      } else if (patternParts[i] !== pathParts[i]) {
        matched = false;
        break;
      }
    }

    if (matched) return { handler, params };
  }

  return null;
}

// ── Основная функция навигации ────────────────────────────────
export async function navigate(path, replace = false) {
  if (isTransitioning) return;

  const url = '#' + path;
  if (replace) {
    window.history.replaceState(null, '', url);
  } else {
    window.history.pushState(null, '', url);
  }

  await handleRouteChange();
}

// ── Обработчик смены маршрута ─────────────────────────────────
async function handleRouteChange() {
  if (isTransitioning) return;
  isTransitioning = true;

  const { path, query } = parseHash();
  const app = document.getElementById('app');
  if (!app) { isTransitioning = false; return; }

  // Обновить активную ссылку навбара
  const navRoute = '/' + path.split('/')[1];
  setActiveNavLink(navRoute === '//' ? '/' : navRoute);

  // Анимация выхода текущей страницы
  if (currentRoute && app.children.length > 0) {
    try {
      const leaveAnim = pageLeave(app);
      if (leaveAnim && leaveAnim.then) {
        await new Promise(res => setTimeout(res, 350));
      }
    } catch {}
  }

  // Найти обработчик маршрута
  const match = matchRoute(path);

  // Очистить контейнер
  app.innerHTML = '';
  app.style.opacity = '1';

  try {
    if (match) {
      currentRoute = path;
      await match.handler({ params: match.params, query });
    } else {
      // 404
      app.innerHTML = render404();
    }
  } catch (err) {
    console.error('Ошибка рендера маршрута:', err);
    app.innerHTML = renderError(err.message);
  }

  // Анимация входа новой страницы
  try {
    pageEnter(app);
  } catch {}

  // Скролл наверх
  window.scrollTo({ top: 0, behavior: 'instant' });

  isTransitioning = false;
}

// ── Страница 404 ──────────────────────────────────────────────
function render404() {
  return `
    <div style="min-height:80vh;display:flex;align-items:center;justify-content:center;text-align:center;padding:2rem;">
      <div>
        <div style="font:800 8rem/1 var(--font-display);background:var(--grad-text);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;margin-bottom:1rem;">404</div>
        <h2 class="h3" style="margin-bottom:0.75rem;">Страница не найдена</h2>
        <p class="text-secondary" style="margin-bottom:2rem;">Такой страницы не существует или она была удалена</p>
        <a href="#/" class="btn-primary">← На главную</a>
      </div>
    </div>
  `;
}

// ── Страница ошибки ───────────────────────────────────────────
function renderError(msg) {
  return `
    <div style="min-height:80vh;display:flex;align-items:center;justify-content:center;text-align:center;padding:2rem;">
      <div>
        <div style="font-size:3rem;margin-bottom:1rem;">⚠️</div>
        <h2 class="h3" style="margin-bottom:0.75rem;">Что-то пошло не так</h2>
        <p class="text-secondary" style="margin-bottom:2rem;max-width:400px;">${msg || 'Произошла непредвиденная ошибка'}</p>
        <a href="#/" class="btn-primary">← На главную</a>
      </div>
    </div>
  `;
}

// ── Инициализация роутера ─────────────────────────────────────
export function initRouter() {
  // Слушатель изменения хэша
  window.addEventListener('hashchange', handleRouteChange);

  // Перехват кликов по ссылкам с хэшем
  document.addEventListener('click', e => {
    const link = e.target.closest('a[href^="#/"]');
    if (link) {
      // Позволяем браузеру обновить хэш, затем обрабатываем
      return; // hashchange сработает сам
    }
  });

  // Первый запуск
  handleRouteChange();
}

// ── Публичный объект роутера ──────────────────────────────────
export const router = { navigate, addRoute };
window.__router = router;
