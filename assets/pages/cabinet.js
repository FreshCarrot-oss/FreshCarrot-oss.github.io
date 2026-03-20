/* Файл: assets/pages/cabinet.js */
/* Личный кабинет: 4 вкладки — тесты, профиль, AI-портрет, настройки */

import { loadAllResults, loadPromptHistory, deleteAllResults, exportUserData } from '../js/db.js';
import { renderCombinedProfile } from '../js/results/combined-profile.js';
import { renderPromptBlock }     from '../js/prompt-generator.js';
import { updateDisplayName, updateUserPassword, logout } from '../js/auth.js';
import { showToast, showConfirm, formatDate, formatDateShort } from '../js/ui.js';
import { router } from '../js/router.js';

const ALL_TESTS = [
  { id:'mbti',     name:'MBTI',         icon:'🧩' },
  { id:'bigfive',  name:'Big Five',     icon:'🌊' },
  { id:'eysenck',  name:'Айзенк',       icon:'🔥' },
  { id:'pdo',      name:'ПДО Личко',    icon:'🎭' },
  { id:'leonhard', name:'Леонгард',     icon:'🌗' },
  { id:'cattell',  name:'Кеттел 16PF', icon:'🔬' },
  { id:'iq',       name:'IQ-тест',      icon:'🧠' },
];

let activeTab = 'tests';

export async function renderCabinetPage(initialTab = 'tests') {
  const app  = document.getElementById('app');
  const user = window.__currentUser;
  if (!app || !user) { router.navigate('/login', true); return; }

  activeTab = initialTab || 'tests';

  const initials = (user.displayName || user.email || '?')
    .split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  const memberSince = user.metadata?.creationTime
    ? formatDateShort(user.metadata.creationTime) : '—';

  app.innerHTML = `
    <div class="cabinet-page" style="position:relative;z-index:10;">
      <div class="cabinet-container">
        <div class="cabinet-header glass-card no-hover">
          <div class="cabinet-avatar">${initials}</div>
          <div class="cabinet-user-info">
            <div class="cabinet-user-name">${user.displayName || 'Пользователь'}</div>
            <div class="cabinet-user-email">${user.email}</div>
            <div class="cabinet-stats">
              <span class="cabinet-stat"><span class="cabinet-stat-icon">📊</span> Загрузка...</span>
              <span class="cabinet-stat"><span class="cabinet-stat-icon">📅</span> В системе с ${memberSince}</span>
            </div>
          </div>
          <button class="btn-danger btn-sm" style="margin-left:auto;align-self:flex-start;" onclick="window.__logoutCab()">Выйти</button>
        </div>

        <div class="cabinet-tabs" id="cabinetTabs">
          ${[
            { id:'tests',    label:'📋 Мои тесты'      },
            { id:'profile',  label:'📊 Сводный профиль' },
            { id:'ai',       label:'🤖 AI-портрет'     },
            { id:'settings', label:'⚙️ Настройки'      },
          ].map(t => `
            <button class="cabinet-tab ${t.id === activeTab ? 'active' : ''}"
              data-tab="${t.id}" onclick="window.__switchCabTab('${t.id}')">${t.label}</button>
          `).join('')}
        </div>

        <div id="cabinetTabContent">
          <div style="text-align:center;padding:3rem;">
            <div class="spinner" style="width:32px;height:32px;margin-inline:auto;"></div>
          </div>
        </div>
      </div>
    </div>
  `;

  window.__switchCabTab = switchTab;
  window.__logoutCab    = async () => { await logout(); router.navigate('/'); };

  loadStats(user.uid);
  switchTab(activeTab);
}

async function switchTab(tabId) {
  activeTab = tabId;
  document.querySelectorAll('.cabinet-tab').forEach(btn =>
    btn.classList.toggle('active', btn.dataset.tab === tabId));

  const content = document.getElementById('cabinetTabContent');
  if (!content) return;
  content.innerHTML = `<div style="text-align:center;padding:3rem;"><div class="spinner" style="width:32px;height:32px;margin-inline:auto;"></div></div>`;

  const user = window.__currentUser;
  if (tabId === 'tests')    await renderTestsTab(content, user);
  else if (tabId === 'profile')  await renderProfileTab(content, user);
  else if (tabId === 'ai')       renderAITab(content);
  else if (tabId === 'settings') renderSettingsTab(content, user);
}

async function renderTestsTab(content, user) {
  let results = {};
  try { results = await loadAllResults(user.uid); } catch {}

  ALL_TESTS.forEach(t => {
    if (!results[t.id]) {
      const raw = localStorage.getItem(`result_${t.id}`);
      if (raw) { try { results[t.id] = { result: JSON.parse(raw) }; } catch {} }
    }
  });

  const passed    = ALL_TESTS.filter(t => results[t.id]);
  const notPassed = ALL_TESTS.filter(t => !results[t.id]);

  content.innerHTML = `
    ${passed.length === 0 ? `
      <div class="glass-card no-hover" style="padding:3rem;text-align:center;">
        <div style="font-size:3rem;margin-bottom:1rem;">📋</div>
        <h3 class="h4" style="margin-bottom:0.75rem;">Тестов пока нет</h3>
        <p class="text-secondary" style="margin-bottom:1.5rem;">Пройдите первый тест, чтобы увидеть результаты</p>
        <a href="#/tests" class="btn-primary">Перейти к тестам →</a>
      </div>
    ` : `
      <div class="tests-history-grid">
        ${passed.map(t => renderHistoryCard(t, results[t.id])).join('')}
        <a href="#/tests" class="glass-card" style="display:flex;align-items:center;justify-content:center;gap:0.75rem;padding:1.5rem;text-decoration:none;min-height:140px;color:var(--text-muted);">
          <span style="font-size:1.5rem;">+</span><span>Пройти новый тест</span>
        </a>
      </div>
    `}
    ${notPassed.length ? `
      <div class="untaken-section">
        <div class="untaken-section-title">Ещё не пройдены (${notPassed.length})</div>
        <div class="untaken-grid">
          ${notPassed.map(t => `
            <a href="#/test/${t.id}" class="untaken-card glass-card" style="text-decoration:none;">
              <span style="font-size:1.5rem;">${t.icon}</span>
              <span class="untaken-card-name">${t.name}</span>
            </a>`).join('')}
        </div>
      </div>` : ''}
  `;
}

function renderHistoryCard(test, data) {
  const result  = data?.result || data;
  const date    = data?.completedAt ? formatDateShort(data.completedAt) : '—';
  const s       = getResultSummary(test.id, result);
  return `
    <div class="history-card glass-card">
      <div class="history-card-header">
        <div>
          <span style="font-size:1.5rem;">${test.icon}</span>
          <div class="history-card-name" style="margin-top:0.25rem;">${test.name}</div>
        </div>
        <span class="badge badge-green">✓ Пройден</span>
      </div>
      <div class="history-card-result">${s.title}</div>
      <div class="history-card-subtitle">${s.sub}</div>
      <div class="history-card-date">${date}</div>
      <div class="history-card-actions">
        <a href="#/result/${test.id}" class="btn-primary btn-sm">Смотреть</a>
        <a href="#/test/${test.id}"   class="btn-ghost btn-sm">Пройти →</a>
      </div>
    </div>`;
}

function getResultSummary(testId, r) {
  switch(testId) {
    case 'mbti':     return { title: r?.type||'—',           sub: r?.typeName||'' };
    case 'bigfive':  return { title: 'OCEAN',                 sub: `O:${r?.percentages?.O}% E:${r?.percentages?.E}% N:${r?.percentages?.N}%` };
    case 'eysenck':  return { title: r?.temperament||'—',    sub: `E=${r?.E} N=${r?.N}` };
    case 'pdo':      return { title: r?.leading||'—',         sub: r?.secondary||'' };
    case 'leonhard': { const t=Object.entries(r?.scores||{}).sort((a,b)=>b[1]-a[1])[0]; return { title: t?.[0]||'—', sub:`${t?.[1]||0}/24` }; }
    case 'cattell':  return { title: '16PF', sub: 'Профиль из 16 факторов' };
    case 'iq':       return { title: `IQ ${r?.iq||'—'}`, sub: r?.category||'' };
    default:         return { title:'—', sub:'' };
  }
}

async function renderProfileTab(content, user) {
  content.innerHTML = `<div id="combinedProfileTab"></div>`;
  await renderCombinedProfile(user.uid);
}

function renderAITab(content) {
  const allResults = {};
  ALL_TESTS.forEach(t => {
    const raw = localStorage.getItem(`result_${t.id}`);
    if (raw) { try { allResults[t.id] = JSON.parse(raw); } catch {} }
  });
  window.__currentResults = allResults;

  content.innerHTML = `
    <div class="ai-portrait-section">
      ${renderPromptBlock(allResults)}
      <div class="prompt-history-section glass-card no-hover" id="promptHistory">
        <div class="prompt-history-title">История промптов</div>
        <p style="color:var(--text-muted);font:400 0.875rem var(--font-body);">Загрузка...</p>
      </div>
    </div>`;

  const user = window.__currentUser;
  if (user) {
    loadPromptHistory(user.uid, 5).then(history => {
      const el = document.getElementById('promptHistory');
      if (!el) return;
      el.innerHTML = `
        <div class="prompt-history-title">История промптов${history.length ? ' (' + history.length + ')' : ''}</div>
        ${history.length ? `<div class="prompt-history-list">
          ${history.map(h => `
            <div class="prompt-history-item">
              <div class="prompt-history-meta">
                <span class="prompt-history-goal">${h.goal||'Общий анализ'}</span>
                <span class="prompt-history-date">${h.createdAt?.toDate ? formatDateShort(h.createdAt.toDate()) : '—'}</span>
              </div>
              <div class="prompt-history-preview">${(h.prompt||'').slice(0,120)}...</div>
            </div>`).join('')}
        </div>` : '<p style="color:var(--text-muted);font:400 0.875rem var(--font-body);">Промптов пока нет</p>'}`;
    }).catch(() => {});
  }
}

function renderSettingsTab(content, user) {
  content.innerHTML = `
    <div class="settings-section">
      <div class="settings-card glass-card no-hover">
        <div class="settings-card-title">Профиль</div>
        <div class="settings-row">
          <span class="settings-row-label">Отображаемое имя</span>
          <div style="display:flex;gap:0.5rem;align-items:center;">
            <input class="input-field" id="newName" value="${user.displayName||''}" style="width:200px;padding:0.5rem 0.875rem;" />
            <button class="btn-primary btn-sm" onclick="window.__updateName()">Сохранить</button>
          </div>
        </div>
        <div class="settings-row">
          <span class="settings-row-label">Email</span>
          <span style="color:var(--text-muted);">${user.email}</span>
        </div>
      </div>
      <div class="settings-card glass-card no-hover">
        <div class="settings-card-title">Безопасность</div>
        <div class="settings-row" style="flex-direction:column;align-items:flex-start;gap:0.75rem;">
          <span class="settings-row-label">Смена пароля</span>
          <input class="input-field" id="currentPwd" type="password" placeholder="Текущий пароль" style="max-width:320px;" />
          <input class="input-field" id="newPwd"     type="password" placeholder="Новый пароль (мин. 6 символов)" style="max-width:320px;" />
          <button class="btn-primary btn-sm" onclick="window.__changePwd()">Изменить пароль</button>
        </div>
      </div>
      <div class="settings-card glass-card no-hover">
        <div class="settings-card-title">Данные</div>
        <div class="settings-row">
          <span class="settings-row-label">Экспорт всех результатов в JSON</span>
          <button class="btn-ghost btn-sm" onclick="window.__exportData()">📥 Скачать JSON</button>
        </div>
        <div class="settings-row">
          <span class="settings-row-label">Удалить все результаты тестов</span>
          <button class="btn-danger btn-sm" onclick="window.__deleteAll()">🗑 Удалить всё</button>
        </div>
      </div>
    </div>`;

  window.__updateName = async () => {
    const name = document.getElementById('newName')?.value?.trim();
    if (!name) { showToast('Введите имя', 'error'); return; }
    await updateDisplayName(name);
    const el = document.querySelector('.cabinet-user-name');
    const av = document.querySelector('.cabinet-avatar');
    if (el) el.textContent = name;
    if (av) av.textContent = name.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase();
  };

  window.__changePwd = async () => {
    const cur = document.getElementById('currentPwd')?.value;
    const nw  = document.getElementById('newPwd')?.value;
    if (!cur || !nw)   { showToast('Заполните оба поля', 'error'); return; }
    if (nw.length < 6) { showToast('Мин. 6 символов', 'error'); return; }
    await updateUserPassword(cur, nw);
    document.getElementById('currentPwd').value = '';
    document.getElementById('newPwd').value = '';
  };

  window.__exportData = async () => {
    try {
      const data = await exportUserData(user.uid);
      if (!data) throw new Error();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type:'application/json' });
      const url  = URL.createObjectURL(blob);
      const a    = Object.assign(document.createElement('a'), { href:url, download:`psychotest_${user.uid.slice(0,8)}.json` });
      a.click(); URL.revokeObjectURL(url);
      showToast('JSON скачан! 📥', 'success');
    } catch { showToast('Ошибка экспорта', 'error'); }
  };

  window.__deleteAll = () => {
    showConfirm('Вы уверены? Все результаты будут удалены без восстановления.', async () => {
      await deleteAllResults(user.uid);
      ALL_TESTS.forEach(t => localStorage.removeItem(`result_${t.id}`));
      showToast('Все результаты удалены', 'success');
      switchTab('tests');
    });
  };
}

async function loadStats(uid) {
  try {
    const results = await loadAllResults(uid);
    const count   = Object.keys(results).length;
    const dates   = Object.values(results).map(r => r.completedAt).filter(Boolean).sort();
    const last    = dates.length ? formatDateShort(dates[dates.length-1]) : null;
    const statsEl = document.querySelector('.cabinet-stats');
    if (statsEl) statsEl.innerHTML = `
      <span class="cabinet-stat"><span class="cabinet-stat-icon">📊</span> ${count} тестов</span>
      ${last ? `<span class="cabinet-stat"><span class="cabinet-stat-icon">🕐</span> Последний: ${last}</span>` : ''}`;
  } catch {}
}
