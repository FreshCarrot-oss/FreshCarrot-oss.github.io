/* Файл: assets/js/results/combined-profile.js */
/* Сводный психологический профиль на основе всех пройденных тестов */

import { createMetaRadarChart } from './charts.js';

// ── Нормализация результатов всех тестов к шкале 0–100 ───────
export function collectMetaScores(allResults) {
  const meta = {};

  // MBTI
  if (allResults.mbti) {
    const r = allResults.mbti;
    meta['Экстраверсия']   = 100 - (r.percentages?.EI || 50);
    meta['Интуиция']       = r.percentages?.SN || 50;
    meta['Логика']         = 100 - (r.percentages?.TF || 50);
    meta['Рациональность'] = 100 - (r.percentages?.JP || 50);
  }

  // Big Five
  if (allResults.bigfive) {
    const r = allResults.bigfive;
    meta['Открытость']        = r.percentages?.O || 0;
    meta['Добросовестность']  = r.percentages?.C || 0;
    if (!meta['Экстраверсия']) meta['Экстраверсия'] = r.percentages?.E || 0;
    meta['Доброжелательность']= r.percentages?.A || 0;
    meta['Нейротизм']         = r.percentages?.N || 0;
  }

  // Айзенк
  if (allResults.eysenck) {
    const r = allResults.eysenck;
    if (!meta['Экстраверсия']) meta['Экстраверсия'] = Math.round((r.E / 24) * 100);
    if (!meta['Нейротизм'])    meta['Нейротизм']    = Math.round((r.N / 24) * 100);
  }

  // ПДО Личко — нормализуем топ-3 акцентуации
  if (allResults.pdo && allResults.pdo.scores) {
    const sorted = Object.entries(allResults.pdo.scores).sort((a,b) => b[1]-a[1]);
    const NAME_MAP = {
      Г:'Гипертимность', Ш:'Шизоидность', Э:'Эпилептоидность',
      И:'Истероидность',  Н:'Неустойчивость', С:'Сенситивность',
    };
    sorted.slice(0, 3).forEach(([code, val]) => {
      const name = NAME_MAP[code];
      if (name) meta[name] = Math.min(100, Math.round((val / 20) * 100));
    });
  }

  // Леонгард — берём топ-3
  if (allResults.leonhard && allResults.leonhard.scores) {
    const sorted = Object.entries(allResults.leonhard.scores).sort((a,b) => b[1]-a[1]);
    const SHORT_NAMES = {
      Демонстративный:'Демонстративность', Застревающий:'Застревание',
      Педантичный:'Педантизм', Возбудимый:'Возбудимость',
      Гипертимный:'Гипертимность', Дистимный:'Дистимность',
    };
    sorted.slice(0, 3).forEach(([name, val]) => {
      const short = SHORT_NAMES[name] || name;
      if (!meta[short]) meta[short] = Math.min(100, Math.round((val / 24) * 100));
    });
  }

  // IQ
  if (allResults.iq) {
    meta['Интеллект'] = Math.min(100, Math.round(((allResults.iq.iq - 70) / 75) * 100));
  }

  return meta;
}

// ── Найти корреляции между тестами ───────────────────────────
export function findCorrelations(allResults) {
  const corr = [];

  // MBTI Интроверт + Айзенк низкая Э
  if (allResults.mbti && allResults.eysenck) {
    const mbtiI = allResults.mbti.percentages?.EI > 50;
    const eyI   = allResults.eysenck.E < 12;
    if (mbtiI && eyI) corr.push({ text:' Интроверт — подтверждено MBTI и Айзенком', strength:'strong' });
  }

  // Big Five высокий N + Айзенк высокий N
  if (allResults.bigfive && allResults.eysenck) {
    const bfN  = (allResults.bigfive.percentages?.N || 0) > 60;
    const eyN  = allResults.eysenck.N > 14;
    if (bfN && eyN) corr.push({ text:'⚡ Высокий нейротизм — подтверждён Big Five и Айзенком', strength:'strong' });
  }

  // MBTI высокая O + Big Five высокая O
  if (allResults.mbti && allResults.bigfive) {
    const mbtiN = allResults.mbti.percentages?.SN > 55;
    const bfO   = (allResults.bigfive.percentages?.O || 0) > 60;
    if (mbtiN && bfO) corr.push({ text:'🔭 Высокая открытость — подтверждена MBTI (N) и Big Five (O)', strength:'moderate' });
  }

  return corr;
}

// ── Построить данные для мета-радара ─────────────────────────
export function buildMetaRadarData(allResults) {
  const meta = collectMetaScores(allResults);
  const labels = Object.keys(meta);
  const values = Object.values(meta);

  return { labels, values };
}

// ── Генерировать текст сводного профиля ──────────────────────
export function generateSummaryText(allResults) {
  const meta   = collectMetaScores(allResults);
  const count  = Object.keys(allResults).length;
  const corr   = findCorrelations(allResults);
  const lines  = [];

  lines.push(`На основе ${count} пройденных тестов составлен ваш психологический портрет.`);
  lines.push('');

  // Экстраверсия / Интроверсия
  const extroversion = meta['Экстраверсия'];
  if (extroversion !== undefined) {
    if (extroversion < 40) {
      lines.push(' Вы выраженный интроверт — восстанавливаетесь в одиночестве, предпочитаете глубокие связи широкому кругу общения.');
    } else if (extroversion > 65) {
      lines.push('☀️ Вы выраженный экстраверт — черпаете энергию из общения, легко заводите новые знакомства.');
    } else {
      lines.push('⚖️ По шкале экстраверсии вы ближе к амбиверту — комфортно чувствуете себя как в компании, так и в одиночестве.');
    }
  }

  // Открытость
  const openness = meta['Открытость'];
  if (openness !== undefined) {
    if (openness > 70) lines.push('🔭 Высокая открытость опыту: вы любознательны, творчески мыслите, цените новые идеи.');
    else if (openness < 35) lines.push('🏠 Практичность и традиционность: вы надёжны и последовательны, ценящий стабильность.');
  }

  // Нейротизм
  const neuroticism = meta['Нейротизм'];
  if (neuroticism !== undefined) {
    if (neuroticism > 65) lines.push('💧 Высокая эмоциональная чувствительность: вы глубоко переживаете события, что может быть и ресурсом, и нагрузкой.');
    else if (neuroticism < 35) lines.push('🪨 Эмоциональная устойчивость: вы хорошо справляетесь со стрессом и сохраняете спокойствие в трудных ситуациях.');
  }

  // Корреляции
  if (corr.length > 0) {
    lines.push('');
    lines.push('Совпадения нескольких тестов:');
    corr.forEach(c => lines.push(c.text));
  }

  return lines.join('\n');
}

// ── Рендер вкладки "Сводный профиль" ─────────────────────────
export async function renderCombinedProfile(uid) {
  const container = document.getElementById('combinedProfileTab');
  if (!container) return;

  // Загружаем результаты из Firestore или localStorage
  let allResults = {};

  if (uid) {
    try {
      const { loadAllResults } = await import('../db.js');
      const dbResults = await loadAllResults(uid);
      Object.entries(dbResults).forEach(([testId, data]) => {
        if (data.result) allResults[testId] = data.result;
      });
    } catch {}
  }

  // Дополняем из localStorage (для незалогиненных)
  ['mbti','bigfive','eysenck','pdo','leonhard','cattell','iq'].forEach(id => {
    if (!allResults[id]) {
      const raw = localStorage.getItem(`result_${id}`);
      if (raw) { try { allResults[id] = JSON.parse(raw); } catch {} }
    }
  });

  const count = Object.keys(allResults).length;

  if (count === 0) {
    container.innerHTML = `
      <div class="glass-card no-hover" style="padding:3rem;text-align:center;">
        <div style="font-size:3rem;margin-bottom:1rem;"></div>
        <h3 class="h4" style="margin-bottom:0.75rem;">Профиль не построен</h3>
        <p class="text-secondary" style="margin-bottom:1.5rem;">Пройдите хотя бы один тест, чтобы увидеть сводный профиль</p>
        <a href="#/tests" class="btn-primary">Перейти к тестам →</a>
      </div>
    `;
    return;
  }

  const metaData   = buildMetaRadarData(allResults);
  const summary    = generateSummaryText(allResults);
  const traits     = findCorrelations(allResults);

  container.innerHTML = `
    <div class="combined-profile-section">
      <div class="glass-card no-hover" style="padding:1.5rem 2rem;margin-bottom:1.5rem;">
        <h3 class="h4" style="margin-bottom:0.25rem;">Ваш психологический портрет</h3>
        <p class="text-secondary" style="font:400 0.9rem var(--font-body);">На основе ${count} пройденных тестов</p>
      </div>

      <!-- Мета-радар -->
      <div class="meta-radar-card glass-card no-hover">
        <h3 class="h5" style="margin-bottom:1rem;">Мета-радар личности</h3>
        <div style="max-height:400px;position:relative;">
          <canvas id="metaRadar" class="meta-radar-canvas"></canvas>
        </div>
      </div>

      <!-- Ключевые черты -->
      ${traits.length ? `
        <div class="profile-traits glass-card no-hover">
          <h3 class="h5" style="margin-bottom:1rem;">Ключевые черты</h3>
          ${traits.map(t => `
            <div class="trait-item">
              <span class="trait-text">${t.text}</span>
            </div>
          `).join('')}
        </div>
      ` : ''}

      <!-- Текстовый анализ -->
      <div class="glass-card no-hover" style="padding:1.5rem;">
        <h3 class="h5" style="margin-bottom:1rem;">Текстовое описание</h3>
        ${summary.split('\n').map(line =>
          line ? `<p style="color:var(--text-secondary);margin-bottom:0.5rem;font:400 0.95rem var(--font-body);">${line}</p>` : '<br>'
        ).join('')}
      </div>
    </div>
  `;

  // Рендерим мета-радар
  requestAnimationFrame(() => {
    createMetaRadarChart(metaData, 'metaRadar');
  });
}
