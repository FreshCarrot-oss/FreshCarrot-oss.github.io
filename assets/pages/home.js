/* assets/pages/home.js — Главная страница (без эмодзи, без SVG-мозга) */

import { animateHero, initScrollAnimations, animateStepsLine } from '../js/animations.js';

const HOME_TESTS = [
  { id:'pdo',      name:'ПДО Личко',    desc:'Патохарактерологический диагностический опросник. Определяет тип акцентуации характера.', time:'30–40 мин', count:'25 наборов', tags:['акцентуации','характер'], color:'#8b5cf6', category:'Акцентуации' },
  { id:'mbti',     name:'MBTI',          desc:'Myers-Briggs Type Indicator. Определяет один из 16 психологических типов личности.', time:'15–20 мин', count:'60 вопросов', tags:['личность','16 типов'], color:'#6366f1', category:'Личность' },
  { id:'bigfive',  name:'Big Five',      desc:'Пятифакторная модель личности OCEAN. Измеряет пять ключевых черт характера.', time:'10–15 мин', count:'50 вопросов', tags:['OCEAN','факторы'], color:'#3b82f6', category:'Личность' },
  { id:'eysenck',  name:'Айзенк (EPI)', desc:'Eysenck Personality Inventory. Определяет тип темперамента: холерик, сангвиник, флегматик или меланхолик.', time:'10 мин', count:'57 вопросов', tags:['темперамент','EPI'], color:'#06b6d4', category:'Темперамент' },
  { id:'leonhard', name:'Тест Леонгарда', desc:'Диагностика акцентуаций характера по Леонгарду. Выявляет 10 типов акцентуированных личностей.', time:'15–20 мин', count:'88 вопросов', tags:['акцентуации','10 типов'], color:'#ec4899', category:'Акцентуации' },
  { id:'cattell',  name:'16PF Кеттела', desc:'Многофакторный личностный опросник Кеттела. Измеряет 16 первичных факторов личности.', time:'30–35 мин', count:'105 вопросов', tags:['16 факторов','личность'], color:'#10b981', category:'Личность' },
  { id:'iq',       name:'IQ-тест',       desc:'Адаптированный тест интеллекта. Числовые, словесные, пространственные и логические задачи.', time:'30 мин', count:'40 задач', tags:['интеллект','таймер'], color:'#f59e0b', category:'Интеллект' },
];

const ICON_MAP = {
  pdo:      '<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="4" fill="currentColor" opacity=".8"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
  mbti:     '<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="8" height="8" rx="2" fill="currentColor" opacity=".8"/><rect x="13" y="3" width="8" height="8" rx="2" fill="currentColor" opacity=".5"/><rect x="3" y="13" width="8" height="8" rx="2" fill="currentColor" opacity=".5"/><rect x="13" y="13" width="8" height="8" rx="2" fill="currentColor" opacity=".8"/></svg>',
  bigfive:  '<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M2 12 Q6 4 12 8 Q18 12 22 6" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" fill="none"/><path d="M2 18 Q6 10 12 14 Q18 18 22 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" fill="none" opacity=".5"/></svg>',
  eysenck:  '<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><polygon points="12,3 20,20 4,20" fill="currentColor" opacity=".8"/></svg>',
  leonhard: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2"/><path d="M12 3v9l6 3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
  cattell:  '<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="3" fill="currentColor"/><circle cx="12" cy="12" r="7" stroke="currentColor" stroke-width="1.5"/><circle cx="12" cy="12" r="10.5" stroke="currentColor" stroke-width="1" opacity=".4"/></svg>',
  iq:       '<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M12 2a6 6 0 0 1 6 6c0 2.4-1.4 4.5-3.5 5.5V16h-5v-2.5C7.4 12.5 6 10.4 6 8a6 6 0 0 1 6-6z" fill="currentColor" opacity=".8"/><rect x="9" y="17" width="6" height="2" rx="1" fill="currentColor" opacity=".6"/><rect x="10" y="20" width="4" height="2" rx="1" fill="currentColor" opacity=".4"/></svg>',
};

export function renderHomePage() {
  const app = document.getElementById('app');
  if (!app) return;

  app.innerHTML = `
    <!-- Hero -->
    <section class="hero-section page-section" style="padding-top:clamp(3rem,8vw,6rem);position:relative;z-index:10;">
      <div class="container">
        <div class="hero-content-only">
          <div class="hero-label section-label" style="opacity:0;">
            Научные тесты личности
          </div>
          <h1 class="h1 hero-title" style="opacity:0;margin:0.75rem 0 1rem;">
            Познай себя<br />
            <span class="gradient-text">глубже, чем<br class="mobile-break"/>ты думал</span>
          </h1>
          <p class="body-lg text-secondary hero-subtitle" style="opacity:0;margin-bottom:2rem;max-width:560px;">
            Научные тесты личности с AI-анализом и красивой визуализацией. 7 проверенных инструментов психодиагностики.
          </p>
          <div class="hero-btns" style="opacity:0;display:flex;gap:1rem;flex-wrap:wrap;">
            <a href="#/tests" class="btn-primary glow" style="font-size:1.05rem;padding:0.875rem 2.25rem;">
              Начать тестирование
            </a>
            <a href="#about-how" class="btn-ghost" style="font-size:1.05rem;padding:0.875rem 2rem;"
               onclick="document.getElementById('about-how')?.scrollIntoView({behavior:'smooth'});return false;">
              Узнать больше
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
        <div class="tests-grid">
          ${HOME_TESTS.map(t => renderTestCard(t)).join('')}
        </div>
        <div style="text-align:center;margin-top:2.5rem;">
          <a href="#/tests" class="btn-ghost">Смотреть все тесты</a>
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
        <div class="steps-grid">
          ${[
            { num:'01', title:'Выберите тест', desc:'Из 7 научно-валидированных инструментов психодиагностики. Каждый тест измеряет свой аспект личности.' },
            { num:'02', title:'Отвечайте честно', desc:'Среднее время прохождения 10–30 минут. Нет правильных или неправильных ответов.' },
            { num:'03', title:'Получите анализ', desc:'Красивые графики, AI-промпт, советы и рекомендации. Все результаты сохраняются в кабинете.' },
          ].map(step => `
            <div class="animate-on-scroll glass-card no-hover" style="padding:2rem 1.5rem;">
              <div class="step-num gradient-text" style="font:800 2.5rem var(--font-display);margin-bottom:0.75rem;opacity:0.7;">${step.num}</div>
              <h3 class="h5" style="margin-bottom:0.75rem;">${step.title}</h3>
              <p class="body-sm text-secondary">${step.desc}</p>
            </div>
          `).join('')}
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
        <div class="features-grid">
          ${[
            { title:'Научная база', desc:'Все 7 тестов имеют академическое происхождение и используются психологами по всему миру', color:'#8b5cf6',
              svg:'<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2"/><path d="M9 12l2 2 4-4" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/></svg>' },
            { title:'Красивая визуализация', desc:'Интерактивные графики Chart.js, анимированные шкалы и glassmorphism-дизайн', color:'#3b82f6',
              svg:'<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><rect x="3" y="12" width="4" height="9" rx="1" fill="currentColor"/><rect x="10" y="7" width="4" height="14" rx="1" fill="currentColor" opacity=".7"/><rect x="17" y="3" width="4" height="18" rx="1" fill="currentColor" opacity=".5"/></svg>' },
            { title:'AI-анализ', desc:'Генерируем структурированный промпт — вставляете его в ChatGPT, Claude или Gemini в своём аккаунте', color:'#06b6d4',
              svg:'<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><rect x="3" y="5" width="18" height="14" rx="3" stroke="currentColor" stroke-width="2"/><circle cx="9" cy="12" r="2" fill="currentColor" opacity=".7"/><circle cx="15" cy="12" r="2" fill="currentColor" opacity=".7"/></svg>' },
            { title:'Личный архив', desc:'Все результаты сохраняются в Firebase. Доступны с любого устройства в любое время', color:'#10b981',
              svg:'<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M4 6h16v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6z" stroke="currentColor" stroke-width="2"/><path d="M4 6l8-3 8 3" stroke="currentColor" stroke-width="2"/></svg>' },
          ].map(f => `
            <div class="glass-card animate-on-scroll" style="padding:1.75rem;display:flex;gap:1.25rem;align-items:flex-start;">
              <div style="width:52px;height:52px;border-radius:14px;background:${f.color}22;border:1px solid ${f.color}44;display:flex;align-items:center;justify-content:center;color:${f.color};flex-shrink:0;">${f.svg}</div>
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
              Создать аккаунт бесплатно
            </a>
            <a href="#/tests" class="btn-ghost" style="font-size:1.05rem;">
              Начать без регистрации
            </a>
          </div>
        </div>
      </div>
    </section>
  `;

  requestAnimationFrame(() => {
    animateHero();
    initScrollAnimations();
    animateStepsLine();
  });
}

function renderTestCard(t) {
  return `
    <a href="#/test/${t.id}" class="test-card glass-card" style="text-decoration:none;display:block;">
      <div class="test-card-icon" style="width:52px;height:52px;border-radius:14px;background:${t.color}22;border:1px solid ${t.color}44;display:flex;align-items:center;justify-content:center;color:${t.color};">${ICON_MAP[t.id]||''}</div>
      <div class="test-card-tags">
        <span class="badge badge-violet">${t.category}</span>
        <span class="badge badge-blue">${t.time}</span>
        <span class="badge badge-cyan">${t.count}</span>
      </div>
      <h3 class="test-card-name">${t.name}</h3>
      <p class="test-card-desc">${t.desc}</p>
      <div class="test-card-footer">
        <span class="text-muted" style="font:400 0.8rem var(--font-body);">${t.tags.map(tag => '#'+tag).join(' ')}</span>
        <span class="text-accent" style="font:600 0.875rem var(--font-body);">Пройти</span>
      </div>
    </a>
  `;
}
