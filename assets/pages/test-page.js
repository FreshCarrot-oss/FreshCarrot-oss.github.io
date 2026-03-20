/* Файл: assets/pages/test-page.js */
/* Рендер страницы теста: загрузка конфига, проверка прогресса, инициализация TestEngine */

import { TestEngine }  from '../js/tests/test-engine.js';
import { showToast }   from '../js/ui.js';
import { router }      from '../js/router.js';

// ── Реестр тестов ─────────────────────────────────────────────
const TEST_LOADERS = {
  pdo:      () => import('../js/tests/pdo-lichko.js').then(m => m.pdoConfig),
  mbti:     () => import('../js/tests/mbti.js').then(m => m.mbtiConfig),
  bigfive:  () => import('../js/tests/big-five.js').then(m => m.bigFiveConfig),
  eysenck:  () => import('../js/tests/eysenck.js').then(m => m.eysenckConfig),
  leonhard: () => import('../js/tests/leonhard.js').then(m => m.leonhardConfig),
  cattell:  () => import('../js/tests/cattell.js').then(m => m.cattellConfig),
  iq:       () => import('../js/tests/iq-test.js').then(m => m.iqConfig),
};

// ── Рендер страницы теста ─────────────────────────────────────
export async function renderTestPage(testId) {
  const app = document.getElementById('app');
  if (!app) return;

  // Проверка наличия теста
  if (!TEST_LOADERS[testId]) {
    app.innerHTML = `
      <div style="min-height:80vh;display:flex;align-items:center;justify-content:center;text-align:center;padding:2rem;">
        <div>
          <div style="font-size:3rem;margin-bottom:1rem;">🔍</div>
          <h2 class="h3" style="margin-bottom:0.75rem;">Тест не найден</h2>
          <p class="text-secondary" style="margin-bottom:1.5rem;">Тест «${testId}» не существует</p>
          <a href="#/tests" class="btn-primary">← Все тесты</a>
        </div>
      </div>
    `;
    return;
  }

  // Скелетон-загрузка
  app.innerHTML = `
    <div class="test-page" style="position:relative;z-index:10;">
      <div class="test-progress-bar">
        <div class="test-progress-inner">
          <div class="test-progress-info">
            <span class="test-progress-label">Загрузка...</span>
          </div>
          <div class="progress-bar">
            <div class="progress-fill" style="width:0%"></div>
          </div>
        </div>
      </div>
      <div class="question-container" style="margin-top:2rem;">
        <div class="glass-card skeleton-card" style="padding:2rem;">
          <div class="skeleton skeleton-block" style="width:30%;height:12px;margin-bottom:1rem;"></div>
          <div class="skeleton skeleton-block" style="width:90%;height:22px;margin-bottom:0.5rem;"></div>
          <div class="skeleton skeleton-block" style="width:75%;height:22px;margin-bottom:2rem;"></div>
          ${[1,2,3].map(() => `
            <div class="skeleton skeleton-block" style="height:52px;border-radius:12px;margin-bottom:0.75rem;"></div>
          `).join('')}
        </div>
      </div>
    </div>
  `;

  // Загружаем конфиг теста
  let testConfig;
  try {
    testConfig = await TEST_LOADERS[testId]();
  } catch (err) {
    showToast('Ошибка загрузки теста', 'error');
    console.error('Ошибка загрузки теста:', err);
    app.innerHTML = `
      <div style="min-height:80vh;display:flex;align-items:center;justify-content:center;text-align:center;padding:2rem;">
        <div>
          <div style="font-size:3rem;margin-bottom:1rem;">⚠️</div>
          <h2 class="h3" style="margin-bottom:0.75rem;">Ошибка загрузки</h2>
          <p class="text-secondary" style="margin-bottom:1.5rem;">${err.message}</p>
          <a href="#/tests" class="btn-primary">← Все тесты</a>
        </div>
      </div>
    `;
    return;
  }

  // Проверяем сохранённый прогресс
  const savedProgress = localStorage.getItem(`progress_${testId}`);
  const hasSaved = !!savedProgress;

  // Рендерим полную страницу
  app.innerHTML = `
    <div class="test-page" style="position:relative;z-index:10;">
      <!-- Прогресс-бар (sticky) -->
      <div class="test-progress-bar">
        <div class="test-progress-inner">
          <div class="test-progress-info">
            <div style="display:flex;align-items:center;gap:0.75rem;">
              <a href="#/tests" class="text-muted" style="font:400 0.8rem var(--font-body);text-decoration:none;" title="Выйти из теста">← ${testConfig.shortName}</a>
              <span class="text-muted" style="font:400 0.75rem var(--font-body);">${testConfig.name}</span>
            </div>
            <div style="display:flex;align-items:center;gap:1rem;">
              <span class="test-progress-label">0% завершено</span>
              <span class="test-progress-count">1 / ${testConfig.questions.length}</span>
            </div>
          </div>
          <div class="progress-bar" style="margin-top:0.5rem;">
            <div class="progress-fill" style="width:0%"></div>
          </div>
        </div>
      </div>

      <div style="height:1rem;"></div>

      <!-- Баннер восстановления прогресса -->
      ${hasSaved ? `
        <div class="restore-progress-banner animate-on-scroll">
          <div>
            <span style="font:500 0.9rem var(--font-body);color:var(--text-primary);">💾 Найден сохранённый прогресс</span>
            <span class="text-muted" style="font:400 0.8rem var(--font-body);display:block;margin-top:0.25rem;">Хотите продолжить с места остановки?</span>
          </div>
          <div style="display:flex;gap:0.5rem;">
            <button class="btn-primary btn-sm" id="continueBtn">Продолжить</button>
            <button class="btn-ghost btn-sm" id="restartBtn">Начать заново</button>
          </div>
        </div>
      ` : ''}

      <!-- Контейнер вопроса -->
      <div class="question-container" id="questionContainer"></div>
    </div>
  `;

  // Создаём движок
  const engine = new TestEngine(testConfig);

  // Обработчики восстановления прогресса
  if (hasSaved) {
    document.getElementById('continueBtn')?.addEventListener('click', () => {
      document.querySelector('.restore-progress-banner')?.remove();
      engine.init(document.getElementById('questionContainer'));
    });

    document.getElementById('restartBtn')?.addEventListener('click', () => {
      localStorage.removeItem(`progress_${testId}`);
      document.querySelector('.restore-progress-banner')?.remove();
      engine.answers    = {};
      engine.currentIdx = 0;
      engine.startTime  = Date.now();
      engine.init(document.getElementById('questionContainer'));
    });

    // По умолчанию — ждём выбора пользователя, показываем только баннер
  } else {
    // Сразу инициализируем движок
    engine.init(document.getElementById('questionContainer'));
  }

  // Таймер для IQ-теста
  if (testId === 'iq') {
    const IQ_SECONDS = 30 * 60; // 30 минут

    const startIQTimer = () => {
      engine.startTimer(
        IQ_SECONDS,
        (remaining) => {
          const timerEl = document.getElementById('iqTimer');
          if (!timerEl) return;
          const m = Math.floor(remaining / 60);
          const s = remaining % 60;
          const timeStr = `⏱ ${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
          timerEl.textContent = timeStr;
          timerEl.className = 'iq-timer' +
            (remaining <= 60 ? ' danger' : remaining <= 300 ? ' warning' : '');
        },
        () => {
          showToast('⏱ Время вышло! Результат подсчитывается...', 'warn');
          engine.finish();
        }
      );
    };

    // Запускаем таймер после инициализации движка
    setTimeout(startIQTimer, 200);
  }
}
