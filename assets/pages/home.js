/* Файл: assets/pages/home.js */
/* Рендер главной страницы: Hero, тесты, шаги, преимущества, CTA */

import { animateHero, initScrollAnimations, animateStepsLine } from '../js/animations.js';

// ── Конфиг карточек тестов для главной ───────────────────────
const HOME_TESTS = [
  {
    id: 'pdo',
    name: 'ПДО Личко',
    desc: 'Патохарактерологический диагностический опросник. Определяет тип акцентуации характера.',
    icon: '🎭',
    time: '30–40 мин',
    count: '25 наборов',
    tags: ['акцентуации', 'характер'],
    color: '#8b5cf6',
    category: 'Акцентуации',
  },
  {
    id: 'mbti',
    name: 'MBTI',
    desc: 'Myers-Briggs Type Indicator. Определяет один из 16 психологических типов личности.',
    icon: '🧩',
    time: '15–20 мин',
    count: '60 вопросов',
    tags: ['личность', '16 типов'],
    color: '#6366f1',
    category: 'Личность',
  },
  {
    id: 'bigfive',
    name: 'Big Five',
    desc: 'Пятифакторная модель личности OCEAN. Измеряет пять ключевых черт характера.',
    icon: '🌊',
    time: '10–15 мин',
    count: '50 вопросов',
    tags: ['OCEAN', 'факторы'],
    color: '#3b82f6',
    category: 'Личность',
  },
  {
    id: 'eysenck',
    name: 'Айзенк (EPI)',
    desc: 'Eysenck Personality Inventory. Определяет тип темперамента: холерик, сангвиник, флегматик или меланхолик.',
    icon: '🔥',
    time: '10 мин',
    count: '57 вопросов',
    tags: ['темперамент', 'EPI'],
    color: '#06b6d4',
    category: 'Темперамент',
  },
  {
    id: 'leonhard',
    name: 'Тест Леонгарда',
    desc: 'Диагностика акцентуаций характера по Леонгарду. Выявляет 10 типов акцентуированных личностей.',
    icon: '🌗',
    time: '15–20 мин',
    count: '88 вопросов',
    tags: ['акцентуации', '10 типов'],
    color: '#ec4899',
    category: 'Акцентуации',
  },
  {
    id: 'cattell',
    name: '16PF Кеттела',
    desc: 'Многофакторный личностный опросник Кеттела. Измеряет 16 первичных факторов личности.',
    icon: '🔬',
    time: '30–35 мин',
    count: '105 вопросов',
    tags: ['16 факторов', 'личность'],
    color: '#10b981',
    category: 'Личность',
  },
  {
    id: 'iq',
    name: 'IQ-тест',
    desc: 'Адаптированный тест интеллекта. Числовые, словесные, пространственные и логические задачи.',
    icon: '🧠',
    time: '30 мин',
    count: '40 задач',
    tags: ['интеллект', 'таймер'],
    color: '#f59e0b',
    category: 'Интеллект',
  },
];

// ── Рендер главной страницы ───────────────────────────────────
export function renderHomePage() {
  const app = document.getElementById('app');
  if (!app) return;

  app.innerHTML = `
    <!-- Hero -->
    <section class="hero-section page-section" style="padding-top:clamp(3rem,8vw,6rem);position:relative;z-index:10;overflow:hidden;">
      <div class="container">
        <div class="hero-inner" style="display:grid;grid-template-columns:1fr 1fr;gap:4rem;align-items:center;">
          <!-- Левая часть -->
          <div class="hero-content">
            <div class="hero-label section-label" style="opacity:0;">
              🧪 Научные тесты личности
            </div>
            <h1 class="h1 hero-title" style="opacity:0;margin:0.75rem 0 1rem;">
              Познай себя<br />
              <span class="gradient-text">глубже, чем<br />ты думал</span>
            </h1>
            <p class="body-lg text-secondary hero-subtitle" style="opacity:0;margin-bottom:2rem;max-width:480px;">
              Научные тесты личности с AI-анализом и красивой визуализацией. 7 проверенных инструментов психодиагностики.
            </p>
            <div class="hero-btns" style="opacity:0;display:flex;gap:1rem;flex-wrap:wrap;">
              <a href="#/tests" class="btn-primary glow" style="font-size:1.05rem;padding:0.875rem 2.25rem;">
                Начать тестирование ▶
              </a>
              <a href="#about-how" class="btn-ghost" style="font-size:1.05rem;padding:0.875rem 2rem;"
                 onclick="document.getElementById('about-how')?.scrollIntoView({behavior:'smooth'});return false;">
                Узнать больше ↓
              </a>
            </div>
            <div class="hero-stats" style="opacity:0;display:flex;gap:2rem;margin-top:2.5rem;flex-wrap:wrap;">
              <div class="hero-stat">
                <span class="stat-number gradient-text" style="font:700 1.75rem var(--font-display);" data-target="7">0</span>
                <span class="text-muted" style="font:400 0.85rem var(--font-body);display:block;">научных тестов</span>
              </div>
              <div class="hero-stat">
                <span class="stat-number gradient-text" style="font:700 1.75rem var(--font-display);" data-target="16">0</span>
                <span class="text-muted" style="font:400 0.85rem var(--font-body);display:block;">типов MBTI</span>
              </div>
              <div class="hero-stat">
                <span class="stat-number gradient-text" style="font:700 1.75rem var(--font-display);" data-target="100">0</span>
                <span class="text-muted" style="font:400 0.85rem var(--font-body);display:block;">% бесплатно</span>
              </div>
            </div>
          </div>
          <!-- Правая часть — анимированный мозг -->
          <div class="hero-visual" style="display:flex;align-items:center;justify-content:center;">
            <div style="position:relative;width:320px;height:320px;perspective:800px;">
              <div class="hero-brain-wrap" style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;">
                ${heroBrainSVG()}
              </div>
              <!-- Декоративные орбы вокруг мозга -->
              <div style="position:absolute;top:20px;right:30px;width:60px;height:60px;border-radius:50%;background:rgba(139,92,246,0.15);border:1px solid rgba(139,92,246,0.3);display:flex;align-items:center;justify-content:center;font-size:1.5rem;animation:float 4s ease-in-out infinite;">🧩</div>
              <div style="position:absolute;bottom:30px;left:20px;width:50px;height:50px;border-radius:50%;background:rgba(59,130,246,0.15);border:1px solid rgba(59,130,246,0.3);display:flex;align-items:center;justify-content:center;font-size:1.3rem;animation:float 5s ease-in-out infinite -2s;">📊</div>
              <div style="position:absolute;top:50%;left:-20px;width:44px;height:44px;border-radius:50%;background:rgba(6,182,212,0.15);border:1px solid rgba(6,182,212,0.3);display:flex;align-items:center;justify-content:center;font-size:1.2rem;animation:float 6s ease-in-out infinite -4s;">🤖</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Тесты -->
    <section class="page-section" id="tests-section" style="position:relative;z-index:10;">
      <div class="container">
        <div class="section-header animate-on-scroll">
          <span class="section-label">Инструменты</span>
          <h2 class="h2">7 научных тестов</h2>
          <p class="body-lg text-secondary" style="max-width:520px;margin-inline:auto;margin-top:0.75rem;">
            Все инструменты имеют академическое происхождение и широко используются в психологической практике
          </p>
        </div>
        <div class="tests-grid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:1.25rem;">
          ${HOME_TESTS.map(t => renderTestCard(t)).join('')}
        </div>
        <div style="text-align:center;margin-top:2.5rem;">
          <a href="#/tests" class="btn-ghost">Смотреть все тесты →</a>
        </div>
      </div>
    </section>

    <!-- Как это работает -->
    <section class="page-section steps-section" id="about-how" style="position:relative;z-index:10;background:rgba(255,255,255,0.01);">
      <div class="container">
        <div class="section-header animate-on-scroll">
          <span class="section-label">Процесс</span>
          <h2 class="h2">Как это работает</h2>
        </div>
        <div style="position:relative;">
          <!-- Линия между шагами -->
          <div style="position:absolute;top:48px;left:calc(16.66% + 24px);right:calc(16.66% + 24px);height:2px;background:rgba(255,255,255,0.05);border-radius:1px;display:none;" class="steps-line-bg">
            <div class="steps-line-fill" style="height:100%;background:var(--grad-primary);border-radius:1px;width:0;"></div>
          </div>
          <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:2rem;text-align:center;">
            ${[
              { num: '①', icon: '🎯', title: 'Выберите тест', desc: 'Из 7 научно-валидированных инструментов психодиагностики. Каждый тест измеряет свой аспект личности.' },
              { num: '②', icon: '✍️', title: 'Отвечайте честно', desc: 'Среднее время прохождения 10–30 минут. Нет правильных или неправильных ответов.' },
              { num: '③', icon: '📊', title: 'Получите анализ', desc: 'Красивые графики, AI-промпт, советы и рекомендации. Все результаты сохраняются в кабинете.' },
            ].map(step => `
              <div class="animate-on-scroll glass-card no-hover" style="padding:2rem 1.5rem;">
                <div style="font-size:2.5rem;margin-bottom:0.75rem;">${step.icon}</div>
                <h3 class="h5" style="margin-bottom:0.75rem;">${step.title}</h3>
                <p class="body-sm text-secondary">${step.desc}</p>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    </section>

    <!-- Преимущества -->
    <section class="page-section" style="position:relative;z-index:10;">
      <div class="container">
        <div class="section-header animate-on-scroll">
          <span class="section-label">Преимущества</span>
          <h2 class="h2">Почему PsychoTest?</h2>
        </div>
        <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:1.25rem;">
          ${[
            { icon: '🔬', title: 'Научная база', desc: 'Все 7 тестов имеют академическое происхождение и используются психологами по всему миру', color: '#8b5cf6' },
            { icon: '🎨', title: 'Красивая визуализация', desc: 'Интерактивные графики Chart.js, анимированные шкалы и glassmorphism-дизайн', color: '#3b82f6' },
            { icon: '🤖', title: 'AI-анализ без рисков', desc: 'Генерируем структурированный промпт — вы вставляете его в ChatGPT, Claude или Gemini в своём аккаунте', color: '#06b6d4' },
            { icon: '📁', title: 'Личный архив', desc: 'Все результаты сохраняются в Firebase. Доступны с любого устройства в любое время', color: '#10b981' },
          ].map(f => `
            <div class="glass-card animate-on-scroll" style="padding:1.75rem;display:flex;gap:1.25rem;align-items:flex-start;">
              <div style="width:52px;height:52px;border-radius:14px;background:${f.color}22;border:1px solid ${f.color}44;display:flex;align-items:center;justify-content:center;font-size:1.5rem;flex-shrink:0;">${f.icon}</div>
              <div>
                <h3 class="h5" style="margin-bottom:0.5rem;">${f.title}</h3>
                <p class="body-sm text-secondary">${f.desc}</p>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="page-section" style="position:relative;z-index:10;">
      <div class="container">
        <div class="glass-card no-hover animate-on-scroll" style="padding:clamp(2.5rem,6vw,4rem);text-align:center;background:linear-gradient(135deg,rgba(139,92,246,0.12),rgba(59,130,246,0.08));border-color:rgba(139,92,246,0.2);">
          <h2 class="h2" style="margin-bottom:1rem;">Готовы узнать себя?</h2>
          <p class="body-lg text-secondary" style="margin-bottom:2rem;max-width:480px;margin-inline:auto;">
            Зарегистрируйтесь бесплатно и получите полный AI-анализ своей личности
          </p>
          <div style="display:flex;gap:1rem;justify-content:center;flex-wrap:wrap;">
            <a href="#/register" class="btn-primary glow" style="font-size:1.05rem;padding:0.875rem 2.5rem;">
              Создать аккаунт бесплатно →
            </a>
            <a href="#/tests" class="btn-ghost" style="font-size:1.05rem;">
              Начать без регистрации
            </a>
          </div>
        </div>
      </div>
    </section>
  `;

  // Запускаем анимации Hero
  requestAnimationFrame(() => {
    animateHero();
    initScrollAnimations();
    animateStepsLine();
  });
}

// ── Карточка теста ────────────────────────────────────────────
function renderTestCard(t) {
  return `
    <a href="#/test/${t.id}" class="test-card glass-card" style="text-decoration:none;display:block;">
      <div class="test-card-icon" style="width:52px;height:52px;border-radius:14px;background:${t.color}22;border:1px solid ${t.color}44;display:flex;align-items:center;justify-content:center;font-size:1.6rem;">${t.icon}</div>
      <div class="test-card-tags">
        <span class="badge badge-violet">${t.category}</span>
        <span class="badge badge-blue">⏱ ${t.time}</span>
        <span class="badge badge-cyan">${t.count}</span>
      </div>
      <h3 class="test-card-name">${t.name}</h3>
      <p class="test-card-desc">${t.desc}</p>
      <div class="test-card-footer">
        <span class="text-muted" style="font:400 0.8rem var(--font-body);">
          ${t.tags.map(tag => `#${tag}`).join(' ')}
        </span>
        <span class="text-accent" style="font:600 0.875rem var(--font-body);">Пройти →</span>
      </div>
    </a>
  `;
}

// ── SVG анимированного мозга ──────────────────────────────────
function heroBrainSVG() {
  return `
    <svg viewBox="0 0 200 200" width="260" height="260" style="animation:brainRotate 20s linear infinite;filter:drop-shadow(0 0 30px rgba(139,92,246,0.4));" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="brainGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#8b5cf6"/>
          <stop offset="50%" style="stop-color:#6366f1"/>
          <stop offset="100%" style="stop-color:#3b82f6"/>
        </linearGradient>
        <linearGradient id="brainGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#06b6d4"/>
          <stop offset="100%" style="stop-color:#8b5cf6"/>
        </linearGradient>
      </defs>
      <!-- Левое полушарие -->
      <path d="M100 40 C65 40 35 65 35 100 C35 125 45 145 60 158 C70 166 82 170 95 170 L100 170 L100 40Z"
            fill="url(#brainGrad)" opacity="0.9"/>
      <!-- Правое полушарие -->
      <path d="M100 40 C135 40 165 65 165 100 C165 125 155 145 140 158 C130 166 118 170 105 170 L100 170 L100 40Z"
            fill="url(#brainGrad2)" opacity="0.9"/>
      <!-- Борозды левого полушария -->
      <path d="M60 80 Q75 70 85 85 Q80 100 70 95" stroke="rgba(255,255,255,0.3)" fill="none" stroke-width="2" stroke-linecap="round"/>
      <path d="M45 110 Q60 105 68 120 Q62 135 50 128" stroke="rgba(255,255,255,0.3)" fill="none" stroke-width="2" stroke-linecap="round"/>
      <path d="M55 145 Q68 138 78 152" stroke="rgba(255,255,255,0.25)" fill="none" stroke-width="1.5" stroke-linecap="round"/>
      <!-- Борозды правого полушария -->
      <path d="M140 80 Q125 70 115 85 Q120 100 130 95" stroke="rgba(255,255,255,0.3)" fill="none" stroke-width="2" stroke-linecap="round"/>
      <path d="M155 110 Q140 105 132 120 Q138 135 150 128" stroke="rgba(255,255,255,0.3)" fill="none" stroke-width="2" stroke-linecap="round"/>
      <path d="M145 145 Q132 138 122 152" stroke="rgba(255,255,255,0.25)" fill="none" stroke-width="1.5" stroke-linecap="round"/>
      <!-- Разделительная линия (мозолистое тело) -->
      <line x1="100" y1="45" x2="100" y2="168" stroke="rgba(255,255,255,0.4)" stroke-width="2" stroke-dasharray="4 3"/>
      <!-- Блики -->
      <ellipse cx="75" cy="65" rx="15" ry="10" fill="rgba(255,255,255,0.12)" transform="rotate(-20,75,65)"/>
      <ellipse cx="130" cy="65" rx="12" ry="8" fill="rgba(255,255,255,0.1)" transform="rotate(20,130,65)"/>
      <!-- Свечение центра -->
      <circle cx="100" cy="105" r="8" fill="rgba(255,255,255,0.15)"/>
      <circle cx="100" cy="105" r="4" fill="rgba(255,255,255,0.3)"/>
    </svg>
  `;
}
