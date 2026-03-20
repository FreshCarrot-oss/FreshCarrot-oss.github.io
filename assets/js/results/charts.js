/* Файл: assets/js/results/charts.js */
/* Chart.js конфиги для всех тестов: радар, scatter, bar, gauge, bell-curve */

// ── Общие настройки Chart.js ──────────────────────────────────
const CHART_DEFAULTS = {
  animation: { duration: 1500, easing: 'easeInOutQuart' },
  plugins: { legend: { display: false } },
  responsive: true,
  maintainAspectRatio: false,
};

const COLORS = {
  violet:  'rgba(139,92,246,',
  indigo:  'rgba(99,102,241,',
  blue:    'rgba(59,130,246,',
  cyan:    'rgba(6,182,212,',
  pink:    'rgba(236,72,153,',
  emerald: 'rgba(16,185,129,',
  amber:   'rgba(245,158,11,',
};

// ── Хранилище активных чартов ─────────────────────────────────
const activeCharts = {};

// ── Уничтожить чарт перед перерисовкой ───────────────────────
function destroyChart(canvasId) {
  if (activeCharts[canvasId]) {
    activeCharts[canvasId].destroy();
    delete activeCharts[canvasId];
  }
}

// ── Создать и зарегистрировать чарт ──────────────────────────
function registerChart(canvasId, config) {
  destroyChart(canvasId);
  const canvas = document.getElementById(canvasId);
  if (!canvas) return null;
  const ctx = canvas.getContext('2d');
  const chart = new Chart(ctx, config);
  activeCharts[canvasId] = chart;
  return chart;
}

// ── ПДО Личко — Radar Chart ──────────────────────────────────
function createPDOChart(result, canvasId = 'pdoChart') {
  const labels = ['Гипертим.','Циклоид.','Лабильный','Астено-невр.',
                  'Сенситив.','Психастен.','Шизоидный','Эпилептоид.',
                  'Истероид.','Неустойч.','Конформный'];
  const codes  = ['Г','Ц','Л','А','С','П','Ш','Э','И','Н','К'];
  const data   = codes.map(c => result.scores?.[c] || 0);

  return registerChart(canvasId, {
    type: 'radar',
    data: {
      labels,
      datasets: [{
        data,
        fill: true,
        backgroundColor: 'rgba(139,92,246,0.15)',
        borderColor: '#8b5cf6',
        borderWidth: 2,
        pointBackgroundColor: '#8b5cf6',
        pointBorderColor: '#fff',
        pointRadius: 5,
        pointHoverRadius: 7,
      }]
    },
    options: {
      ...CHART_DEFAULTS,
      scales: {
        r: {
          min: 0, max: 20,
          ticks: { stepSize: 5, color: 'rgba(255,255,255,0.4)', backdropColor: 'transparent' },
          grid:  { color: 'rgba(255,255,255,0.08)' },
          pointLabels: { color: 'rgba(255,255,255,0.7)', font: { size: 11 } },
        }
      }
    }
  });
}

// ── MBTI — горизонтальные шкалы (HTML, не Chart.js) ──────────
export function renderMBTIScales(result, containerId = 'mbtiScales') {
  const container = document.getElementById(containerId);
  if (!container || !result.percentages) return;

  const scales = [
    { leftLabel:'Интроверсия (I)', rightLabel:'Экстраверсия (E)', value: result.percentages.EI, color:'#8b5cf6', leftLetter:'I', rightLetter:'E' },
    { leftLabel:'Интуиция (N)',    rightLabel:'Сенсорика (S)',    value: result.percentages.SN, color:'#6366f1', leftLetter:'N', rightLetter:'S' },
    { leftLabel:'Этика (F)',       rightLabel:'Логика (T)',       value: result.percentages.TF, color:'#3b82f6', leftLetter:'F', rightLetter:'T' },
    { leftLabel:'Иррац-ть (P)',    rightLabel:'Рац-ть (J)',      value: result.percentages.JP, color:'#06b6d4', leftLetter:'P', rightLetter:'J' },
  ];

  container.innerHTML = scales.map(s => {
    const leftPct  = s.value;
    const rightPct = 100 - s.value;
    const dominant = s.value >= 50 ? 'left' : 'right';
    return `
      <div class="mbti-scale">
        <div class="mbti-scale-header">
          <span class="mbti-scale-label" style="color:${dominant==='left'?'var(--text-accent)':'var(--text-muted)'}">
            ${s.leftLetter} — ${s.leftLabel} (${leftPct}%)
          </span>
          <span class="mbti-scale-label" style="color:${dominant==='right'?'var(--text-accent)':'var(--text-muted)'}">
            ${s.rightLabel} — ${s.rightLetter} (${rightPct}%)
          </span>
        </div>
        <div class="mbti-scale-bar">
          <div class="mbti-scale-fill" style="width:${leftPct}%;background:${s.color};transition:width 1.2s ease 0.3s;"></div>
        </div>
      </div>
    `;
  }).join('');
}

// ── Big Five — Radar Chart ────────────────────────────────────
function createBigFiveChart(result, canvasId = 'bigfiveChart') {
  const labels = ['Открытость (O)','Добросовест. (C)','Экстраверсия (E)','Доброжел. (A)','Нейротизм (N)'];
  const data   = ['O','C','E','A','N'].map(f => result.percentages?.[f] || 0);

  return registerChart(canvasId, {
    type: 'radar',
    data: {
      labels,
      datasets: [{
        data,
        fill: true,
        backgroundColor: 'rgba(59,130,246,0.15)',
        borderColor: '#3b82f6',
        borderWidth: 2,
        pointBackgroundColor: ['#8b5cf6','#10b981','#06b6d4','#ec4899','#f59e0b'],
        pointBorderColor: '#fff',
        pointRadius: 6,
        pointHoverRadius: 8,
      }]
    },
    options: {
      ...CHART_DEFAULTS,
      scales: {
        r: {
          min: 0, max: 100,
          ticks: { stepSize: 25, color: 'rgba(255,255,255,0.4)', backdropColor: 'transparent' },
          grid:  { color: 'rgba(255,255,255,0.08)' },
          pointLabels: { color: 'rgba(255,255,255,0.7)', font: { size: 11 } },
        }
      }
    }
  });
}

// ── Айзенк — 2D scatter + квадранты ──────────────────────────
function createEysenckChart(result, canvasId = 'eysenckChart') {
  const quadrantLabels = [
    { x:6,  y:18, label:'Меланхолик' },
    { x:18, y:18, label:'Холерик'    },
    { x:6,  y:6,  label:'Флегматик'  },
    { x:18, y:6,  label:'Сангвиник'  },
  ];

  return registerChart(canvasId, {
    type: 'scatter',
    data: {
      datasets: [
        // Метки квадрантов
        {
          label: 'Типы', type: 'scatter',
          data: quadrantLabels,
          pointBackgroundColor: 'rgba(255,255,255,0.15)',
          pointBorderColor: 'rgba(255,255,255,0.3)',
          pointRadius: 30,
          pointHoverRadius: 30,
        },
        // Точка пользователя
        {
          label: 'Вы', type: 'scatter',
          data: [{ x: result.E || 12, y: result.N || 12 }],
          pointBackgroundColor: '#8b5cf6',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 12,
          pointHoverRadius: 14,
        }
      ]
    },
    options: {
      ...CHART_DEFAULTS,
      plugins: {
        legend: { display: true, labels: { color: 'rgba(255,255,255,0.7)' } },
        tooltip: {
          callbacks: {
            label: ctx => ctx.datasetIndex === 1
              ? `E=${result.E}, N=${result.N} — ${result.temperament}`
              : quadrantLabels[ctx.dataIndex]?.label || ''
          }
        }
      },
      scales: {
        x: {
          min: 0, max: 24,
          title: { display: true, text: 'Экстраверсия →', color: 'rgba(255,255,255,0.5)' },
          grid: { color: 'rgba(255,255,255,0.06)' },
          ticks: { color: 'rgba(255,255,255,0.4)' },
        },
        y: {
          min: 0, max: 24,
          title: { display: true, text: 'Нейротизм →', color: 'rgba(255,255,255,0.5)' },
          grid: { color: 'rgba(255,255,255,0.06)' },
          ticks: { color: 'rgba(255,255,255,0.4)' },
        }
      }
    }
  });
}

// ── Леонгард — Bar Chart ──────────────────────────────────────
function createLeonhardChart(result, canvasId = 'leonhardChart') {
  const scaleNames = {
    Демонстративный:'Демонстр.', Застревающий:'Застрев.', Педантичный:'Педант.',
    Возбудимый:'Возбуд.', Гипертимный:'Гипертим.', Дистимный:'Дистим.',
    ТревожноБоязливый:'Тревожн.', Циклотимный:'Циклот.',
    Аффективно_Экзальтированный:'Экзальт.', Эмотивный:'Эмотивн.',
  };

  const scores = result.scores || {};
  const labels = Object.keys(scores).map(k => scaleNames[k] || k);
  const data   = Object.values(scores);
  const bgs    = data.map(v => v >= 19 ? 'rgba(239,68,68,0.7)' : v >= 13 ? 'rgba(245,158,11,0.7)' : 'rgba(139,92,246,0.5)');
  const borders= data.map(v => v >= 19 ? '#ef4444' : v >= 13 ? '#f59e0b' : '#8b5cf6');

  return registerChart(canvasId, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        data,
        backgroundColor: bgs,
        borderColor: borders,
        borderWidth: 1.5,
        borderRadius: 6,
      }]
    },
    options: {
      ...CHART_DEFAULTS,
      plugins: {
        legend: { display: false },
        annotation: {
          annotations: {
            normLine:   { type:'line', yMin:12, yMax:12, borderColor:'rgba(16,185,129,0.5)', borderWidth:1.5, borderDash:[4,4] },
            accentLine: { type:'line', yMin:18, yMax:18, borderColor:'rgba(239,68,68,0.5)',  borderWidth:1.5, borderDash:[4,4] },
          }
        }
      },
      scales: {
        y: {
          min:0, max:24,
          grid: { color:'rgba(255,255,255,0.06)' },
          ticks: { color:'rgba(255,255,255,0.5)' },
        },
        x: {
          grid: { display:false },
          ticks: { color:'rgba(255,255,255,0.5)', font:{size:10} },
        }
      }
    }
  });
}

// ── Кеттел — Line Profile Chart ───────────────────────────────
function createCattellChart(result, canvasId = 'cattellChart') {
  const factors = ['A','B','C','E','F','G','H','I','L','M','N','O','Q1','Q2','Q3','Q4'];
  const stens   = result.stens || {};
  const data    = factors.map(f => stens[f] || 5);

  return registerChart(canvasId, {
    type: 'line',
    data: {
      labels: factors,
      datasets: [{
        data,
        borderColor: '#8b5cf6',
        backgroundColor: 'rgba(139,92,246,0.1)',
        borderWidth: 2.5,
        pointBackgroundColor: data.map(v => v <= 3 ? '#3b82f6' : v >= 8 ? '#8b5cf6' : '#6366f1'),
        pointBorderColor: '#fff',
        pointRadius: 6,
        pointHoverRadius: 8,
        fill: true,
        tension: 0.35,
      }]
    },
    options: {
      ...CHART_DEFAULTS,
      scales: {
        y: {
          min: 1, max: 10,
          ticks: { stepSize:1, color:'rgba(255,255,255,0.4)' },
          grid:  { color:'rgba(255,255,255,0.06)' },
          title: { display:true, text:'Стены (1–10)', color:'rgba(255,255,255,0.4)' },
        },
        x: {
          grid:  { color:'rgba(255,255,255,0.04)' },
          ticks: { color:'rgba(255,255,255,0.6)', font:{size:11} },
        }
      }
    }
  });
}

// ── IQ — Gauge (doughnut) + Bell curve (line) ─────────────────
function createIQGauge(result, canvasId = 'iqGauge') {
  const iq    = result.iq || 100;
  const pct   = Math.min(100, Math.max(0, ((iq - 55) / 90) * 100));
  const color = iq >= 120 ? '#8b5cf6' : iq >= 100 ? '#3b82f6' : iq >= 90 ? '#06b6d4' : '#f59e0b';

  return registerChart(canvasId, {
    type: 'doughnut',
    data: {
      datasets: [{
        data: [pct, 100 - pct],
        backgroundColor: [color, 'rgba(255,255,255,0.05)'],
        borderColor: ['transparent','transparent'],
        borderWidth: 0,
        circumference: 270,
        rotation: -135,
      }]
    },
    options: {
      ...CHART_DEFAULTS,
      cutout: '72%',
      plugins: {
        legend: { display: false },
        tooltip: { enabled: false },
      }
    }
  });
}

// ── IQ — Нормальное распределение (bell curve) ───────────────
function createIQBellCurve(result, canvasId = 'iqBell') {
  const iq = result.iq || 100;
  const pts = [];
  const userPts = [];

  // Генерируем точки нормального распределения
  for (let x = 55; x <= 145; x += 2) {
    const y = Math.exp(-0.5 * Math.pow((x - 100) / 15, 2)) / (15 * Math.sqrt(2 * Math.PI));
    pts.push({ x, y });
    if (x <= iq) userPts.push({ x, y });
    else          userPts.push({ x, y: null });
  }

  return registerChart(canvasId, {
    type: 'line',
    data: {
      datasets: [
        {
          label: 'Распределение IQ',
          data: pts,
          borderColor: 'rgba(139,92,246,0.5)',
          backgroundColor: 'rgba(139,92,246,0.05)',
          borderWidth: 2,
          fill: true,
          tension: 0.4,
          pointRadius: 0,
        },
        {
          label: 'Ваш результат',
          data: userPts,
          borderColor: '#8b5cf6',
          backgroundColor: 'rgba(139,92,246,0.2)',
          borderWidth: 0,
          fill: true,
          tension: 0.4,
          pointRadius: 0,
        }
      ]
    },
    options: {
      ...CHART_DEFAULTS,
      plugins: {
        legend: { display: true, labels: { color: 'rgba(255,255,255,0.6)', font:{size:11} } },
        tooltip: { callbacks: { label: () => `IQ = ${iq}` } }
      },
      scales: {
        x: {
          type: 'linear',
          min: 55, max: 145,
          title: { display:true, text:'IQ', color:'rgba(255,255,255,0.4)' },
          grid:  { color:'rgba(255,255,255,0.06)' },
          ticks: { color:'rgba(255,255,255,0.4)', stepSize:15 },
        },
        y: {
          display: false,
          grid: { display: false },
        }
      }
    }
  });
}

// ── Мета-радар (сводный профиль) ─────────────────────────────
export function createMetaRadarChart(metaData, canvasId = 'metaRadar') {
  if (!metaData?.labels?.length) return null;

  return registerChart(canvasId, {
    type: 'radar',
    data: {
      labels: metaData.labels,
      datasets: [{
        data: metaData.values,
        fill: true,
        backgroundColor: 'rgba(139,92,246,0.12)',
        borderColor: '#8b5cf6',
        borderWidth: 2,
        pointBackgroundColor: '#a78bfa',
        pointRadius: 5,
        pointHoverRadius: 7,
      }]
    },
    options: {
      ...CHART_DEFAULTS,
      scales: {
        r: {
          min: 0, max: 100,
          ticks: { stepSize:25, color:'rgba(255,255,255,0.3)', backdropColor:'transparent' },
          grid:  { color:'rgba(255,255,255,0.06)' },
          pointLabels: { color:'rgba(255,255,255,0.65)', font:{size:11} },
        }
      }
    }
  });
}

// ── Публичная функция-роутер ───────────────────────────────────
export function createChart(testId, result, canvasId) {
  if (typeof Chart === 'undefined') {
    console.warn('Chart.js не загружен');
    return null;
  }

  switch (testId) {
    case 'pdo':      return createPDOChart(result, canvasId);
    case 'bigfive':  return createBigFiveChart(result, canvasId);
    case 'eysenck':  return createEysenckChart(result, canvasId);
    case 'leonhard': return createLeonhardChart(result, canvasId);
    case 'cattell':  return createCattellChart(result, canvasId);
    case 'iq':       return createIQGauge(result, canvasId);
    default:         return null;
  }
}

// ── Уничтожить все чарты (при уходе со страницы) ─────────────
export function destroyAllCharts() {
  Object.keys(activeCharts).forEach(id => {
    try { activeCharts[id].destroy(); } catch {}
    delete activeCharts[id];
  });
}

export { createIQBellCurve };
