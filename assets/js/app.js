/* Файл: assets/js/app.js */
/* Точка входа: инициализация роутера, авторизации, анимаций и всех маршрутов */

import { initRouter, addRoute, router } from './router.js';
import { initAuth, currentUser }        from './auth.js';
import { initCursor, initParticles }    from './animations.js';
import { showLoader, hideLoader,
         updateNavbar, showToast }      from './ui.js';

// ── Ленивые импорты страниц ───────────────────────────────────
// Каждая страница загружается только при первом обращении

async function loadHomePage() {
  const { renderHomePage } = await import('../pages/home.js');
  return renderHomePage;
}

async function loadCatalogPage() {
  const { renderCatalogPage } = await import('../pages/catalog.js');
  return renderCatalogPage;
}

async function loadTestPage() {
  const { renderTestPage } = await import('../pages/test-page.js');
  return renderTestPage;
}

async function loadResultPage() {
  const { renderResultPageRoute, renderSharedPage } = await import('../pages/result-page.js');
  return { renderResultPageRoute, renderSharedPage };
}

async function loadCabinetPage() {
  const { renderCabinetPage } = await import('../pages/cabinet.js');
  return renderCabinetPage;
}

async function loadLoginPage() {
  const { renderLoginPage } = await import('../pages/login.js');
  return renderLoginPage;
}

async function loadRegisterPage() {
  const { renderRegisterPage } = await import('../pages/register.js');
  return renderRegisterPage;
}

async function loadAboutPage() {
  return () => renderAboutStub();
}

// ── Регистрация маршрутов ─────────────────────────────────────

// Главная страница
addRoute('/', async ({ params, query }) => {
  const fn = await loadHomePage();
  fn();
});

// Каталог тестов
addRoute('/tests', async ({ params, query }) => {
  const fn = await loadCatalogPage();
  fn();
});

// Страница конкретного теста
addRoute('/test/:testId', async ({ params, query }) => {
  const fn = await loadTestPage();
  fn(params.testId);
});

// Результаты теста
addRoute('/result/:testId', async ({ params, query }) => {
  const { renderResultPageRoute } = await loadResultPage();
  renderResultPageRoute(params.testId);
});

// Просмотр shared-результата
addRoute('/shared/:testId', async ({ params, query }) => {
  const { renderSharedPage } = await loadResultPage();
  renderSharedPage(params.testId, query);
});

// Личный кабинет (требует авторизации)
addRoute('/cabinet', async ({ params, query }) => {
  if (!window.__currentUser) {
    showToast('Войдите в аккаунт, чтобы открыть кабинет', 'warn');
    router.navigate('/login', true);
    return;
  }
  const fn = await loadCabinetPage();
  fn(query.tab);
});

// Страница входа
addRoute('/login', async () => {
  if (window.__currentUser) {
    router.navigate('/cabinet', true);
    return;
  }
  const fn = await loadLoginPage();
  fn();
});

// Страница регистрации
addRoute('/register', async () => {
  if (window.__currentUser) {
    router.navigate('/cabinet', true);
    return;
  }
  const fn = await loadRegisterPage();
  fn();
});

// О проекте
addRoute('/about', async () => {
  const fn = await loadAboutPage();
  fn();
});

// Админ-панель
addRoute('/admin', async () => {
  const { renderAdminPage } = await import('../pages/admin.js');
  renderAdminPage();
});

// ── Инициализация навбара ─────────────────────────────────────
function initNavbar() {
  const navbar = document.getElementById('navbar');
  const burger = document.getElementById('navBurger');
  const menu   = document.getElementById('mobileMenu');

  // Эффект при скролле
  if (navbar) {
    window.addEventListener('scroll', () => {
      navbar.classList.toggle('scrolled', window.scrollY > 60);
    }, { passive: true });
  }

  // Бургер-меню
  if (burger && menu) {
    burger.addEventListener('click', () => {
      const open = burger.classList.toggle('open');
      menu.classList.toggle('open', open);
      burger.setAttribute('aria-expanded', String(open));
    });

    // Закрытие при клике на ссылку
    menu.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        burger.classList.remove('open');
        menu.classList.remove('open');
        burger.setAttribute('aria-expanded', 'false');
      });
    });

    // Закрытие по клику вне меню
    document.addEventListener('click', e => {
      if (menu.classList.contains('open') &&
          !menu.contains(e.target) &&
          !burger.contains(e.target)) {
        burger.classList.remove('open');
        menu.classList.remove('open');
        burger.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // Делегированный logout
  document.addEventListener('click', e => {
    if (e.target.closest('#logoutBtn, #mobileLogoutBtn')) {
      import('./auth.js').then(({ logout }) => logout());
    }
  });
}

// ── Страница "О проекте" (заглушка) ──────────────────────────
function renderAboutStub() {
  const app = document.getElementById('app');
  if (!app) return;
  app.innerHTML = `
    <div class="page-section" style="position:relative;z-index:10;">
      <div class="container-sm">
        <div class="section-header">
          <span class="section-label">О нас</span>
          <h1 class="h2 gradient-text">О проекте PsychoTest</h1>
        </div>
        <div class="glass-card no-hover" style="padding:clamp(1.5rem,4vw,2.5rem);">
          <h3 class="h4" style="margin-bottom:1rem;">Научная база</h3>
          <p class="body-md text-secondary" style="margin-bottom:1.5rem;">
            PsychoTest — платформа для прохождения научно-валидированных психологических тестов.
            Все инструменты имеют академическое происхождение и широко используются
            в психологической практике по всему миру.
          </p>
          <h3 class="h4" style="margin-bottom:1rem;">7 тестов в одном месте</h3>
          <p class="body-md text-secondary" style="margin-bottom:1.5rem;">
            ПДО Личко · MBTI · Big Five OCEAN · EPI Айзенка · Тест Леонгарда · 16PF Кеттела · IQ-тест
          </p>
          <h3 class="h4" style="margin-bottom:1rem;">AI-анализ без API</h3>
          <p class="body-md text-secondary">
            Мы не отправляем ваши данные на серверы нейросетей. Вместо этого
            платформа генерирует структурированный промпт — вы вставляете его в ChatGPT,
            Claude или Gemini в своём аккаунте и получаете персональный анализ.
          </p>
        </div>
        <div style="text-align:center;margin-top:2.5rem;">
          <a href="#/tests" class="btn-primary">Начать тестирование →</a>
        </div>
      </div>
    </div>
  `;
}

// ── Главная точка инициализации ──────────────────────────────
async function bootstrap() {
  // Показываем загрузочный экран
  showLoader('Инициализация...');

  // Инициализируем кастомный курсор сразу
  initCursor();

  // Инициализируем навбар
  initNavbar();

  // Инициализируем частицы
  initParticles().catch(() => {});

  // Инициализируем Firebase Auth и ждём состояния
  await new Promise(resolve => {
    initAuth(user => {
      updateNavbar(user);
      // Обновляем навбар при каждой смене состояния
    });

    // Firebase Auth может быть не настроен — таймаут 2 секунды
    const fallback = setTimeout(resolve, 2000);

    // Или ждём первого onAuthStateChanged
    if (window.firebase?.auth) {
      window.firebase.auth().onAuthStateChanged(() => {
        clearTimeout(fallback);
        resolve();
      });
    } else {
      clearTimeout(fallback);
      resolve();
    }
  });

  // Инициализируем роутер (рендерит первую страницу)
  initRouter();

  // Скрываем загрузочный экран
  hideLoader();

  // Lucide-иконки (если подключены)
  if (window.lucide) {
    try { lucide.createIcons(); } catch {}
  }
}

// ── Запуск ────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', bootstrap);
