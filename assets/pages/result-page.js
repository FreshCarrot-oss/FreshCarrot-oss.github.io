/* Файл: assets/pages/result-page.js */
/* Загружает результат и рендерит страницу результатов / shared-страницу */

import { renderResultPage, renderExportBar } from '../js/results/results-engine.js';
import { loadSharedData }                    from '../js/results/export.js';
import { renderPromptBlock }                 from '../js/prompt-generator.js';
import { showToast, skeletonResultsPage }    from '../js/ui.js';
import { animateResultsPage }                from '../js/animations.js';

// ── Названия тестов ───────────────────────────────────────────
const TEST_NAMES = {
  pdo:'ПДО Личко', mbti:'MBTI', bigfive:'Big Five OCEAN',
  eysenck:'EPI Айзенка', leonhard:'Тест Леонгарда',
  cattell:'16PF Кеттела', iq:'IQ-тест',
};

// ── Рендер страницы результатов по маршруту /result/:testId ──
export async function renderResultPageRoute(testId) {
  const app = document.getElementById('app');
  if (!app) return;

  // Скелетон пока грузим
  app.innerHTML = `<div class="results-page"><div class="results-container">${skeletonResultsPage()}</div></div>`;

  // 1. Пробуем localStorage
  let result = null;
  try {
    const raw = localStorage.getItem(`result_${testId}`);
    if (raw) result = JSON.parse(raw);
  } catch {}

  // 2. Пробуем Firestore (если залогинен)
  if (!result && window.__currentUser) {
    try {
      const { loadTestResult } = await import('../js/db.js');
      const dbData = await loadTestResult(window.__currentUser.uid, testId);
      if (dbData?.result) result = dbData.result;
    } catch {}
  }

  // Нет результата — предлагаем пройти тест
  if (!result) {
    app.innerHTML = `
      <div class="results-page" style="position:relative;z-index:10;">
        <div class="results-container" style="align-items:center;text-align:center;padding-top:4rem;">
          <div class="glass-card no-hover" style="padding:3rem;max-width:480px;margin-inline:auto;">
            <div style="font-size:3rem;margin-bottom:1rem;"></div>
            <h2 class="h3" style="margin-bottom:0.75rem;">Результат не найден</h2>
            <p class="text-secondary" style="margin-bottom:2rem;">
              Вы ещё не проходили тест «${TEST_NAMES[testId] || testId}» или результат устарел.
            </p>
            <a href="#/test/${testId}" class="btn-primary">Пройти тест →</a>
            <a href="#/tests" class="btn-ghost" style="margin-top:0.75rem;display:block;">← Все тесты</a>
          </div>
        </div>
      </div>
    `;
    return;
  }

  // Рендерим страницу результатов
  renderResultPage(testId, result);
}

// ── Рендер shared-страницы (#/shared/:testId?d=...) ──────────
export function renderSharedPage(testId, query) {
  const app = document.getElementById('app');
  if (!app) return;

  // Декодируем Base64 из URL
  const sharedData = loadSharedData();

  if (!sharedData || !sharedData.r) {
    app.innerHTML = `
      <div class="results-page" style="position:relative;z-index:10;">
        <div class="results-container" style="text-align:center;padding-top:4rem;">
          <div class="glass-card no-hover" style="padding:3rem;max-width:480px;margin-inline:auto;">
            <div style="font-size:3rem;margin-bottom:1rem;"></div>
            <h2 class="h3" style="margin-bottom:0.75rem;">Ссылка недействительна</h2>
            <p class="text-secondary" style="margin-bottom:2rem;">
              Данные результата повреждены или ссылка устарела.
            </p>
            <a href="#/tests" class="btn-primary">← Все тесты</a>
          </div>
        </div>
      </div>
    `;
    return;
  }

  const result   = sharedData.r;
  const date     = sharedData.d || '';
  const testName = TEST_NAMES[testId] || testId;

  // Рендерим страницу результатов (только для чтения)
  renderResultPage(testId, result);

  // Добавляем баннер «shared» и CTA внизу
  requestAnimationFrame(() => {
    const container = document.querySelector('.results-container');
    if (!container) return;

    // Баннер вверху
    const banner = document.createElement('div');
    banner.className = 'shared-banner';
    banner.innerHTML = `👁 Результаты, которыми поделились с вами · ${testName}${date ? ' · ' + date : ''}`;
    container.insertBefore(banner, container.firstChild);

    // CTA внизу
    const cta = document.createElement('div');
    cta.className = 'shared-cta glass-card no-hover';
    cta.innerHTML = `
      <h3 class="h4" style="margin-bottom:0.75rem;">Хотите узнать свой тип?</h3>
      <p class="text-secondary" style="margin-bottom:1.5rem;">
        Пройдите тест «${testName}» и получите персональный анализ
      </p>
      <div style="display:flex;gap:1rem;justify-content:center;flex-wrap:wrap;">
        <a href="#/test/${testId}" class="btn-primary">→ Пройти тест ${testName}</a>
        <a href="#/tests" class="btn-ghost">Все тесты</a>
      </div>
    `;
    container.appendChild(cta);

    // Скрываем export bar и промпт (они не нужны на shared-странице)
    document.querySelectorAll('.export-bar, .prompt-section').forEach(el => {
      el.style.display = 'none';
    });
  });
}
