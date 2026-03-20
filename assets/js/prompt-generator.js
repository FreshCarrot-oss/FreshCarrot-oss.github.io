/* Файл: assets/js/prompt-generator.js */
/* Генерация промпта для AI-анализа результатов тестов.
   Никаких HTTP-запросов — только формирование текста для копирования. */

import { showToast }            from './ui.js';
import { saveGeneratedPrompt }  from './db.js';

// ── Названия тестов для вставки в промпт ──────────────────────
const TEST_NAMES = {
  pdo:      'ПДО Личко (акцентуации характера)',
  mbti:     'MBTI (тип личности)',
  bigfive:  'Большая пятёрка / OCEAN',
  eysenck:  'Тест Айзенка (темперамент)',
  leonhard: 'Тест Леонгарда (акцентуации)',
  cattell:  '16PF Кеттела (личностные факторы)',
  iq:       'Тест интеллекта (IQ)',
};

// ── Варианты фокуса анализа ───────────────────────────────────
export const FOCUS_OPTIONS = [
  'Общий психологический портрет',
  'Карьерные рекомендации',
  'Советы для отношений',
  'Личностный рост и саморазвитие',
];

// ── Форматирование результата каждого теста ───────────────────
export function formatResult(testId, result) {
  try {
    switch (testId) {
      case 'mbti':
        return `Тип: ${result.type} («${result.typeName || result.type}»)
Шкалы: И/Э ${result.percentages?.EI ?? '?'}% интроверсии · Н/С ${result.percentages?.SN ?? '?'}% интуиции · Л/Э ${result.percentages?.TF ?? '?'}% логики · Р/И ${result.percentages?.JP ?? '?'}% рациональности`;

      case 'bigfive':
        return `O (Открытость):          ${result.percentages?.O ?? '?'}%
C (Добросовестность):     ${result.percentages?.C ?? '?'}%
E (Экстраверсия):         ${result.percentages?.E ?? '?'}%
A (Доброжелательность):   ${result.percentages?.A ?? '?'}%
N (Нейротизм):            ${result.percentages?.N ?? '?'}%`;

      case 'eysenck':
        return `Тип темперамента: ${result.temperament}
Экстраверсия: ${result.E}/24 · Нейротизм: ${result.N}/24
Достоверность: ${result.valid ? 'высокая' : 'под вопросом (L > 4)'}`;

      case 'pdo':
        return `Ведущий тип: ${result.leading}
Второй тип:  ${result.secondary || '—'}
Фоновые черты: ${Array.isArray(result.background) ? result.background.join(', ') : result.background || '—'}
Профиль: ${result.profile || '—'}`;

      case 'leonhard': {
        const top = Object.entries(result.scores || {})
          .sort((a, b) => b[1] - a[1])
          .slice(0, 4)
          .map(([t, s]) => `${t}: ${s}/24`)
          .join(' · ');
        return `Ведущие акцентуации: ${top || '—'}`;
      }

      case 'cattell':
        return Object.entries(result.stens || {})
          .map(([f, v]) => `${f}=${v}`)
          .join(' · ');

      case 'iq':
        return `IQ: ${result.iq} — ${result.category}
Процентиль: выше, чем у ${result.percentile}% людей
Правильных ответов: ${result.correct}/40`;

      default:
        return JSON.stringify(result, null, 2).slice(0, 600);
    }
  } catch {
    return JSON.stringify(result, null, 2).slice(0, 300);
  }
}

// ── Основная функция генерации промпта ────────────────────────
export function generatePrompt(allResults, userContext = {}) {
  const {
    goal    = FOCUS_OPTIONS[0],
    context = '',
  } = userContext;

  const testCount  = Object.keys(allResults).length;
  const testsBlock = Object.entries(allResults)
    .map(([id, res]) => `### ${TEST_NAMES[id] || id}\n${formatResult(id, res)}`)
    .join('\n\n');

  const contextLine = context.trim()
    ? `\nДополнительный контекст: «${context.trim()}»\n`
    : '';

  const line = '═'.repeat(40);

  return `Ты — опытный психолог-консультант. Ниже приведены результаты ${testCount} научных психологических тестов одного человека. Проанализируй их и составь развёрнутый психологический портрет.

ФОКУС АНАЛИЗА: ${goal}${contextLine}

${line}
РЕЗУЛЬТАТЫ ТЕСТОВ
${line}

${testsBlock}

${line}
СТРУКТУРА ОТВЕТА
${line}

## 1. Психологический портрет
Целостное описание личности (3–4 абзаца). Найди общие черты и возможные противоречия между результатами разных тестов — объясни их.

## 2. Сильные стороны
7–10 конкретных сильных сторон. Указывай, из каких тестов это следует.

## 3. Зоны роста
5–7 зон для развития. Пиши конструктивно, без критики.

## 4. ${goal}
Конкретные рекомендации по выбранному фокусу.

## 5. Практические шаги
3–5 действий, которые можно начать прямо сейчас.

## 6. Книги и практики
2–3 книги и 1–2 практики, подходящие именно для этого типа личности.

---
Правила: отвечай на русском · будь дружелюбен · не ставь клинических диагнозов · опирайся на конкретные цифры из тестов.`.trim();
}

// ── Копирование в буфер обмена ────────────────────────────────
export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback для старых браузеров
    const el = Object.assign(document.createElement('textarea'), {
      value: text,
      style: 'position:fixed;top:-9999px;left:-9999px;opacity:0;pointer-events:none',
    });
    document.body.appendChild(el);
    el.select();
    const ok = document.execCommand('copy');
    el.remove();
    return ok;
  }
}

// ── Рендер блока промпта ─────────────────────────────────────
export function renderPromptBlock(allResults) {
  // Сохраняем для обработчиков
  window.__currentResults = allResults;

  const hasResults = Object.keys(allResults || {}).length > 0;

  return `
    <section class="glass-card prompt-section animate-on-scroll">
      <div class="prompt-header">
        <span class="prompt-icon"></span>
        <div>
          <h3>Промпт для AI-анализа</h3>
          <p class="text-secondary">
            Сгенерируйте промпт и вставьте его в ChatGPT, Claude
            или любой другой AI в вашем аккаунте
          </p>
        </div>
      </div>

      ${!hasResults ? `
        <div style="text-align:center;padding:2rem;color:var(--text-muted);">
          <p>Пройдите хотя бы один тест, чтобы сгенерировать промпт</p>
          <a href="#/tests" class="btn-primary" style="margin-top:1rem;display:inline-flex;">
            Перейти к тестам →
          </a>
        </div>
      ` : `
        <!-- ШАГ 1: Уточняющие вопросы -->
        <div id="promptStep1">
          <p class="text-secondary" style="margin-bottom:1rem;">Выберите фокус анализа:</p>
          <div class="radio-group">
            ${FOCUS_OPTIONS.map((opt, i) => `
              <label class="radio-option glass-card">
                <input type="radio" name="goal" value="${opt}" ${i === 0 ? 'checked' : ''}>
                <span>${opt}</span>
              </label>
            `).join('')}
          </div>
          <div class="form-group" style="margin-top:1rem;">
            <label class="form-label">Дополнительный контекст (необязательно)</label>
            <textarea
              id="userContext"
              class="input-field"
              placeholder="Например: «ищу новую работу в IT» или «хочу улучшить отношения с партнёром»"
              rows="2"
            ></textarea>
          </div>
          <button class="btn-primary" style="margin-top:1rem;" onclick="window.__handleGeneratePrompt()">
            ✨ Сгенерировать промпт
          </button>
        </div>

        <!-- ШАГ 2: Готовый промпт -->
        <div id="promptStep2" class="hidden">
          <pre class="prompt-text" id="promptText"></pre>
          <div class="prompt-actions">
            <button
              class="btn-primary btn-copy-prompt"
              id="copyPromptBtn"
              onclick="window.__handleCopyPrompt()"
            >
               Скопировать промпт
            </button>
            <button class="btn-ghost" onclick="window.__handleBackToStep1()">
              ↩ Изменить запрос
            </button>
          </div>
          <p class="prompt-hint">
             Вставьте этот промпт в ChatGPT, Claude или другой AI в вашем аккаунте
          </p>
        </div>
      `}
    </section>
  `;
}

// ── Обработчик: генерация промпта ────────────────────────────
export function handleGeneratePrompt() {
  const goal    = document.querySelector('input[name="goal"]:checked')?.value || FOCUS_OPTIONS[0];
  const context = document.getElementById('userContext')?.value || '';
  const prompt  = generatePrompt(window.__currentResults || {}, { goal, context });

  const promptText = document.getElementById('promptText');
  if (promptText) promptText.textContent = prompt;

  // Переход шаг 1 → шаг 2
  if (window.gsap) {
    gsap.to('#promptStep1', {
      opacity: 0, y: -10, duration: 0.25,
      onComplete: () => {
        document.getElementById('promptStep1')?.classList.add('hidden');
        const step2 = document.getElementById('promptStep2');
        if (step2) {
          step2.classList.remove('hidden');
          gsap.from(step2, { opacity: 0, y: 10, duration: 0.4, ease: 'power3.out' });
        }
      }
    });
  } else {
    document.getElementById('promptStep1')?.classList.add('hidden');
    document.getElementById('promptStep2')?.classList.remove('hidden');
  }

  // Сохранить промпт в Firestore (для залогиненных пользователей)
  if (window.__currentUser) {
    saveGeneratedPrompt(window.__currentUser.uid, {
      prompt,
      goal,
      context,
      testIds: Object.keys(window.__currentResults || {}),
    }).catch(() => {}); // молча игнорируем ошибку
  }
}

// ── Обработчик: копирование промпта ──────────────────────────
export async function handleCopyPrompt() {
  const text = document.getElementById('promptText')?.textContent;
  if (!text) return;

  const ok = await copyToClipboard(text);
  if (ok) {
    showToast('Промпт скопирован в буфер обмена! ', 'success');

    // Визуальная обратная связь кнопки
    const btn = document.getElementById('copyPromptBtn');
    if (btn) {
      const original = btn.innerHTML;
      btn.innerHTML = ' Скопировано!';
      btn.style.background = 'linear-gradient(135deg,#10b981,#059669)';
      setTimeout(() => {
        btn.innerHTML = original;
        btn.style.background = '';
      }, 2500);
    }
  } else {
    showToast('Не удалось скопировать. Попробуйте вручную.', 'error');
  }
}

// ── Обработчик: вернуться к шагу 1 ──────────────────────────
export function handleBackToStep1() {
  document.getElementById('promptStep2')?.classList.add('hidden');
  const step1 = document.getElementById('promptStep1');
  if (step1) {
    step1.classList.remove('hidden');
    if (window.gsap) {
      gsap.from(step1, { opacity: 0, y: 10, duration: 0.3, ease: 'power3.out' });
    }
  }
}

// ── Регистрируем глобальные обработчики ──────────────────────
window.__handleGeneratePrompt = handleGeneratePrompt;
window.__handleCopyPrompt     = handleCopyPrompt;
window.__handleBackToStep1    = handleBackToStep1;
