/* Файл: assets/pages/admin.js */
/* Админ-панель: статистика пользователей, IQ, типы личности, акцентуации */

import { showToast } from '../js/ui.js';

// ── Конфиг всех тестов для статистики ─────────────────────────
const TEST_META = {
  mbti:     { name:'MBTI',        icon:'🧩', color:'#6366f1' },
  bigfive:  { name:'Big Five',    icon:'🌊', color:'#3b82f6' },
  eysenck:  { name:'Айзенк',      icon:'🔥', color:'#06b6d4' },
  pdo:      { name:'ПДО Личко',   icon:'🎭', color:'#8b5cf6' },
  leonhard: { name:'Леонгард',    icon:'🌗', color:'#ec4899' },
  cattell:  { name:'Кеттел 16PF', icon:'🔬', color:'#10b981' },
  iq:       { name:'IQ-тест',     icon:'🧠', color:'#f59e0b' },
};

const MBTI_GROUPS = {
  'Аналитики':   ['INTJ','INTP','ENTJ','ENTP'],
  'Дипломаты':   ['INFJ','INFP','ENFJ','ENFP'],
  'Стражи':      ['ISTJ','ISFJ','ESTJ','ESFJ'],
  'Исследователи':['ISTP','ISFP','ESTP','ESFP'],
};

// ── Хранилище данных ──────────────────────────────────────────
let statsData = null;
let chartsInstances = {};

// ── Рендер страницы ───────────────────────────────────────────
const ADMIN_EMAILS = ['maksmlrd@gmail.com'];

export async function renderAdminPage() {
  const app  = document.getElementById('app');
  const user = window.__currentUser;
  if (!app) return;

  if (!user || !ADMIN_EMAILS.includes(user.email)) {
    app.innerHTML = `
      <div style="min-height:80vh;display:flex;align-items:center;justify-content:center;text-align:center;position:relative;z-index:10;">
        <div>
          <div style="font-size:3.5rem;margin-bottom:1rem;">🔒</div>
          <h2 class="h3" style="margin-bottom:0.75rem;">Доступ запрещён</h2>
          <p class="text-secondary" style="margin-bottom:1.5rem;">
            ${!user ? 'Войдите в аккаунт администратора' : 'У вашего аккаунта нет доступа к этой странице'}
          </p>
          ${!user
            ? `<a href="#/login" class="btn-primary">Войти →</a>`
            : `<a href="#/" class="btn-ghost">← На главную</a>`
          }
        </div>
      </div>
    `;
    return;
  }

  app.innerHTML = `
    <div style="padding-top:96px;padding-bottom:4rem;position:relative;z-index:10;min-height:100vh;">
      <div class="container" style="max-width:1200px;">

        <!-- Заголовок -->
        <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:1rem;margin-bottom:2rem;">
          <div>
            <span class="section-label">📊 Панель</span>
            <h1 class="h2" style="margin-top:0.25rem;">Статистика проекта</h1>
          </div>
          <div style="display:flex;gap:0.75rem;align-items:center;">
            <span id="lastUpdated" class="text-muted" style="font:400 0.8rem var(--font-body);"></span>
            <button class="btn-ghost btn-sm" id="refreshBtn" onclick="window.__adminRefresh()">
              🔄 Обновить
            </button>
          </div>
        </div>

        <!-- Источник данных -->
        <div id="dataSourceBanner" class="glass-card no-hover" style="padding:0.875rem 1.25rem;margin-bottom:1.5rem;display:flex;align-items:center;gap:0.75rem;border-color:rgba(245,158,11,0.3);background:rgba(245,158,11,0.06);">
          <span style="font-size:1.1rem;">⚠️</span>
          <span style="font:400 0.875rem var(--font-body);color:var(--text-secondary);" id="dataSourceMsg">
            Загрузка данных...
          </span>
        </div>

        <!-- KPI карточки -->
        <div id="kpiGrid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:1rem;margin-bottom:2rem;">
          ${[1,2,3,4].map(() => `
            <div class="glass-card no-hover skeleton" style="height:110px;border-radius:var(--radius-lg);"></div>
          `).join('')}
        </div>

        <!-- Основные графики -->
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:1.5rem;margin-bottom:1.5rem;">
          <!-- MBTI распределение -->
          <div class="glass-card no-hover" style="padding:1.5rem;" id="mbtiCard">
            <h3 class="h5" style="margin-bottom:1rem;">🧩 Типы MBTI</h3>
            <div style="height:260px;position:relative;">
              <canvas id="mbtiChart"></canvas>
            </div>
          </div>
          <!-- Темпераменты Айзенка -->
          <div class="glass-card no-hover" style="padding:1.5rem;" id="eysenckCard">
            <h3 class="h5" style="margin-bottom:1rem;">🔥 Темпераменты</h3>
            <div style="height:260px;position:relative;">
              <canvas id="eysenckChart"></canvas>
            </div>
          </div>
        </div>

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:1.5rem;margin-bottom:1.5rem;">
          <!-- IQ распределение -->
          <div class="glass-card no-hover" style="padding:1.5rem;">
            <h3 class="h5" style="margin-bottom:1rem;">🧠 Распределение IQ</h3>
            <div style="height:220px;position:relative;">
              <canvas id="iqDistChart"></canvas>
            </div>
          </div>
          <!-- Популярность тестов -->
          <div class="glass-card no-hover" style="padding:1.5rem;">
            <h3 class="h5" style="margin-bottom:1rem;">📋 Популярность тестов</h3>
            <div style="height:220px;position:relative;">
              <canvas id="testPopChart"></canvas>
            </div>
          </div>
        </div>

        <!-- Big Five средние показатели -->
        <div class="glass-card no-hover" style="padding:1.5rem;margin-bottom:1.5rem;">
          <h3 class="h5" style="margin-bottom:1rem;">🌊 Big Five — средние значения</h3>
          <div style="height:200px;position:relative;">
            <canvas id="bigfiveAvgChart"></canvas>
          </div>
        </div>

        <!-- Акцентуации Леонгарда -->
        <div class="glass-card no-hover" style="padding:1.5rem;margin-bottom:1.5rem;">
          <h3 class="h5" style="margin-bottom:1rem;">🌗 Акцентуации Леонгарда — топ-4 у пользователей</h3>
          <div style="height:200px;position:relative;">
            <canvas id="leonhardChart"></canvas>
          </div>
        </div>

        <!-- Сырая таблица последних результатов -->
        <div class="glass-card no-hover" style="padding:1.5rem;">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:1rem;">
            <h3 class="h5">🕐 Последние прохождения</h3>
            <span id="recentCount" class="badge badge-violet"></span>
          </div>
          <div id="recentTable" style="overflow-x:auto;"></div>
        </div>

      </div>
    </div>
  `;

  window.__adminRefresh = () => loadAndRender(true);
  loadAndRender(false);
}

// ── Загрузка данных и рендер ──────────────────────────────────
async function loadAndRender(forceRefresh = false) {
  const refreshBtn = document.getElementById('refreshBtn');
  if (refreshBtn) refreshBtn.innerHTML = '<span class="spinner" style="width:14px;height:14px;"></span> Загрузка...';

  const data = await collectStats(forceRefresh);
  statsData = data;

  renderKPI(data);
  renderCharts(data);
  renderRecentTable(data);
  updateMeta(data);

  if (refreshBtn) refreshBtn.innerHTML = '🔄 Обновить';
}

// ── Сбор статистики ───────────────────────────────────────────
async function collectStats(forceRefresh) {
  // Сначала пробуем Firestore
  if (window.__currentUser && window.firebase?.firestore) {
    try {
      return await collectFromFirestore();
    } catch (e) {
      console.warn('Firestore недоступен, читаем localStorage:', e.message);
    }
  }
  // Фолбэк: читаем localStorage текущего браузера
  return collectFromLocalStorage();
}

// ── Из Firestore ──────────────────────────────────────────────
async function collectFromFirestore() {
  const db = firebase.firestore();

  // Загружаем всех пользователей и их результаты (до 500 юзеров)
  const usersSnap = await db.collection('users').limit(500).get();

  const allResults = []; // { uid, testId, result, completedAt }
  const userCount  = usersSnap.size;

  const promises = usersSnap.docs.map(async userDoc => {
    const uid = userDoc.id;
    const resultsSnap = await db.collection('users').doc(uid)
      .collection('results').get();
    resultsSnap.forEach(r => {
      allResults.push({ uid, testId: r.id, ...r.data() });
    });
  });

  await Promise.all(promises);

  const banner = document.getElementById('dataSourceMsg');
  if (banner) banner.textContent = `Данные Firebase: ${userCount} пользователей, ${allResults.length} прохождений`;
  const bannerEl = document.getElementById('dataSourceBanner');
  if (bannerEl) bannerEl.style.borderColor = 'rgba(16,185,129,0.3)';
  if (bannerEl) bannerEl.style.background  = 'rgba(16,185,129,0.06)';
  const msg = document.getElementById('dataSourceMsg');
  if (msg) msg.innerHTML = `✅ Firebase: <strong>${userCount}</strong> пользователей, <strong>${allResults.length}</strong> прохождений`;

  return processResults(allResults, userCount);
}

// ── Из localStorage ───────────────────────────────────────────
function collectFromLocalStorage() {
  const allResults = [];
  const testIds = ['mbti','bigfive','eysenck','pdo','leonhard','cattell','iq'];

  testIds.forEach(testId => {
    const raw = localStorage.getItem(`result_${testId}`);
    if (raw) {
      try {
        const result = JSON.parse(raw);
        allResults.push({ uid: 'local', testId, result, completedAt: new Date().toISOString() });
      } catch {}
    }
  });

  const banner = document.getElementById('dataSourceBanner');
  const msg    = document.getElementById('dataSourceMsg');
  if (banner) { banner.style.borderColor = 'rgba(245,158,11,0.3)'; banner.style.background = 'rgba(245,158,11,0.06)'; }
  if (msg)    msg.innerHTML = `⚠️ <strong>Локальные данные</strong> текущего браузера (${allResults.length} тестов). Подключите Firebase для полной статистики.`;

  return processResults(allResults, allResults.length > 0 ? 1 : 0);
}

// ── Обработка результатов в статистику ───────────────────────
function processResults(allResults, userCount) {
  const stats = {
    userCount,
    totalTests: allResults.length,
    testCounts: {},           // { mbti: 42, iq: 18, ... }
    mbtiTypes: {},            // { INTJ: 5, ENFP: 3, ... }
    mbtiGroups: {},           // { Аналитики: 12, ... }
    temperaments: {},         // { Холерик: 8, ... }
    iqValues: [],             // [118, 95, 102, ...]
    iqCategories: {},         // { 'Высокий': 5, ... }
    iqAvg: 0,
    bigfiveAvg: { O:0,C:0,E:0,A:0,N:0 },
    bigfiveCount: 0,
    leonhardTop: {},          // { Гипертимный: 12, ... }
    pdoTypes: {},
    recent: [],               // последние 20 прохождений
  };

  // Подсчёт по тестам
  allResults.forEach(item => {
    const { testId, result, completedAt, uid } = item;
    const r = result?.result || result;

    // Счётчик по тестам
    stats.testCounts[testId] = (stats.testCounts[testId] || 0) + 1;

    // MBTI
    if (testId === 'mbti' && r?.type) {
      stats.mbtiTypes[r.type] = (stats.mbtiTypes[r.type] || 0) + 1;
      for (const [group, types] of Object.entries(MBTI_GROUPS)) {
        if (types.includes(r.type)) {
          stats.mbtiGroups[group] = (stats.mbtiGroups[group] || 0) + 1;
        }
      }
    }

    // Айзенк
    if (testId === 'eysenck' && r?.temperament) {
      stats.temperaments[r.temperament] = (stats.temperaments[r.temperament] || 0) + 1;
    }

    // IQ
    if (testId === 'iq' && r?.iq) {
      stats.iqValues.push(r.iq);
      const cat = r.category || 'Средний';
      stats.iqCategories[cat] = (stats.iqCategories[cat] || 0) + 1;
    }

    // Big Five
    if (testId === 'bigfive' && r?.percentages) {
      const p = r.percentages;
      ['O','C','E','A','N'].forEach(f => {
        stats.bigfiveAvg[f] = (stats.bigfiveAvg[f] || 0) + (p[f] || 0);
      });
      stats.bigfiveCount++;
    }

    // Леонгард — берём самую высокую акцентуацию каждого пользователя
    if (testId === 'leonhard' && r?.scores) {
      const top = Object.entries(r.scores).sort((a,b) => b[1]-a[1])[0];
      if (top) stats.leonhardTop[top[0]] = (stats.leonhardTop[top[0]] || 0) + 1;
    }

    // ПДО ведущий тип
    if (testId === 'pdo' && r?.leading) {
      stats.pdoTypes[r.leading] = (stats.pdoTypes[r.leading] || 0) + 1;
    }

    // Последние прохождения
    stats.recent.push({
      testId,
      uid: uid?.slice(0, 8) || 'local',
      result: r,
      completedAt: completedAt || new Date().toISOString(),
    });
  });

  // Средний IQ
  if (stats.iqValues.length) {
    stats.iqAvg = Math.round(stats.iqValues.reduce((a,b) => a+b, 0) / stats.iqValues.length);
  }

  // Нормализация Big Five
  if (stats.bigfiveCount > 0) {
    ['O','C','E','A','N'].forEach(f => {
      stats.bigfiveAvg[f] = Math.round(stats.bigfiveAvg[f] / stats.bigfiveCount);
    });
  }

  // Сортировка последних
  stats.recent.sort((a,b) => new Date(b.completedAt) - new Date(a.completedAt));
  stats.recent = stats.recent.slice(0, 20);

  return stats;
}

// ── KPI карточки ──────────────────────────────────────────────
function renderKPI(data) {
  const grid = document.getElementById('kpiGrid');
  if (!grid) return;

  const topMBTI = Object.entries(data.mbtiTypes).sort((a,b)=>b[1]-a[1])[0];
  const topTemp = Object.entries(data.temperaments).sort((a,b)=>b[1]-a[1])[0];

  const cards = [
    { icon:'👥', label:'Пользователей',  value: data.userCount,       color:'#8b5cf6', sub:'зарегистрировано' },
    { icon:'📋', label:'Прохождений',    value: data.totalTests,      color:'#3b82f6', sub:'всего тестов' },
    { icon:'🧠', label:'Средний IQ',     value: data.iqAvg || '—',    color:'#f59e0b', sub:`из ${data.iqValues.length} тестов` },
    { icon:'🧩', label:'Топ тип MBTI',   value: topMBTI?.[0] || '—', color:'#6366f1', sub: topMBTI ? `${topMBTI[1]} чел.` : 'нет данных' },
  ];

  grid.innerHTML = cards.map(c => `
    <div class="glass-card no-hover" style="padding:1.25rem 1.5rem;">
      <div style="font-size:1.75rem;margin-bottom:0.5rem;">${c.icon}</div>
      <div style="font:700 1.9rem/1 var(--font-display);color:${c.color};margin-bottom:0.25rem;">${c.value}</div>
      <div style="font:600 0.8rem var(--font-body);color:var(--text-secondary);">${c.label}</div>
      <div style="font:400 0.75rem var(--font-body);color:var(--text-muted);margin-top:0.2rem;">${c.sub}</div>
    </div>
  `).join('');
}

// ── Все графики ───────────────────────────────────────────────
function renderCharts(data) {
  if (typeof Chart === 'undefined') return;
  Object.values(chartsInstances).forEach(c => { try { c.destroy(); } catch {} });
  chartsInstances = {};

  const CHART_OPTS = {
    responsive: true, maintainAspectRatio: false,
    animation: { duration: 900, easing: 'easeInOutQuart' },
    plugins: { legend: { labels: { color:'rgba(255,255,255,0.7)', font:{size:11} } } },
  };

  // ── MBTI типы ──────────────────────────────────────────────
  const mbtiLabels = Object.keys(data.mbtiTypes);
  const mbtiValues = Object.values(data.mbtiTypes);
  if (mbtiLabels.length) {
    const ctx = document.getElementById('mbtiChart');
    if (ctx) chartsInstances.mbti = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: mbtiLabels,
        datasets: [{
          data: mbtiValues,
          backgroundColor: mbtiLabels.map((_, i) => `hsla(${(i * 22) + 250},70%,60%,0.7)`),
          borderColor:     mbtiLabels.map((_, i) => `hsla(${(i * 22) + 250},70%,60%,1)`),
          borderWidth: 1.5, borderRadius: 6,
        }]
      },
      options: { ...CHART_OPTS,
        plugins: { ...CHART_OPTS.plugins, legend: { display: false } },
        scales: {
          y: { ticks:{ color:'rgba(255,255,255,0.4)' }, grid:{ color:'rgba(255,255,255,0.05)' } },
          x: { ticks:{ color:'rgba(255,255,255,0.6)', font:{size:10} }, grid:{ display:false } },
        }
      }
    });
  } else {
    noDataPlaceholder('mbtiCard', 'Нет данных MBTI');
  }

  // ── Темпераменты ──────────────────────────────────────────
  const tempLabels = Object.keys(data.temperaments);
  const tempValues = Object.values(data.temperaments);
  const tempColors = { Холерик:'rgba(239,68,68,0.75)', Сангвиник:'rgba(245,158,11,0.75)', Флегматик:'rgba(59,130,246,0.75)', Меланхолик:'rgba(139,92,246,0.75)' };
  if (tempLabels.length) {
    const ctx = document.getElementById('eysenckChart');
    if (ctx) chartsInstances.eysenck = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: tempLabels,
        datasets: [{
          data: tempValues,
          backgroundColor: tempLabels.map(l => tempColors[l] || 'rgba(99,102,241,0.7)'),
          borderColor: 'rgba(255,255,255,0.08)',
          borderWidth: 2,
        }]
      },
      options: { ...CHART_OPTS, cutout: '55%' }
    });
  } else {
    noDataPlaceholder('eysenckCard', 'Нет данных Айзенка');
  }

  // ── IQ распределение ──────────────────────────────────────
  const iqBins = { '70-79':0,'80-89':0,'90-99':0,'100-109':0,'110-119':0,'120-129':0,'130+':0 };
  data.iqValues.forEach(iq => {
    if      (iq < 80)  iqBins['70-79']++;
    else if (iq < 90)  iqBins['80-89']++;
    else if (iq < 100) iqBins['90-99']++;
    else if (iq < 110) iqBins['100-109']++;
    else if (iq < 120) iqBins['110-119']++;
    else if (iq < 130) iqBins['120-129']++;
    else               iqBins['130+']++;
  });
  const iqCtx = document.getElementById('iqDistChart');
  if (iqCtx) chartsInstances.iq = new Chart(iqCtx, {
    type: 'bar',
    data: {
      labels: Object.keys(iqBins),
      datasets: [{
        label: 'Количество',
        data: Object.values(iqBins),
        backgroundColor: Object.keys(iqBins).map((_,i) => `hsla(${250 + i*10},70%,${50+i*4}%,0.7)`),
        borderRadius: 6, borderWidth: 0,
      }]
    },
    options: { ...CHART_OPTS,
      plugins: { ...CHART_OPTS.plugins, legend:{ display:false } },
      scales: {
        y: { ticks:{ color:'rgba(255,255,255,0.4)' }, grid:{ color:'rgba(255,255,255,0.05)' } },
        x: { ticks:{ color:'rgba(255,255,255,0.6)' }, grid:{ display:false } },
      }
    }
  });

  // ── Популярность тестов ────────────────────────────────────
  const testLabels = Object.keys(TEST_META);
  const testValues = testLabels.map(id => data.testCounts[id] || 0);
  const popCtx = document.getElementById('testPopChart');
  if (popCtx) chartsInstances.testPop = new Chart(popCtx, {
    type: 'bar',
    data: {
      labels: testLabels.map(id => TEST_META[id].name),
      datasets: [{
        data: testValues,
        backgroundColor: testLabels.map(id => TEST_META[id].color + 'bb'),
        borderColor:     testLabels.map(id => TEST_META[id].color),
        borderWidth: 1.5, borderRadius: 6,
      }]
    },
    options: { ...CHART_OPTS,
      indexAxis: 'y',
      plugins: { ...CHART_OPTS.plugins, legend:{ display:false } },
      scales: {
        x: { ticks:{ color:'rgba(255,255,255,0.4)' }, grid:{ color:'rgba(255,255,255,0.05)' } },
        y: { ticks:{ color:'rgba(255,255,255,0.6)', font:{size:11} }, grid:{ display:false } },
      }
    }
  });

  // ── Big Five средние ───────────────────────────────────────
  const bfCtx = document.getElementById('bigfiveAvgChart');
  if (bfCtx && data.bigfiveCount > 0) chartsInstances.bigfive = new Chart(bfCtx, {
    type: 'bar',
    data: {
      labels: ['Открытость (O)','Добросовест. (C)','Экстраверсия (E)','Доброжел. (A)','Нейротизм (N)'],
      datasets: [{
        label: 'Среднее %',
        data: ['O','C','E','A','N'].map(f => data.bigfiveAvg[f]),
        backgroundColor: ['rgba(139,92,246,0.7)','rgba(16,185,129,0.7)','rgba(6,182,212,0.7)','rgba(236,72,153,0.7)','rgba(245,158,11,0.7)'],
        borderRadius: 6, borderWidth: 0,
      }]
    },
    options: { ...CHART_OPTS,
      plugins: { ...CHART_OPTS.plugins, legend:{ display:false } },
      scales: {
        y: { min:0, max:100, ticks:{ color:'rgba(255,255,255,0.4)' }, grid:{ color:'rgba(255,255,255,0.05)' } },
        x: { ticks:{ color:'rgba(255,255,255,0.6)', font:{size:11} }, grid:{ display:false } },
      }
    }
  });

  // ── Леонгард топ акцентуации ───────────────────────────────
  const leonSorted = Object.entries(data.leonhardTop).sort((a,b)=>b[1]-a[1]).slice(0,8);
  const leonCtx = document.getElementById('leonhardChart');
  if (leonCtx && leonSorted.length) chartsInstances.leonhard = new Chart(leonCtx, {
    type: 'bar',
    data: {
      labels: leonSorted.map(([k]) => k),
      datasets: [{
        data: leonSorted.map(([,v]) => v),
        backgroundColor: 'rgba(236,72,153,0.65)',
        borderColor: '#ec4899',
        borderWidth: 1.5, borderRadius: 6,
      }]
    },
    options: { ...CHART_OPTS,
      plugins: { ...CHART_OPTS.plugins, legend:{ display:false } },
      scales: {
        y: { ticks:{ color:'rgba(255,255,255,0.4)' }, grid:{ color:'rgba(255,255,255,0.05)' } },
        x: { ticks:{ color:'rgba(255,255,255,0.6)', font:{size:10} }, grid:{ display:false } },
      }
    }
  });
}

// ── Таблица последних прохождений ─────────────────────────────
function renderRecentTable(data) {
  const container = document.getElementById('recentTable');
  const counter   = document.getElementById('recentCount');
  if (!container) return;

  if (counter) counter.textContent = `${data.recent.length} записей`;

  if (!data.recent.length) {
    container.innerHTML = `<p class="text-muted" style="text-align:center;padding:2rem;font:400 0.9rem var(--font-body);">Нет данных о прохождениях</p>`;
    return;
  }

  const rows = data.recent.map(item => {
    const r     = item.result;
    const meta  = TEST_META[item.testId] || { name: item.testId, icon:'📊' };
    const date  = item.completedAt ? new Date(item.completedAt).toLocaleDateString('ru-RU') : '—';
    const summary = getShortSummary(item.testId, r);

    return `
      <tr style="border-bottom:1px solid rgba(255,255,255,0.04);">
        <td style="padding:0.75rem 1rem;color:var(--text-muted);font:400 0.8rem var(--font-body);">${date}</td>
        <td style="padding:0.75rem 1rem;">
          <span style="font-size:1rem;margin-right:0.375rem;">${meta.icon}</span>
          <span style="font:500 0.875rem var(--font-body);color:var(--text-secondary);">${meta.name}</span>
        </td>
        <td style="padding:0.75rem 1rem;font:600 0.875rem var(--font-display);color:var(--text-accent);">${summary}</td>
        <td style="padding:0.75rem 1rem;font:400 0.75rem var(--font-body);color:var(--text-muted);">${item.uid}</td>
      </tr>
    `;
  }).join('');

  container.innerHTML = `
    <table style="width:100%;border-collapse:collapse;">
      <thead>
        <tr style="border-bottom:1px solid rgba(255,255,255,0.08);">
          <th style="padding:0.5rem 1rem;text-align:left;font:600 0.75rem var(--font-body);color:var(--text-muted);text-transform:uppercase;letter-spacing:0.06em;">Дата</th>
          <th style="padding:0.5rem 1rem;text-align:left;font:600 0.75rem var(--font-body);color:var(--text-muted);text-transform:uppercase;letter-spacing:0.06em;">Тест</th>
          <th style="padding:0.5rem 1rem;text-align:left;font:600 0.75rem var(--font-body);color:var(--text-muted);text-transform:uppercase;letter-spacing:0.06em;">Результат</th>
          <th style="padding:0.5rem 1rem;text-align:left;font:600 0.75rem var(--font-body);color:var(--text-muted);text-transform:uppercase;letter-spacing:0.06em;">UID</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `;
}

// ── Краткий результат для таблицы ────────────────────────────
function getShortSummary(testId, r) {
  if (!r) return '—';
  switch(testId) {
    case 'mbti':     return r.type ? `${r.type} — ${r.typeName||''}` : '—';
    case 'bigfive':  return r.percentages ? `O:${r.percentages.O}% E:${r.percentages.E}%` : '—';
    case 'eysenck':  return r.temperament || '—';
    case 'pdo':      return r.leading || '—';
    case 'leonhard': {
      const t = Object.entries(r.scores||{}).sort((a,b)=>b[1]-a[1])[0];
      return t ? `${t[0]} (${t[1]})` : '—';
    }
    case 'cattell':  return '16PF профиль';
    case 'iq':       return r.iq ? `IQ ${r.iq} — ${r.category}` : '—';
    default:         return '—';
  }
}

// ── Заглушка "нет данных" ─────────────────────────────────────
function noDataPlaceholder(cardId, text) {
  const card = document.getElementById(cardId);
  if (!card) return;
  const canvas = card.querySelector('canvas');
  if (canvas) canvas.style.display = 'none';
  const placeholder = document.createElement('div');
  placeholder.style.cssText = 'display:flex;align-items:center;justify-content:center;height:200px;color:var(--text-muted);font:400 0.875rem var(--font-body);';
  placeholder.textContent = text;
  card.appendChild(placeholder);
}

// ── Метаинформация (время обновления) ─────────────────────────
function updateMeta(data) {
  const el = document.getElementById('lastUpdated');
  if (el) el.textContent = `Обновлено: ${new Date().toLocaleTimeString('ru-RU')}`;
}
