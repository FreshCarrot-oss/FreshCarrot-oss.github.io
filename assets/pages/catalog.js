/* Файл: assets/pages/catalog.js */
/* Рендер каталога тестов с фильтрацией и анимациями */

import { initScrollAnimations } from '../js/animations.js';

// ── Полный список тестов ──────────────────────────────────────
const ALL_TESTS = [
  {
    id: 'pdo',
    name: 'ПДО Личко',
    shortDesc: 'Патохарактерологический диагностический опросник. Определяет тип акцентуации характера по 11 типам.',
    fullDesc: 'Разработан А.Е. Личко. Предназначен для диагностики типов акцентуаций характера и психопатий у подростков и взрослых. Испытуемый выбирает из предложенных утверждений наиболее и наименее подходящие для него. Инструмент широко используется в отечественной психологии и психиатрии.',
    icon: '', time: '30–40 мин', count: '25 наборов',
    category: 'Акцентуации',
    difficulty: 'Средний',
    tags: ['акцентуации', 'характер', 'Личко'],
    color: '#8b5cf6',
    popular: true,
  },
  {
    id: 'mbti',
    name: 'MBTI — 16 типов',
    shortDesc: 'Myers-Briggs Type Indicator. Определяет один из 16 психологических типов по 4 шкалам.',
    fullDesc: 'Один из самых популярных тестов личности в мире. Основан на типологии К.Г. Юнга. Измеряет предпочтения по четырём шкалам: Экстраверсия/Интроверсия, Сенсорика/Интуиция, Мышление/Чувство, Суждение/Восприятие.',
    icon: '', time: '15–20 мин', count: '60 вопросов',
    category: 'Личность',
    difficulty: 'Лёгкий',
    tags: ['личность', '16 типов', 'Юнг'],
    color: '#6366f1',
    popular: true,
  },
  {
    id: 'bigfive',
    name: 'Big Five OCEAN',
    shortDesc: 'Пятифакторная модель личности. Измеряет Открытость, Добросовестность, Экстраверсию, Доброжелательность и Нейротизм.',
    fullDesc: 'Big Five (Большая Пятёрка) — наиболее научно обоснованная модель личности. Разработана рядом учёных в 1980–1990-х годах. Модель OCEAN является "золотым стандартом" в современной психологии личности.',
    icon: '', time: '10–15 мин', count: '50 вопросов',
    category: 'Личность',
    difficulty: 'Лёгкий',
    tags: ['OCEAN', 'факторы', 'научный'],
    color: '#3b82f6',
    popular: true,
  },
  {
    id: 'eysenck',
    name: 'Айзенк (EPI)',
    shortDesc: 'Eysenck Personality Inventory. Определяет тип темперамента по шкалам экстраверсии и нейротизма.',
    fullDesc: 'Разработан Гансом Айзенком в 1963 году. Основан на трёхфакторной модели личности. Позволяет отнести испытуемого к одному из четырёх типов темперамента: Холерик, Сангвиник, Флегматик или Меланхолик.',
    icon: '', time: '10 мин', count: '57 вопросов',
    category: 'Темперамент',
    difficulty: 'Лёгкий',
    tags: ['темперамент', 'EPI', 'Айзенк'],
    color: '#06b6d4',
    popular: false,
  },
  {
    id: 'leonhard',
    name: 'Тест Леонгарда',
    shortDesc: 'Диагностика акцентуаций характера. Выявляет 10 типов акцентуированных личностей.',
    fullDesc: 'Разработан Карлом Леонгардом и модифицирован Х. Шмишеком. Предназначен для выявления акцентуаций характера и темперамента взрослых. Включает 10 шкал, соответствующих 10 типам акцентуированных личностей.',
    icon: '', time: '15–20 мин', count: '88 вопросов',
    category: 'Акцентуации',
    difficulty: 'Средний',
    tags: ['акцентуации', '10 типов', 'Леонгард'],
    color: '#ec4899',
    popular: false,
  },
  {
    id: 'cattell',
    name: '16PF Кеттела',
    shortDesc: 'Многофакторный опросник Кеттела. Измеряет 16 первичных факторов личности по биполярным шкалам.',
    fullDesc: 'Разработан Рэймондом Кеттелом в 1949 году. Один из наиболее известных опросников в психодиагностике. Измеряет 16 факторов личности (стены 1–10), охватывающих широкий спектр личностных черт от общительности до интеллекта.',
    icon: '', time: '30–35 мин', count: '105 вопросов',
    category: 'Личность',
    difficulty: 'Сложный',
    tags: ['16 факторов', 'Кеттел', 'стены'],
    color: '#10b981',
    popular: false,
  },
  {
    id: 'iq',
    name: 'IQ-тест',
    shortDesc: 'Адаптированный тест интеллекта. Числовые, словесные, пространственные и логические задачи с таймером.',
    fullDesc: 'Адаптированный тест интеллекта, включающий задачи четырёх типов: числовые последовательности, словесные аналогии, пространственные паттерны и логические силлогизмы. Результат нормируется по шкале IQ (μ=100, σ=15).',
    icon: '', time: '30 мин (таймер)', count: '40 задач',
    category: 'Интеллект',
    difficulty: 'Сложный',
    tags: ['интеллект', 'IQ', 'таймер'],
    color: '#f59e0b',
    popular: true,
  },
];

const CATEGORIES = ['Все тесты', 'Личность', 'Темперамент', 'Акцентуации', 'Интеллект'];
let activeCategory = 'Все тесты';

// ── Рендер каталога ───────────────────────────────────────────
export function renderCatalogPage() {
  const app = document.getElementById('app');
  if (!app) return;

  app.innerHTML = `
    <div class="page-section" style="position:relative;z-index:10;">
      <div class="container">
        <!-- Заголовок -->
        <div class="section-header animate-on-scroll">
          <span class="section-label">Каталог</span>
          <h1 class="h2">Все тесты</h1>
          <p class="body-lg text-secondary" style="max-width:520px;margin-inline:auto;margin-top:0.75rem;">
            7 научно-валидированных инструментов психодиагностики
          </p>
        </div>

        <!-- Фильтры категорий -->
        <div class="tabs" style="max-width:640px;margin-inline:auto;margin-bottom:2.5rem;" id="categoryFilters">
          ${CATEGORIES.map((cat, i) => `
            <button
              class="tab-btn ${i === 0 ? 'active' : ''}"
              data-category="${cat}"
              onclick="window.__filterTests('${cat}', this)"
            >${cat === 'Все тесты' ? '✦ ' + cat : cat}</button>
          `).join('')}
        </div>

        <!-- Счётчик -->
        <p class="text-muted" style="text-align:center;margin-bottom:1.5rem;font:400 0.875rem var(--font-body);" id="testsCount">
          Показано: ${ALL_TESTS.length} тестов
        </p>

        <!-- Сетка тестов -->
        <div id="testsGrid" style="display:flex;flex-direction:column;gap:1.25rem;">
          ${ALL_TESTS.map(t => renderCatalogCard(t)).join('')}
        </div>
      </div>
    </div>
  `;

  // Регистрируем обработчик фильтра глобально
  window.__filterTests = filterTests;

  requestAnimationFrame(() => initScrollAnimations());
}

// ── Карточка теста в каталоге (расширенная) ──────────────────
function renderCatalogCard(test) {
  const passedRaw = localStorage.getItem(`result_${test.id}`);
  const passed    = !!passedRaw;
  let passedBadge = '';
  if (passed) {
    passedBadge = `<span class="badge badge-green" style="margin-left:auto;"> Пройден</span>`;
  }

  return `
    <div class="glass-card catalog-card animate-on-scroll" data-category="${test.category}" style="padding:0;overflow:hidden;">
      <!-- Верхняя часть карточки -->
      <div style="padding:1.5rem;display:flex;gap:1.25rem;align-items:flex-start;">
        <!-- Иконка -->
        <div style="width:60px;height:60px;border-radius:16px;background:${test.color}22;border:1px solid ${test.color}44;display:flex;align-items:center;justify-content:center;font-size:1.8rem;flex-shrink:0;">${test.icon}</div>
        <!-- Основное содержимое -->
        <div style="flex:1;min-width:0;">
          <div style="display:flex;align-items:center;gap:0.75rem;flex-wrap:wrap;margin-bottom:0.5rem;">
            <h2 class="h5">${test.name}</h2>
            ${test.popular ? `<span class="badge badge-amber"> Популярный</span>` : ''}
            ${passedBadge}
          </div>
          <div style="display:flex;flex-wrap:wrap;gap:0.375rem;margin-bottom:0.75rem;">
            <span class="badge badge-violet">${test.category}</span>
            <span class="badge badge-blue">⏱ ${test.time}</span>
            <span class="badge badge-cyan">${test.count}</span>
            <span class="badge badge-${test.difficulty === 'Лёгкий' ? 'green' : test.difficulty === 'Средний' ? 'amber' : 'red'}">${test.difficulty}</span>
          </div>
          <p class="body-sm text-secondary">${test.shortDesc}</p>
        </div>
        <!-- Кнопка -->
        <div style="flex-shrink:0;">
          <a href="#/test/${test.id}" class="btn-primary btn-sm">Пройти →</a>
        </div>
      </div>

      <!-- Разворачиваемое "Подробнее" -->
      <div style="border-top:1px solid var(--glass-border);">
        <button
          class="btn-ghost"
          style="width:100%;border-radius:0;border:none;padding:0.75rem 1.5rem;justify-content:flex-start;gap:0.5rem;font-size:0.85rem;"
          onclick="window.__toggleDetails('${test.id}', this)"
        >
          <span id="detailsArrow_${test.id}" style="transition:transform 0.3s;">▼</span>
          Подробнее о тесте
        </button>
        <div id="details_${test.id}" class="hidden" style="padding:0 1.5rem 1.5rem;">
          <p class="body-sm text-secondary" style="margin-bottom:1rem;line-height:1.7;">${test.fullDesc}</p>
          <div style="display:flex;flex-wrap:wrap;gap:0.375rem;">
            ${test.tags.map(tag => `<span class="badge badge-violet">#${tag}</span>`).join('')}
          </div>
        </div>
      </div>
    </div>
  `;
}

// ── Фильтрация тестов по категории ───────────────────────────
function filterTests(category, btn) {
  activeCategory = category;

  // Обновляем вкладки
  document.querySelectorAll('#categoryFilters .tab-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.category === category);
  });

  const grid    = document.getElementById('testsGrid');
  const counter = document.getElementById('testsCount');
  const cards   = grid?.querySelectorAll('.catalog-card');
  if (!cards) return;

  let visible = 0;
  cards.forEach(card => {
    const show = category === 'Все тесты' || card.dataset.category === category;
    if (show) {
      card.style.display = '';
      visible++;
      if (window.gsap) {
        gsap.fromTo(card, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.4, ease: 'power3.out' });
      }
    } else {
      if (window.gsap) {
        gsap.to(card, {
          opacity: 0, y: -10, duration: 0.25, ease: 'power2.in',
          onComplete: () => { card.style.display = 'none'; }
        });
      } else {
        card.style.display = 'none';
      }
    }
  });

  if (counter) counter.textContent = `Показано: ${visible} тест${visible === 1 ? '' : visible < 5 ? 'а' : 'ов'}`;
}

// ── Раскрытие/скрытие деталей карточки ───────────────────────
window.__toggleDetails = function(testId, btn) {
  const details = document.getElementById(`details_${testId}`);
  const arrow   = document.getElementById(`detailsArrow_${testId}`);
  if (!details) return;

  const isOpen = !details.classList.contains('hidden');

  if (isOpen) {
    details.classList.add('hidden');
    if (arrow) arrow.style.transform = '';
    btn.querySelector('span:last-child').textContent = 'Подробнее о тесте';
  } else {
    details.classList.remove('hidden');
    if (arrow) arrow.style.transform = 'rotate(180deg)';
    btn.querySelector('span:last-child').textContent = 'Скрыть';
    if (window.gsap) {
      gsap.from(details, { opacity: 0, height: 0, duration: 0.3, ease: 'power3.out' });
    }
  }
};
