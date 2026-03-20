/* assets/pages/admin.js — Расширенная админ-панель с вкладками */

import { showToast } from '../js/ui.js';
import { adminLoadAllResults, adminLoadUsers } from '../js/db.js';

const ADMIN_EMAILS = ['maksmlrd@gmail.com'];

const TEST_META = {
  mbti:     { name:'MBTI',        color:'#6366f1' },
  bigfive:  { name:'Big Five',    color:'#3b82f6' },
  eysenck:  { name:'Айзенк',      color:'#06b6d4' },
  pdo:      { name:'ПДО Личко',   color:'#8b5cf6' },
  leonhard: { name:'Леонгард',    color:'#ec4899' },
  cattell:  { name:'Кеттел 16PF', color:'#10b981' },
  iq:       { name:'IQ-тест',     color:'#f59e0b' },
};

const MBTI_GROUPS = {
  'Аналитики':    ['INTJ','INTP','ENTJ','ENTP'],
  'Дипломаты':    ['INFJ','INFP','ENFJ','ENFP'],
  'Стражи':       ['ISTJ','ISFJ','ESTJ','ESFJ'],
  'Исследователи':['ISTP','ISFP','ESTP','ESFP'],
};

let g_stats    = null;
let g_users    = [];
let g_rawRes   = [];
let g_charts   = {};
let g_activeTab = 'overview';

/* ═══════════════════════════════════════════════════════════════
   RENDER ENTRY
═══════════════════════════════════════════════════════════════ */
export async function renderAdminPage() {
  const app  = document.getElementById('app');
  const user = window.__currentUser;
  if (!app) return;

  if (!user || !ADMIN_EMAILS.includes(user.email)) {
    app.innerHTML = `
      <div style="min-height:80vh;display:flex;align-items:center;justify-content:center;text-align:center;position:relative;z-index:10;">
        <div>
          <div style="width:64px;height:64px;border-radius:50%;background:rgba(239,68,68,0.15);border:1px solid rgba(239,68,68,0.3);display:flex;align-items:center;justify-content:center;margin:0 auto 1rem;font-size:1.75rem;">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none"><rect x="3" y="11" width="18" height="11" rx="2" stroke="#ef4444" stroke-width="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="#ef4444" stroke-width="2" stroke-linecap="round"/></svg>
          </div>
          <h2 class="h3" style="margin-bottom:0.75rem;">Доступ запрещён</h2>
          <p class="text-secondary" style="margin-bottom:1.5rem;">
            ${!user ? 'Войдите в аккаунт администратора' : 'У вашего аккаунта нет прав доступа'}
          </p>
          ${!user
            ? `<a href="#/login" class="btn-primary">Войти</a>`
            : `<a href="#/" class="btn-ghost">На главную</a>`}
        </div>
      </div>
    `;
    return;
  }

  // Каркас страницы
  app.innerHTML = `
    <div style="padding-top:88px;padding-bottom:4rem;position:relative;z-index:10;min-height:100vh;">
      <div class="container" style="max-width:1280px;">

        <!-- Шапка -->
        <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:1rem;margin-bottom:1.75rem;">
          <div>
            <span class="section-label">Управление</span>
            <h1 class="h3" style="margin-top:0.2rem;">Панель администратора</h1>
          </div>
          <div style="display:flex;gap:0.75rem;align-items:center;">
            <span id="adminLastUpdate" class="text-muted" style="font-size:0.8rem;"></span>
            <button class="btn-ghost btn-sm" id="adminRefreshBtn" onclick="window.__adminRefresh()">
              Обновить
            </button>
          </div>
        </div>

        <!-- Баннер источника данных -->
        <div id="adminDataBanner" class="glass-card no-hover" style="padding:0.75rem 1.25rem;margin-bottom:1.5rem;display:flex;align-items:center;gap:0.75rem;font:400 0.875rem var(--font-body);">
          <div class="spinner" style="width:14px;height:14px;"></div>
          <span id="adminDataMsg">Загрузка данных из Firebase...</span>
        </div>

        <!-- Вкладки -->
        <div class="admin-tabs" id="adminTabs" style="display:flex;gap:0.5rem;margin-bottom:1.5rem;flex-wrap:wrap;">
          ${[
            { id:'overview',  label:'Обзор'        },
            { id:'charts',    label:'Графики'       },
            { id:'users',     label:'Пользователи'  },
            { id:'results',   label:'Прохождения'   },
            { id:'tests',     label:'Тесты'         },
            { id:'export',    label:'Экспорт'       },
          ].map(t => `
            <button class="admin-tab-btn ${t.id === 'overview' ? 'active' : ''}"
              data-tab="${t.id}"
              onclick="window.__adminTab('${t.id}')"
              style="padding:0.5rem 1.1rem;border-radius:var(--radius-full);font:500 0.875rem var(--font-body);border:1px solid var(--glass-border);background:${t.id==='overview'?'rgba(139,92,246,0.2)':'var(--glass-bg)'};color:${t.id==='overview'?'var(--text-accent)':'var(--text-secondary)'};cursor:pointer;transition:all .2s;">
              ${t.label}
            </button>
          `).join('')}
        </div>

        <!-- Контент вкладки -->
        <div id="adminTabContent">
          <div style="text-align:center;padding:4rem;">
            <div class="spinner" style="width:32px;height:32px;margin-inline:auto;"></div>
          </div>
        </div>

      </div>
    </div>
  `;

  window.__adminRefresh = () => loadData(true);
  window.__adminTab     = (id) => switchAdminTab(id);

  await loadData(false);
}

/* ═══════════════════════════════════════════════════════════════
   DATA LOADING
═══════════════════════════════════════════════════════════════ */
async function loadData(force = false) {
  const btn = document.getElementById('adminRefreshBtn');
  const msg = document.getElementById('adminDataMsg');
  const ban = document.getElementById('adminDataBanner');
  if (btn) btn.textContent = 'Загрузка...';

  try {
    // Пробуем allResults (новая коллекция)
    let rawResults = await adminLoadAllResults(1000);

    // Если пусто — пробуем читать из users (старый способ)
    if (!rawResults.length && window.__currentUser) {
      rawResults = await collectFromUsers();
    }

    g_rawRes = rawResults;
    g_users  = await adminLoadUsers(500).catch(() => []);
    g_stats  = processStats(rawResults, g_users.length || countUniqueUids(rawResults));

    // Обновляем баннер
    if (ban) {
      ban.style.borderColor = rawResults.length
        ? 'rgba(16,185,129,0.3)' : 'rgba(245,158,11,0.3)';
      ban.style.background  = rawResults.length
        ? 'rgba(16,185,129,0.06)' : 'rgba(245,158,11,0.06)';
    }
    if (msg) {
      msg.innerHTML = rawResults.length
        ? `Данные Firebase: <strong>${g_stats.userCount}</strong> пользователей, <strong>${g_stats.totalTests}</strong> прохождений`
        : `Данные не найдены в Firebase. Результаты появятся после прохождения тестов.`;
    }
  } catch (e) {
    console.error('Admin load error:', e);
    g_stats  = processStats([], 0);
    g_rawRes = [];
    if (msg) msg.innerHTML = `Ошибка подключения к Firebase: ${e.message}`;
  }

  const upd = document.getElementById('adminLastUpdate');
  if (upd) upd.textContent = 'Обновлено: ' + new Date().toLocaleTimeString('ru-RU');
  if (btn) btn.textContent = 'Обновить';

  switchAdminTab(g_activeTab);
}

async function collectFromUsers() {
  const all = [];
  try {
    const usersSnap = await firebase.firestore().collection('users').limit(500).get();
    await Promise.all(usersSnap.docs.map(async uDoc => {
      const uid = uDoc.id;
      const rSnap = await firebase.firestore().collection('users').doc(uid)
        .collection('results').get();
      rSnap.forEach(r => all.push({ uid, testId: r.id, ...r.data() }));
    }));
  } catch {}
  return all;
}

function countUniqueUids(rawResults) {
  return new Set(rawResults.map(r => r.uid).filter(Boolean)).size;
}

/* ═══════════════════════════════════════════════════════════════
   TAB SWITCHING
═══════════════════════════════════════════════════════════════ */
function switchAdminTab(tabId) {
  g_activeTab = tabId;

  // Стили кнопок
  document.querySelectorAll('.admin-tab-btn').forEach(btn => {
    const active = btn.dataset.tab === tabId;
    btn.style.background = active ? 'rgba(139,92,246,0.2)' : 'var(--glass-bg)';
    btn.style.color = active ? 'var(--text-accent)' : 'var(--text-secondary)';
    btn.style.borderColor = active ? 'rgba(139,92,246,0.4)' : 'var(--glass-border)';
  });

  const content = document.getElementById('adminTabContent');
  if (!content) return;

  // Уничтожаем старые чарты
  Object.values(g_charts).forEach(c => { try { c.destroy(); } catch {} });
  g_charts = {};

  if (!g_stats) { content.innerHTML = '<p class="text-muted" style="padding:2rem;">Загрузка...</p>'; return; }

  switch (tabId) {
    case 'overview':  renderTabOverview(content);  break;
    case 'charts':    renderTabCharts(content);    break;
    case 'users':     renderTabUsers(content);     break;
    case 'results':   renderTabResults(content);   break;
    case 'tests':     renderTabTests(content);     break;
    case 'export':    renderTabExport(content);    break;
  }
}

/* ═══════════════════════════════════════════════════════════════
   TAB: OVERVIEW
═══════════════════════════════════════════════════════════════ */
function renderTabOverview(el) {
  const s = g_stats;
  const topMBTI = Object.entries(s.mbtiTypes).sort((a,b)=>b[1]-a[1])[0];
  const topTemp = Object.entries(s.temperaments).sort((a,b)=>b[1]-a[1])[0];
  const mostPop = Object.entries(s.testCounts).sort((a,b)=>b[1]-a[1])[0];
  const completionRate = s.userCount > 0 ? Math.round((s.totalTests / s.userCount) * 10) / 10 : 0;

  const kpiCards = [
    { label:'Пользователи',  value: s.userCount,          sub:'зарегистрировано',                 color:'#8b5cf6' },
    { label:'Прохождений',   value: s.totalTests,          sub:'всего тестов',                     color:'#3b82f6' },
    { label:'Средний IQ',    value: s.iqAvg || '—',        sub:`из ${s.iqValues.length} тестов`,   color:'#f59e0b' },
    { label:'Тестов/юзер',   value: completionRate || '—', sub:'среднее',                          color:'#06b6d4' },
    { label:'Топ MBTI',      value: topMBTI?.[0] || '—',   sub: topMBTI ? `${topMBTI[1]} чел.` : 'нет данных', color:'#6366f1' },
    { label:'Топ темперамент', value: topTemp?.[0] || '—', sub: topTemp ? `${topTemp[1]} чел.` : 'нет данных', color:'#ec4899' },
    { label:'Популярный тест', value: mostPop ? TEST_META[mostPop[0]]?.name || mostPop[0] : '—', sub: mostPop ? `${mostPop[1]} раз` : 'нет данных', color:'#10b981' },
    { label:'Тестов доступно', value: 7, sub:'инструментов', color:'#f59e0b' },
  ];

  el.innerHTML = `
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:1rem;margin-bottom:2rem;">
      ${kpiCards.map(c => `
        <div class="glass-card no-hover" style="padding:1.25rem 1.5rem;">
          <div style="font:700 1.8rem/1 var(--font-display);color:${c.color};margin-bottom:0.35rem;">${c.value}</div>
          <div style="font:600 0.8rem var(--font-body);color:var(--text-secondary);">${c.label}</div>
          <div style="font:400 0.72rem var(--font-body);color:var(--text-muted);margin-top:0.15rem;">${c.sub}</div>
        </div>
      `).join('')}
    </div>

    <!-- Быстрый прогресс по тестам -->
    <div class="glass-card no-hover" style="padding:1.5rem;margin-bottom:1.5rem;">
      <h3 class="h5" style="margin-bottom:1.25rem;">Покрытие тестов</h3>
      <div style="display:flex;flex-direction:column;gap:0.875rem;">
        ${Object.entries(TEST_META).map(([id, meta]) => {
          const cnt   = s.testCounts[id] || 0;
          const pct   = s.totalTests > 0 ? Math.round(cnt / s.totalTests * 100) : 0;
          return `
            <div>
              <div style="display:flex;justify-content:space-between;margin-bottom:0.3rem;">
                <span style="font:500 0.875rem var(--font-body);color:var(--text-secondary);">${meta.name}</span>
                <span style="font:600 0.875rem var(--font-body);color:var(--text-accent);">${cnt} <span style="font-weight:400;color:var(--text-muted);">(${pct}%)</span></span>
              </div>
              <div style="height:6px;background:rgba(255,255,255,0.06);border-radius:3px;overflow:hidden;">
                <div style="height:100%;width:${pct}%;background:${meta.color};border-radius:3px;transition:width 0.6s ease;"></div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>

    <!-- Последние прохождения (топ-5) -->
    ${renderRecentMini(g_rawRes.slice(0, 5))}
  `;
}

function renderRecentMini(items) {
  if (!items.length) return '<div class="glass-card no-hover" style="padding:1.5rem;"><p class="text-muted" style="font-size:0.875rem;">Нет данных о прохождениях</p></div>';
  const sorted = [...items].sort((a,b) => {
    const da = a.completedAt ? new Date(a.completedAt) : 0;
    const db2 = b.completedAt ? new Date(b.completedAt) : 0;
    return db2 - da;
  }).slice(0, 5);

  return `
    <div class="glass-card no-hover" style="padding:1.5rem;">
      <h3 class="h5" style="margin-bottom:1rem;">Последние прохождения</h3>
      <div style="display:flex;flex-direction:column;gap:0.75rem;">
        ${sorted.map(item => {
          const meta    = TEST_META[item.testId] || { name: item.testId, color:'#6366f1' };
          const r       = item.result || item;
          const summary = getShortSummary(item.testId, r);
          const date    = item.completedAt ? new Date(item.completedAt).toLocaleDateString('ru-RU') : '—';
          return `
            <div style="display:flex;align-items:center;gap:1rem;padding:0.6rem 0;border-bottom:1px solid rgba(255,255,255,0.04);">
              <div style="width:8px;height:8px;border-radius:50%;background:${meta.color};flex-shrink:0;"></div>
              <div style="flex:1;min-width:0;">
                <span style="font:500 0.875rem var(--font-body);color:var(--text-secondary);">${meta.name}</span>
                <span style="font:400 0.8rem var(--font-body);color:var(--text-accent);margin-left:0.5rem;">${summary}</span>
              </div>
              <span style="font:400 0.75rem var(--font-body);color:var(--text-muted);flex-shrink:0;">${date}</span>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;
}

/* ═══════════════════════════════════════════════════════════════
   TAB: CHARTS
═══════════════════════════════════════════════════════════════ */
function renderTabCharts(el) {
  const s = g_stats;

  el.innerHTML = `
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:1.5rem;">
      <div class="glass-card no-hover" style="padding:1.5rem;" id="ac_mbti">
        <h3 class="h5" style="margin-bottom:1rem;">Типы MBTI</h3>
        <div style="height:240px;position:relative;"><canvas id="ch_mbti"></canvas></div>
      </div>
      <div class="glass-card no-hover" style="padding:1.5rem;" id="ac_temp">
        <h3 class="h5" style="margin-bottom:1rem;">Темпераменты</h3>
        <div style="height:240px;position:relative;"><canvas id="ch_temp"></canvas></div>
      </div>
      <div class="glass-card no-hover" style="padding:1.5rem;" id="ac_iq">
        <h3 class="h5" style="margin-bottom:1rem;">Распределение IQ</h3>
        <div style="height:240px;position:relative;"><canvas id="ch_iq"></canvas></div>
      </div>
      <div class="glass-card no-hover" style="padding:1.5rem;" id="ac_pop">
        <h3 class="h5" style="margin-bottom:1rem;">Популярность тестов</h3>
        <div style="height:240px;position:relative;"><canvas id="ch_pop"></canvas></div>
      </div>
      <div class="glass-card no-hover" style="padding:1.5rem;" id="ac_bf">
        <h3 class="h5" style="margin-bottom:1rem;">Big Five — средние</h3>
        <div style="height:240px;position:relative;"><canvas id="ch_bf"></canvas></div>
      </div>
      <div class="glass-card no-hover" style="padding:1.5rem;" id="ac_leon">
        <h3 class="h5" style="margin-bottom:1rem;">Акцентуации Леонгарда</h3>
        <div style="height:240px;position:relative;"><canvas id="ch_leon"></canvas></div>
      </div>
      <div class="glass-card no-hover" style="padding:1.5rem;" id="ac_pdo">
        <h3 class="h5" style="margin-bottom:1rem;">ПДО Личко — типы</h3>
        <div style="height:240px;position:relative;"><canvas id="ch_pdo"></canvas></div>
      </div>
      <div class="glass-card no-hover" style="padding:1.5rem;" id="ac_mbtigrp">
        <h3 class="h5" style="margin-bottom:1rem;">MBTI группы</h3>
        <div style="height:240px;position:relative;"><canvas id="ch_mbtigrp"></canvas></div>
      </div>
    </div>
  `;

  requestAnimationFrame(() => renderAllCharts(s));
}

const COPTS = {
  responsive: true, maintainAspectRatio: false,
  animation: { duration: 700 },
  plugins: { legend: { labels: { color:'rgba(255,255,255,0.65)', font:{size:11} } } },
};

function renderAllCharts(s) {
  if (typeof Chart === 'undefined') return;

  const mkBar = (id, labels, data, colors, opts={}) => {
    const ctx = document.getElementById(id);
    if (!ctx) return null;
    return new Chart(ctx, {
      type:'bar',
      data:{ labels, datasets:[{ data, backgroundColor: colors, borderRadius:6, borderWidth:0 }] },
      options:{ ...COPTS, ...opts, plugins:{ ...COPTS.plugins, legend:{display:false}, ...opts.plugins },
        scales: {
          y:{ ticks:{color:'rgba(255,255,255,0.4)'}, grid:{color:'rgba(255,255,255,0.05)'} },
          x:{ ticks:{color:'rgba(255,255,255,0.55)', font:{size:10}}, grid:{display:false} },
          ...(opts.scales||{})
        }
      }
    });
  };

  const mkDoughnut = (id, labels, data, colors) => {
    const ctx = document.getElementById(id);
    if (!ctx) return null;
    return new Chart(ctx, {
      type:'doughnut',
      data:{ labels, datasets:[{ data, backgroundColor:colors, borderColor:'rgba(0,0,0,0.3)', borderWidth:2 }] },
      options:{ ...COPTS, cutout:'52%' }
    });
  };

  // MBTI
  const mbtiL = Object.keys(s.mbtiTypes);
  if (mbtiL.length) g_charts.mbti = mkBar('ch_mbti', mbtiL, Object.values(s.mbtiTypes), mbtiL.map((_,i)=>`hsla(${250+i*22},70%,62%,0.75)`));
  else noData('ac_mbti', 'Нет данных MBTI');

  // Темпераменты
  const tC = { Холерик:'rgba(239,68,68,0.75)', Сангвиник:'rgba(245,158,11,0.75)', Флегматик:'rgba(59,130,246,0.75)', Меланхолик:'rgba(139,92,246,0.75)' };
  const tL = Object.keys(s.temperaments);
  if (tL.length) g_charts.temp = mkDoughnut('ch_temp', tL, Object.values(s.temperaments), tL.map(l=>tC[l]||'rgba(99,102,241,0.7)'));
  else noData('ac_temp', 'Нет данных Айзенка');

  // IQ бины
  const iqBins = {'70–79':0,'80–89':0,'90–99':0,'100–109':0,'110–119':0,'120–129':0,'130+':0};
  s.iqValues.forEach(v => {
    if(v<80)iqBins['70–79']++;else if(v<90)iqBins['80–89']++;else if(v<100)iqBins['90–99']++;
    else if(v<110)iqBins['100–109']++;else if(v<120)iqBins['110–119']++;else if(v<130)iqBins['120–129']++;else iqBins['130+']++;
  });
  g_charts.iq = mkBar('ch_iq', Object.keys(iqBins), Object.values(iqBins),
    Object.keys(iqBins).map((_,i)=>`hsla(${250+i*12},68%,${50+i*3}%,0.75)`));

  // Популярность
  const popL = Object.keys(TEST_META);
  g_charts.pop = mkBar('ch_pop', popL.map(id=>TEST_META[id].name), popL.map(id=>s.testCounts[id]||0),
    popL.map(id=>TEST_META[id].color+'bb'), { indexAxis:'y', scales:{
      x:{ ticks:{color:'rgba(255,255,255,0.4)'}, grid:{color:'rgba(255,255,255,0.05)'} },
      y:{ ticks:{color:'rgba(255,255,255,0.6)', font:{size:11}}, grid:{display:false} }
    }});

  // Big Five
  if (s.bigfiveCount > 0) {
    g_charts.bf = mkBar('ch_bf',
      ['Открытость','Добросовест.','Экстраверсия','Доброжел.','Нейротизм'],
      ['O','C','E','A','N'].map(f=>s.bigfiveAvg[f]),
      ['rgba(139,92,246,0.7)','rgba(16,185,129,0.7)','rgba(6,182,212,0.7)','rgba(236,72,153,0.7)','rgba(245,158,11,0.7)'],
      { scales:{ y:{ min:0, max:100, ticks:{color:'rgba(255,255,255,0.4)'}, grid:{color:'rgba(255,255,255,0.05)'} }, x:{ticks:{color:'rgba(255,255,255,0.6)',font:{size:10}},grid:{display:false}} } }
    );
  } else noData('ac_bf', 'Нет данных Big Five');

  // Леонгард
  const leonArr = Object.entries(s.leonhardTop).sort((a,b)=>b[1]-a[1]).slice(0,8);
  if (leonArr.length) g_charts.leon = mkBar('ch_leon', leonArr.map(([k])=>k), leonArr.map(([,v])=>v), 'rgba(236,72,153,0.65)');
  else noData('ac_leon', 'Нет данных Леонгарда');

  // ПДО
  const pdoArr = Object.entries(s.pdoTypes).sort((a,b)=>b[1]-a[1]);
  if (pdoArr.length) g_charts.pdo = mkBar('ch_pdo', pdoArr.map(([k])=>k), pdoArr.map(([,v])=>v), 'rgba(139,92,246,0.65)');
  else noData('ac_pdo', 'Нет данных ПДО');

  // MBTI группы
  const grpL = Object.keys(MBTI_GROUPS);
  const grpV = grpL.map(g => MBTI_GROUPS[g].reduce((s,t)=>(s+(g_stats.mbtiTypes[t]||0)),0));
  if (grpV.some(v=>v>0)) g_charts.mbtiGrp = mkDoughnut('ch_mbtigrp', grpL, grpV,
    ['rgba(139,92,246,0.75)','rgba(59,130,246,0.75)','rgba(16,185,129,0.75)','rgba(245,158,11,0.75)']);
  else noData('ac_mbtigrp', 'Нет данных групп MBTI');
}

function noData(cardId, text) {
  const card = document.getElementById(cardId);
  if (!card) return;
  const cv = card.querySelector('canvas');
  if (cv) cv.style.display = 'none';
  const d = document.createElement('div');
  d.style.cssText = 'display:flex;align-items:center;justify-content:center;height:180px;color:var(--text-muted);font:400 0.875rem var(--font-body);';
  d.textContent = text;
  card.appendChild(d);
}

/* ═══════════════════════════════════════════════════════════════
   TAB: USERS
═══════════════════════════════════════════════════════════════ */
function renderTabUsers(el) {
  const s = g_stats;

  // Подсчёт тестов по UID
  const uidCounts = {};
  g_rawRes.forEach(r => {
    if (r.uid) uidCounts[r.uid] = (uidCounts[r.uid] || 0) + 1;
  });

  if (!g_users.length && !Object.keys(uidCounts).length) {
    el.innerHTML = `
      <div class="glass-card no-hover" style="padding:2.5rem;text-align:center;">
        <p class="text-muted">Данные пользователей недоступны. Убедитесь, что правила Firebase позволяют администратору читать коллекцию users.</p>
      </div>`;
    return;
  }

  const displayUsers = g_users.length ? g_users : Object.keys(uidCounts).map(uid => ({ uid, email:uid, displayName:null }));

  el.innerHTML = `
    <div class="glass-card no-hover" style="padding:1.5rem;">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:1rem;flex-wrap:wrap;gap:0.75rem;">
        <h3 class="h5">Пользователи (${displayUsers.length})</h3>
        <input id="userSearch" class="input-field" placeholder="Поиск по email..." style="max-width:260px;padding:0.4rem 0.875rem;font-size:0.875rem;"
          oninput="window.__adminUserFilter(this.value)" />
      </div>
      <div style="overflow-x:auto;">
        <table style="width:100%;border-collapse:collapse;" id="usersTable">
          <thead>
            <tr style="border-bottom:1px solid rgba(255,255,255,0.08);">
              ${['#','Email / UID','Имя','Тестов пройдено','Зарегистрирован'].map(h=>`
                <th style="padding:0.5rem 1rem;text-align:left;font:600 0.72rem var(--font-body);color:var(--text-muted);text-transform:uppercase;letter-spacing:0.06em;white-space:nowrap;">${h}</th>
              `).join('')}
            </tr>
          </thead>
          <tbody id="usersTableBody">
            ${displayUsers.map((u, i) => `
              <tr data-email="${(u.email||u.uid||'').toLowerCase()}" style="border-bottom:1px solid rgba(255,255,255,0.04);">
                <td style="padding:0.75rem 1rem;color:var(--text-muted);font:400 0.8rem var(--font-body);">${i+1}</td>
                <td style="padding:0.75rem 1rem;font:400 0.8rem var(--font-body);color:var(--text-secondary);max-width:200px;overflow:hidden;text-overflow:ellipsis;">${u.email || u.uid?.slice(0,16)+'...' || '—'}</td>
                <td style="padding:0.75rem 1rem;font:500 0.875rem var(--font-body);">${u.displayName || '—'}</td>
                <td style="padding:0.75rem 1rem;">
                  <span style="display:inline-block;padding:0.2rem 0.6rem;border-radius:var(--radius-full);background:rgba(139,92,246,0.15);color:var(--text-accent);font:600 0.8rem var(--font-body);">
                    ${uidCounts[u.uid] || 0}
                  </span>
                </td>
                <td style="padding:0.75rem 1rem;color:var(--text-muted);font:400 0.78rem var(--font-body);">
                  ${u.createdAt?.toDate ? new Date(u.createdAt.toDate()).toLocaleDateString('ru-RU') :
                    u.updatedAt?.toDate ? new Date(u.updatedAt.toDate()).toLocaleDateString('ru-RU') : '—'}
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;

  window.__adminUserFilter = (q) => {
    document.querySelectorAll('#usersTableBody tr').forEach(row => {
      row.style.display = row.dataset.email?.includes(q.toLowerCase()) ? '' : 'none';
    });
  };
}

/* ═══════════════════════════════════════════════════════════════
   TAB: RESULTS (все прохождения)
═══════════════════════════════════════════════════════════════ */
function renderTabResults(el) {
  const sorted = [...g_rawRes].sort((a,b) => {
    const da = a.completedAt ? new Date(a.completedAt) : 0;
    const db2 = b.completedAt ? new Date(b.completedAt) : 0;
    return db2 - da;
  });

  let filterTest = 'all';

  const renderTable = (items) => `
    <div style="overflow-x:auto;">
      <table style="width:100%;border-collapse:collapse;">
        <thead>
          <tr style="border-bottom:1px solid rgba(255,255,255,0.08);">
            ${['Дата','Тест','Результат','UID пользователя'].map(h=>`
              <th style="padding:0.5rem 1rem;text-align:left;font:600 0.72rem var(--font-body);color:var(--text-muted);text-transform:uppercase;letter-spacing:0.06em;white-space:nowrap;">${h}</th>
            `).join('')}
          </tr>
        </thead>
        <tbody>
          ${items.slice(0, 200).map(item => {
            const meta    = TEST_META[item.testId] || { name:item.testId, color:'#6366f1' };
            const r       = item.result || item;
            const summary = getShortSummary(item.testId, r);
            const date    = item.completedAt ? new Date(item.completedAt).toLocaleDateString('ru-RU') : '—';
            return `
              <tr style="border-bottom:1px solid rgba(255,255,255,0.04);">
                <td style="padding:0.75rem 1rem;color:var(--text-muted);font:400 0.8rem var(--font-body);white-space:nowrap;">${date}</td>
                <td style="padding:0.75rem 1rem;">
                  <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${meta.color};margin-right:0.5rem;vertical-align:middle;"></span>
                  <span style="font:500 0.875rem var(--font-body);color:var(--text-secondary);">${meta.name}</span>
                </td>
                <td style="padding:0.75rem 1rem;font:600 0.875rem var(--font-display);color:var(--text-accent);">${summary}</td>
                <td style="padding:0.75rem 1rem;font:400 0.75rem var(--font-body);color:var(--text-muted);">${item.uid?.slice(0,16) || 'local'}...</td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
      ${items.length > 200 ? `<p class="text-muted" style="padding:0.75rem 1rem;font-size:0.8rem;">Показано 200 из ${items.length}. Используйте экспорт для полного списка.</p>` : ''}
    </div>
  `;

  el.innerHTML = `
    <div class="glass-card no-hover" style="padding:1.5rem;">
      <div style="display:flex;align-items:center;gap:0.75rem;margin-bottom:1rem;flex-wrap:wrap;">
        <h3 class="h5" style="margin-right:auto;">Все прохождения (${sorted.length})</h3>
        <select id="resultsFilterTest" class="input-field" style="padding:0.4rem 0.875rem;font-size:0.875rem;max-width:160px;"
          onchange="window.__adminFilterResults(this.value)">
          <option value="all">Все тесты</option>
          ${Object.entries(TEST_META).map(([id,m])=>`<option value="${id}">${m.name}</option>`).join('')}
        </select>
      </div>
      <div id="resultsTableWrap">
        ${sorted.length ? renderTable(sorted) : '<p class="text-muted" style="padding:2rem;text-align:center;font-size:0.875rem;">Данных о прохождениях нет</p>'}
      </div>
    </div>
  `;

  window.__adminFilterResults = (testId) => {
    const wrap = document.getElementById('resultsTableWrap');
    if (!wrap) return;
    const filtered = testId === 'all' ? sorted : sorted.filter(r => r.testId === testId);
    wrap.innerHTML = filtered.length ? renderTable(filtered) : '<p class="text-muted" style="padding:2rem;text-align:center;font-size:0.875rem;">Нет прохождений по выбранному тесту</p>';
  };
}

/* ═══════════════════════════════════════════════════════════════
   TAB: TESTS info
═══════════════════════════════════════════════════════════════ */
function renderTabTests(el) {
  const testInfo = {
    mbti:     { full:'Myers-Briggs Type Indicator', q:60,  time:'15–20 мин', category:'Личность' },
    bigfive:  { full:'Big Five OCEAN',              q:50,  time:'10–15 мин', category:'Личность' },
    eysenck:  { full:'EPI Айзенка',                 q:57,  time:'10 мин',    category:'Темперамент' },
    pdo:      { full:'ПДО Личко',                   q:25,  time:'30–40 мин', category:'Акцентуации' },
    leonhard: { full:'Тест Леонгарда',              q:88,  time:'15–20 мин', category:'Акцентуации' },
    cattell:  { full:'16PF Кеттела',                q:105, time:'30–35 мин', category:'Личность' },
    iq:       { full:'IQ-тест',                     q:40,  time:'30 мин',    category:'Интеллект' },
  };

  el.innerHTML = `
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:1.25rem;">
      ${Object.entries(TEST_META).map(([id, meta]) => {
        const info  = testInfo[id] || {};
        const cnt   = g_stats.testCounts[id] || 0;
        const pct   = g_stats.totalTests > 0 ? Math.round(cnt / g_stats.totalTests * 100) : 0;
        return `
          <div class="glass-card no-hover" style="padding:1.5rem;">
            <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:0.75rem;margin-bottom:1rem;">
              <div>
                <h3 class="h5">${meta.name}</h3>
                <p style="font:400 0.8rem var(--font-body);color:var(--text-muted);margin-top:0.2rem;">${info.full || ''}</p>
              </div>
              <span style="display:inline-block;padding:0.2rem 0.6rem;border-radius:var(--radius-full);background:${meta.color}22;color:${meta.color};font:600 0.75rem var(--font-body);white-space:nowrap;">${info.category}</span>
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.75rem;margin-bottom:1rem;">
              <div style="padding:0.625rem;border-radius:var(--radius-sm);background:rgba(255,255,255,0.03);">
                <div style="font:700 1.2rem var(--font-display);color:${meta.color};">${info.q || '—'}</div>
                <div style="font:400 0.72rem var(--font-body);color:var(--text-muted);">вопросов</div>
              </div>
              <div style="padding:0.625rem;border-radius:var(--radius-sm);background:rgba(255,255,255,0.03);">
                <div style="font:700 1.2rem var(--font-display);color:${meta.color};">${cnt}</div>
                <div style="font:400 0.72rem var(--font-body);color:var(--text-muted);">прохождений</div>
              </div>
            </div>
            <div style="font:400 0.78rem var(--font-body);color:var(--text-muted);margin-bottom:0.5rem;">Время: ${info.time}</div>
            <div style="height:5px;background:rgba(255,255,255,0.06);border-radius:3px;overflow:hidden;">
              <div style="height:100%;width:${pct}%;background:${meta.color};border-radius:3px;"></div>
            </div>
            <div style="font:400 0.72rem var(--font-body);color:var(--text-muted);margin-top:0.3rem;">${pct}% от всех прохождений</div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

/* ═══════════════════════════════════════════════════════════════
   TAB: EXPORT
═══════════════════════════════════════════════════════════════ */
function renderTabExport(el) {
  el.innerHTML = `
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:1.25rem;">

      <div class="glass-card no-hover" style="padding:1.75rem;">
        <h3 class="h5" style="margin-bottom:0.5rem;">Все результаты (JSON)</h3>
        <p class="body-sm text-secondary" style="margin-bottom:1.25rem;">Скачать все прохождения всех пользователей в формате JSON</p>
        <button class="btn-primary btn-sm" onclick="window.__adminExportJSON()">Скачать JSON</button>
      </div>

      <div class="glass-card no-hover" style="padding:1.75rem;">
        <h3 class="h5" style="margin-bottom:0.5rem;">Статистика (CSV)</h3>
        <p class="body-sm text-secondary" style="margin-bottom:1.25rem;">Таблица всех прохождений в формате CSV для Excel</p>
        <button class="btn-primary btn-sm" onclick="window.__adminExportCSV()">Скачать CSV</button>
      </div>

      <div class="glass-card no-hover" style="padding:1.75rem;">
        <h3 class="h5" style="margin-bottom:0.5rem;">Сводный отчёт</h3>
        <p class="body-sm text-secondary" style="margin-bottom:1.25rem;">Агрегированная статистика по всем тестам (JSON)</p>
        <button class="btn-ghost btn-sm" onclick="window.__adminExportStats()">Скачать статистику</button>
      </div>

    </div>

    <div class="glass-card no-hover" style="padding:1.5rem;margin-top:1.25rem;">
      <h3 class="h5" style="margin-bottom:1rem;">Правила Firestore для полного доступа</h3>
      <p class="body-sm text-secondary" style="margin-bottom:1rem;">
        Добавьте эти правила в Firebase Console → Firestore → Правила, чтобы администратор мог читать все данные:
      </p>
      <pre style="background:rgba(0,0,0,0.3);padding:1.25rem;border-radius:var(--radius-md);font:400 0.8rem/1.7 'Courier New',monospace;color:#a78bfa;overflow-x:auto;white-space:pre-wrap;">rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Пользователи могут читать/писать свои данные
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Коллекция allResults: пишут все авторизованные,
    // читает только администратор
    match /allResults/{docId} {
      allow write: if request.auth != null;
      allow read: if request.auth != null
        && request.auth.token.email in ['maksmlrd@gmail.com'];
    }
  }
}</pre>
    </div>
  `;

  window.__adminExportJSON = () => {
    const blob = new Blob([JSON.stringify({ exportedAt: new Date().toISOString(), results: g_rawRes }, null, 2)], { type:'application/json' });
    downloadBlob(blob, `psychotest_all_results_${dateTag()}.json`);
    showToast('JSON скачан', 'success');
  };

  window.__adminExportCSV = () => {
    const rows = [['Date','TestId','TestName','UID','Summary']];
    g_rawRes.forEach(item => {
      const r = item.result || item;
      rows.push([
        item.completedAt ? new Date(item.completedAt).toLocaleDateString('ru-RU') : '—',
        item.testId || '—',
        TEST_META[item.testId]?.name || item.testId || '—',
        item.uid || '—',
        getShortSummary(item.testId, r)
      ]);
    });
    const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g,'""')}"`).join(',')).join('\n');
    const blob = new Blob(['\uFEFF'+csv], { type:'text/csv;charset=utf-8;' });
    downloadBlob(blob, `psychotest_results_${dateTag()}.csv`);
    showToast('CSV скачан', 'success');
  };

  window.__adminExportStats = () => {
    const blob = new Blob([JSON.stringify({ exportedAt: new Date().toISOString(), stats: g_stats }, null, 2)], { type:'application/json' });
    downloadBlob(blob, `psychotest_stats_${dateTag()}.json`);
    showToast('Статистика скачана', 'success');
  };
}

function downloadBlob(blob, name) {
  const url = URL.createObjectURL(blob);
  const a = Object.assign(document.createElement('a'), { href:url, download:name });
  a.click(); URL.revokeObjectURL(url);
}

function dateTag() {
  return new Date().toISOString().slice(0,10).replace(/-/g,'');
}

/* ═══════════════════════════════════════════════════════════════
   PROCESS STATS
═══════════════════════════════════════════════════════════════ */
function processStats(allResults, userCount) {
  const s = {
    userCount,
    totalTests: allResults.length,
    testCounts: {}, mbtiTypes: {}, mbtiGroups: {},
    temperaments: {}, iqValues: [], iqCategories: {},
    iqAvg: 0, bigfiveAvg:{O:0,C:0,E:0,A:0,N:0}, bigfiveCount:0,
    leonhardTop: {}, pdoTypes: {}, recent: [],
  };

  allResults.forEach(item => {
    const { testId, result, completedAt, uid } = item;
    const r = result?.result || result || item;

    s.testCounts[testId] = (s.testCounts[testId]||0) + 1;

    if (testId === 'mbti' && r?.type) {
      s.mbtiTypes[r.type] = (s.mbtiTypes[r.type]||0) + 1;
      for (const [grp, types] of Object.entries(MBTI_GROUPS)) {
        if (types.includes(r.type)) s.mbtiGroups[grp] = (s.mbtiGroups[grp]||0) + 1;
      }
    }
    if (testId === 'eysenck' && r?.temperament)
      s.temperaments[r.temperament] = (s.temperaments[r.temperament]||0) + 1;
    if (testId === 'iq' && r?.iq) {
      s.iqValues.push(r.iq);
      s.iqCategories[r.category||'Средний'] = (s.iqCategories[r.category||'Средний']||0) + 1;
    }
    if (testId === 'bigfive' && r?.percentages) {
      ['O','C','E','A','N'].forEach(f => { s.bigfiveAvg[f] = (s.bigfiveAvg[f]||0) + (r.percentages[f]||0); });
      s.bigfiveCount++;
    }
    if (testId === 'leonhard' && r?.scores) {
      const top = Object.entries(r.scores).sort((a,b)=>b[1]-a[1])[0];
      if (top) s.leonhardTop[top[0]] = (s.leonhardTop[top[0]]||0) + 1;
    }
    if (testId === 'pdo' && r?.leading)
      s.pdoTypes[r.leading] = (s.pdoTypes[r.leading]||0) + 1;

    s.recent.push({ testId, uid: uid||'local', result: r, completedAt: completedAt||'' });
  });

  if (s.iqValues.length) s.iqAvg = Math.round(s.iqValues.reduce((a,b)=>a+b,0)/s.iqValues.length);
  if (s.bigfiveCount > 0) ['O','C','E','A','N'].forEach(f => { s.bigfiveAvg[f] = Math.round(s.bigfiveAvg[f]/s.bigfiveCount); });
  s.recent.sort((a,b) => (b.completedAt||'') > (a.completedAt||'') ? 1 : -1);

  return s;
}

function getShortSummary(testId, r) {
  if (!r) return '—';
  switch(testId) {
    case 'mbti':     return r.type ? `${r.type}${r.typeName?' — '+r.typeName:''}` : '—';
    case 'bigfive':  return r.percentages ? `O:${r.percentages.O}% E:${r.percentages.E}%` : '—';
    case 'eysenck':  return r.temperament || '—';
    case 'pdo':      return r.leading || '—';
    case 'leonhard': { const t=Object.entries(r.scores||{}).sort((a,b)=>b[1]-a[1])[0]; return t?`${t[0]} (${t[1]})`:'—'; }
    case 'cattell':  return '16PF профиль';
    case 'iq':       return r.iq ? `IQ ${r.iq}${r.category?' — '+r.category:''}` : '—';
    default:         return '—';
  }
}
