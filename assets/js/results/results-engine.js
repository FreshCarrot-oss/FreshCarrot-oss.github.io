/* Файл: assets/js/results/results-engine.js */
/* Рендер страницы результатов: GSAP timeline, графики, описание, экспорт, промпт */

import { createChart, renderMBTIScales, createIQBellCurve } from './charts.js';
import { getResultDescription, BIG_FIVE_DESCRIPTIONS }
  from './descriptions.js';
import { downloadResultPDF, handleShareResult, handleCopyResult, generateShareURL }
  from './export.js';
import { renderPromptBlock } from '../prompt-generator.js';
import { animateResultsPage } from '../animations.js';
import { formatDate }         from '../ui.js';

// ── Глобальные обработчики для inline onclick ─────────────────
window.__downloadPDF  = (testId) => downloadResultPDF(testId, window.__currentResult);
window.__shareResult  = (testId) => handleShareResult(testId, window.__currentResult);
window.__copyResult   = (testId) => handleCopyResult(testId, window.__currentResult);
window.__retryTest    = (testId) => { window.location.hash = '#/test/' + testId; };

// ── Названия тестов ───────────────────────────────────────────
const TEST_NAMES = {
  pdo:'ПДО Личко', mbti:'MBTI', bigfive:'Big Five OCEAN',
  eysenck:'EPI Айзенка', leonhard:'Тест Леонгарда',
  cattell:'16PF Кеттела', iq:'IQ-тест',
};

// ── Главная функция рендера страницы результатов ─────────────
export function renderResultPage(testId, result) {
  const app = document.getElementById('app');
  if (!app) return;

  window.__currentResult  = result;
  window.__currentResults = window.__currentResults || {};
  window.__currentResults[testId] = result;

  const testName    = TEST_NAMES[testId] || testId;
  const desc        = getResultDescription(testId, result);
  const heroContent = buildHeroContent(testId, result);
  const chartSection= buildChartSection(testId, result);
  const descSection = buildDescriptionSection(testId, result, desc);
  const strengthsSection = buildStrengthsSection(desc);
  const careerSection    = buildCareerSection(desc);
  const exportBar        = renderExportBar(testId);
  const promptSection    = renderPromptBlock({ [testId]: result });

  app.innerHTML = `
    <div class="results-page">
      <div class="results-container">

        <!-- Hero результата -->
        <div class="result-hero glass-card">
          <div class="result-complete-badge">✓ Тест завершён</div>
          ${heroContent}
        </div>

        <!-- Основная сетка: шкалы + описание -->
        <div class="results-grid">
          ${chartSection}
          ${descSection}
        </div>

        <!-- Детальный Chart.js график -->
        ${buildDetailedChart(testId, result)}

        <!-- Сильные стороны + Зоны роста -->
        ${strengthsSection}

        <!-- Карьера (только для MBTI) -->
        ${careerSection}

        <!-- Промпт для AI-анализа -->
        ${promptSection}

        <!-- Export Bar -->
        ${exportBar}

      </div>
    </div>
  `;

  // После вставки HTML — рендерим графики
  requestAnimationFrame(() => {
    renderCharts(testId, result);
    animateResultsPage();
  });
}

// ── Hero: тип/результат + краткие теги ───────────────────────
function buildHeroContent(testId, result) {
  switch (testId) {
    case 'mbti':
      return `
        <div class="result-type-label">${result.type}</div>
        <div class="result-type-name">«${result.typeName}»</div>
        <div class="result-type-tags">
          ${getTypeTagsMBTI(result.type).map(t => `<span class="badge badge-violet">${t}</span>`).join('')}
        </div>
      `;
    case 'bigfive':
      return `
        <div class="result-type-label" style="font-size:clamp(1.5rem,4vw,2.5rem);">OCEAN</div>
        <div class="result-type-name">Ваш профиль Big Five</div>
        <div class="result-type-tags">
          ${['O','C','E','A','N'].map(f => `<span class="badge badge-blue">${f}: ${result.percentages?.[f] || 0}%</span>`).join('')}
        </div>
      `;
    case 'eysenck':
      return `
        <div class="result-type-label">${result.temperament}</div>
        <div class="result-type-name">Ваш тип темперамента</div>
        <div class="result-type-tags">
          <span class="badge badge-cyan">E = ${result.E}/24</span>
          <span class="badge badge-violet">N = ${result.N}/24</span>
          ${result.valid ? '<span class="badge badge-green">✓ Достоверно</span>' : '<span class="badge badge-amber">⚠ L > 4</span>'}
        </div>
      `;
    case 'pdo':
      return `
        <div class="result-type-label" style="font-size:clamp(1.5rem,4vw,3rem);">${result.profile || result.leading?.slice(0,2) || 'ПДО'}</div>
        <div class="result-type-name">${result.leading}</div>
        <div class="result-type-tags">
          ${result.secondary ? `<span class="badge badge-violet">+ ${result.secondary}</span>` : ''}
          ${(result.background || []).map(b => `<span class="badge badge-blue">${b}</span>`).join('')}
        </div>
      `;
    case 'leonhard': {
      const top = Object.entries(result.scores || {}).sort((a,b) => b[1]-a[1])[0];
      return `
        <div class="result-type-label" style="font-size:clamp(1.5rem,4vw,2.5rem);">${top?.[0] || '—'}</div>
        <div class="result-type-name">Ведущая акцентуация</div>
        <div class="result-type-tags">
          ${Object.entries(result.levels||{}).filter(([,l])=>l==='strong').map(([k])=>`<span class="badge badge-red">${k}: выраженная</span>`).join('')}
          ${Object.entries(result.levels||{}).filter(([,l])=>l==='accent').map(([k])=>`<span class="badge badge-amber">${k}: акцентуация</span>`).join('')}
        </div>
      `;
    }
    case 'cattell':
      return `
        <div class="result-type-label" style="font-size:clamp(1.5rem,4vw,2.5rem);">16PF</div>
        <div class="result-type-name">Профиль личности Кеттела</div>
        <div class="result-type-tags">
          ${Object.entries(result.stens||{}).slice(0,6).map(([f,v])=>`<span class="badge badge-violet">${f}=${v}</span>`).join('')}
        </div>
      `;
    case 'iq':
      return `
        <div class="result-type-label">${result.iq}</div>
        <div class="result-type-name">${result.category}</div>
        <div class="result-type-tags">
          <span class="badge badge-violet">Топ ${100 - result.percentile}%</span>
          <span class="badge badge-blue">${result.correct}/40 верных</span>
          <span class="badge badge-cyan">${Math.round((result.timeSpent||0)/60)} мин</span>
        </div>
      `;
    default:
      return `<div class="result-type-name">Результат получен</div>`;
  }
}

// ── Левая карточка: шкалы / мини-данные (БЕЗ canvas — он только в детальном блоке) ──
function buildChartSection(testId, result) {

  // MBTI — HTML-шкалы
  if (testId === 'mbti') {
    return `
      <div class="result-card glass-card">
        <h3 class="h5" style="margin-bottom:1rem;">Ваши показатели</h3>
        <div id="mbtiScales"></div>
      </div>
    `;
  }

  // Big Five — прогресс-бары
  if (testId === 'bigfive') {
    return `
      <div class="result-card glass-card">
        <h3 class="h5" style="margin-bottom:1rem;">Факторы OCEAN</h3>
        ${['O','C','E','A','N'].map(f => `
          <div class="mbti-scale">
            <div class="mbti-scale-header">
              <span class="mbti-scale-label">${BIG_FIVE_DESCRIPTIONS[f]?.name || f}</span>
              <span class="mbti-scale-value">${result.percentages?.[f] || 0}%</span>
            </div>
            <div class="mbti-scale-bar">
              <div class="mbti-scale-fill" style="width:${result.percentages?.[f]||0}%;background:var(--grad-primary);transition:width 1.2s ease 0.3s;"></div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  // IQ — числовой gauge без canvas (canvas только в buildDetailedChart)
  if (testId === 'iq') {
    return `
      <div class="result-card glass-card" style="text-align:center;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:0.5rem;">
        <div style="font:800 5rem/1 var(--font-display);background:var(--grad-text);-webkit-background-clip:text;-webkit-text-fill-color:transparent;">${result.iq}</div>
        <div style="font:600 1rem var(--font-display);color:var(--text-accent);">${result.category}</div>
        <div style="font:400 0.85rem var(--font-body);color:var(--text-muted);">Топ ${100 - (result.percentile||50)}% · ${result.correct}/40 верных</div>
        <div class="mbti-scale-bar" style="width:80%;margin-top:0.5rem;">
          <div class="mbti-scale-fill" style="width:${Math.min(100,Math.round(((result.iq-55)/90)*100))}%;background:var(--grad-primary);transition:width 1.5s ease 0.3s;"></div>
        </div>
        <div style="display:flex;justify-content:space-between;width:80%;font:400 0.7rem var(--font-body);color:var(--text-muted);margin-top:0.25rem;">
          <span>55</span><span>100</span><span>145</span>
        </div>
      </div>
    `;
  }

  // Кеттел — прогресс-бары стенов
  if (testId === 'cattell') {
    return `
      <div class="result-card glass-card">
        <h3 class="h5" style="margin-bottom:1rem;">Стены (1–10)</h3>
        ${Object.entries(result.stens || {}).slice(0,8).map(([f,v]) => `
          <div class="mbti-scale">
            <div class="mbti-scale-header">
              <span class="mbti-scale-label">${f}</span>
              <span class="mbti-scale-value">${v}/10</span>
            </div>
            <div class="mbti-scale-bar">
              <div class="mbti-scale-fill" style="width:${v*10}%;background:var(--grad-primary);transition:width 1.2s ease 0.3s;"></div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  // ПДО — топ-5 акцентуаций в виде шкал (БЕЗ canvas — он только ниже в детальном блоке)
  if (testId === 'pdo') {
    const TYPE_NAMES = {Г:'Гипертимный',Ц:'Циклоидный',Л:'Лабильный',А:'Астено-невр.',С:'Сенситивный',П:'Психастен.',Ш:'Шизоидный',Э:'Эпилептоид.',И:'Истероидный',Н:'Неустойчивый',К:'Конформный'};
    const sorted = Object.entries(result.scores || {}).sort((a,b) => b[1]-a[1]).slice(0, 5);
    const maxVal = sorted[0]?.[1] || 1;
    return `
      <div class="result-card glass-card">
        <h3 class="h5" style="margin-bottom:1rem;">Топ акцентуаций</h3>
        ${sorted.map(([code, val]) => `
          <div class="mbti-scale">
            <div class="mbti-scale-header">
              <span class="mbti-scale-label">${TYPE_NAMES[code] || code}</span>
              <span class="mbti-scale-value">${val}</span>
            </div>
            <div class="mbti-scale-bar">
              <div class="mbti-scale-fill" style="width:${Math.round((val/20)*100)}%;background:var(--grad-primary);transition:width 1.2s ease 0.3s;"></div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  // Айзенк — E/N шкалы
  if (testId === 'eysenck') {
    return `
      <div class="result-card glass-card">
        <h3 class="h5" style="margin-bottom:1rem;">Показатели E / N</h3>
        ${[['Экстраверсия (E)', result.E, 24],['Нейротизм (N)', result.N, 24]].map(([label, val, max]) => `
          <div class="mbti-scale">
            <div class="mbti-scale-header">
              <span class="mbti-scale-label">${label}</span>
              <span class="mbti-scale-value">${val}/${max}</span>
            </div>
            <div class="mbti-scale-bar">
              <div class="mbti-scale-fill" style="width:${Math.round((val/max)*100)}%;background:var(--grad-primary);transition:width 1.2s ease 0.3s;"></div>
            </div>
          </div>
        `).join('')}
        <div style="margin-top:1rem;padding:0.75rem;border-radius:var(--radius-md);background:rgba(139,92,246,0.08);border:1px solid rgba(139,92,246,0.2);">
          <span style="font:600 1rem var(--font-display);color:var(--text-accent);">${result.temperament}</span>
          <span style="font:400 0.8rem var(--font-body);color:var(--text-muted);display:block;margin-top:0.2rem;">
            ${result.valid ? '✓ Результат достоверен' : '⚠ L > 4 — возможна недостоверность'}
          </span>
        </div>
      </div>
    `;
  }

  // Леонгард — топ-5 шкал
  if (testId === 'leonhard') {
    const LEVEL_COLOR = { strong:'var(--accent-red)', accent:'var(--accent-amber)', norm:'var(--accent-violet)' };
    const sorted = Object.entries(result.scores || {}).sort((a,b) => b[1]-a[1]).slice(0, 5);
    return `
      <div class="result-card glass-card">
        <h3 class="h5" style="margin-bottom:1rem;">Топ шкал</h3>
        ${sorted.map(([name, val]) => {
          const level = result.levels?.[name] || 'norm';
          return `
            <div class="mbti-scale">
              <div class="mbti-scale-header">
                <span class="mbti-scale-label" style="font-size:0.8rem;">${name.replace('_',' ')}</span>
                <span class="mbti-scale-value" style="color:${LEVEL_COLOR[level]}">${val}/24</span>
              </div>
              <div class="mbti-scale-bar">
                <div class="mbti-scale-fill" style="width:${Math.round((val/24)*100)}%;background:${LEVEL_COLOR[level]};transition:width 1.2s ease 0.3s;"></div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  // Фолбэк — пустая карточка
  return `<div class="result-card glass-card"><h3 class="h5">Показатели</h3></div>`;
}

// ── Правая карточка: текстовое описание ──────────────────────
function buildDescriptionSection(testId, result, desc) {
  const text = desc?.summary || desc?.description || 'Подробное описание недоступно.';
  const full  = desc?.full || '';

  return `
    <div class="result-description glass-card">
      <h3>Кто вы?</h3>
      <p id="descShort">${text}</p>
      ${full ? `
        <p id="descFull" class="hidden">${full}</p>
        <button class="read-more-btn" onclick="this.previousElementSibling.classList.toggle('hidden');this.textContent=this.textContent.includes('полностью')?'Свернуть ↑':'Читать полностью →'">
          Читать полностью →
        </button>
      ` : ''}
    </div>
  `;
}

// ── Детальный Chart.js график (единственный canvas на странице) ──
function buildDetailedChart(testId, result) {
  if (testId === 'mbti') return ''; // только HTML-шкалы, без canvas

  const titles = {
    pdo:'Радар акцентуаций (ПДО Личко)',
    bigfive:'Профиль OCEAN',
    eysenck:'Карта темперамента (E × N)',
    leonhard:'Шкалы акцентуаций (Леонгард)',
    cattell:'Линейный профиль 16PF (Кеттел)',
    iq:'Кривая нормального распределения IQ',
  };

  // IQ: gauge + bell curve
  if (testId === 'iq') {
    return `
      <div class="chart-container glass-card animate-on-scroll">
        <h3 class="h5" style="margin-bottom:1.25rem;">${titles.iq}</h3>
        <div style="display:grid;grid-template-columns:1fr 2fr;gap:1.5rem;align-items:center;">
          <div style="position:relative;height:200px;">
            <canvas id="iqGauge"></canvas>
            <div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;pointer-events:none;padding-top:1rem;">
              <span style="font:800 2.5rem/1 var(--font-display);background:var(--grad-text);-webkit-background-clip:text;-webkit-text-fill-color:transparent;">${result.iq}</span>
              <span style="font:400 0.75rem var(--font-body);color:var(--text-muted);margin-top:0.25rem;">${result.percentile}й перцентиль</span>
            </div>
          </div>
          <div style="position:relative;height:200px;">
            <canvas id="iqBell"></canvas>
          </div>
        </div>
      </div>
    `;
  }

  // Все остальные тесты — одиночный полноразмерный canvas
  return `
    <div class="chart-container glass-card animate-on-scroll">
      <h3 class="h5" style="margin-bottom:1.25rem;">${titles[testId] || 'График'}</h3>
      <div style="position:relative;width:100%;height:360px;">
        <canvas id="${testId}Chart"></canvas>
      </div>
    </div>
  `;
}

// ── Сильные стороны + Зоны роста ─────────────────────────────
function buildStrengthsSection(desc) {
  const strengths = desc?.strengths || desc?.traits || [];
  const growth    = desc?.growthAreas || [];
  if (!strengths.length && !growth.length) return '';

  return `
    <div class="strengths-grid animate-on-scroll">
      ${strengths.length ? `
        <div class="strengths-card glass-card">
          <h3 class="strengths-title"><span>💪</span> Сильные стороны</h3>
          <ul class="strengths-list">
            ${strengths.map(s => `
              <li class="strength-item">
                <span class="strength-dot"></span>
                <span>${s}</span>
              </li>
            `).join('')}
          </ul>
        </div>
      ` : ''}
      ${growth.length ? `
        <div class="growth-card glass-card">
          <h3 class="strengths-title"><span>⚡</span> Зоны роста</h3>
          <ul class="growth-list">
            ${growth.map(g => `
              <li class="growth-item">
                <span class="growth-arrow">→</span>
                <span>${g}</span>
              </li>
            `).join('')}
          </ul>
        </div>
      ` : ''}
    </div>
  `;
}

// ── Карьера ────────────────────────────────────────────────────
function buildCareerSection(desc) {
  if (!desc?.careers?.length) return '';
  return `
    <div class="career-card glass-card animate-on-scroll">
      <h3 class="strengths-title"><span>💼</span> Карьерные направления</h3>
      <div class="career-tags">
        ${desc.careers.map(c => `<span class="career-tag">${c}</span>`).join('')}
      </div>
      ${desc.famousPeople ? `
        <p style="margin-top:1rem;font:400 0.85rem var(--font-body);color:var(--text-muted);">
          Известные представители: ${desc.famousPeople.join(', ')}
        </p>
      ` : ''}
    </div>
  `;
}

// ── Export Bar ────────────────────────────────────────────────
export function renderExportBar(testId) {
  return `
    <div class="export-bar animate-on-scroll">
      <div class="primary-actions">
        ${window.__currentUser ? `
          <button class="btn-primary" onclick="window.__saveToHistory('${testId}')">
            💾 Сохранить в кабинет
          </button>
        ` : `
          <a href="#/register" class="btn-primary">💾 Войдите, чтобы сохранить</a>
        `}
        <button class="btn-ghost" onclick="window.__retryTest('${testId}')">↩ Пройти снова</button>
      </div>
      <div class="secondary-actions">
        <button class="btn-export btn-export-pdf"   onclick="window.__downloadPDF('${testId}')"  title="Скачать PDF">📄 PDF</button>
        <button class="btn-export btn-export-share" onclick="window.__shareResult('${testId}')"  title="Поделиться">🔗 Поделиться</button>
        <button class="btn-export btn-export-copy"  id="copyResultBtn" onclick="window.__copyResult('${testId}')" title="Скопировать текст">📋 Копировать</button>
      </div>
    </div>
    <div style="text-align:center;margin-top:1rem;">
      <a href="#/tests" class="text-muted" style="font:400 0.85rem var(--font-body);">← Назад к каталогу тестов</a>
    </div>
  `;
}

// ── Рендер чартов (вызывается после вставки HTML) ─────────────
function renderCharts(testId, result) {
  if (typeof Chart === 'undefined') return;

  if (testId === 'mbti') {
    renderMBTIScales(result, 'mbtiScales');
    return;
  }

  if (testId === 'iq') {
    createChart('iq', result, 'iqGauge');
    createIQBellCurve(result, 'iqBell');
    return;
  }

  // Для всех остальных — один canvas в детальном блоке
  createChart(testId, result, testId + 'Chart');
}

// ── Теги MBTI ─────────────────────────────────────────────────
function getTypeTagsMBTI(type) {
  const tags = [];
  if (!type) return tags;
  if (type[0]==='I') tags.push('Интроверт'); else tags.push('Экстраверт');
  if (type[1]==='N') tags.push('Интуит');    else tags.push('Сенсорик');
  if (type[2]==='T') tags.push('Логик');     else tags.push('Этик');
  if (type[3]==='J') tags.push('Рационал');  else tags.push('Иррационал');
  return tags;
}

// ── Глобальный обработчик "Сохранить в кабинет" ──────────────
window.__saveToHistory = async (testId) => {
  if (!window.__currentUser || !window.__currentResult) return;
  const { saveTestResult } = await import('../db.js');
  await saveTestResult(window.__currentUser.uid, {
    testId,
    result: window.__currentResult,
    completedAt: new Date().toISOString(),
  });
};
