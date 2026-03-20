/* Файл: assets/js/tests/test-engine.js */
/* Движок тестов: рендер вопросов, прогресс, таймер, сохранение */

import { animateQuestionTransition } from '../animations.js';
import { showToast }                 from '../ui.js';
import { saveTestResult }            from '../db.js';
import { router }                    from '../router.js';

// ── Класс TestEngine ──────────────────────────────────────────
export class TestEngine {
  constructor(testConfig) {
    this.config     = testConfig;
    this.answers    = {};
    this.currentIdx = 0;
    this.startTime  = Date.now();
    this.timer      = null;
    this.container  = null;
  }

  // ── Инициализация движка ─────────────────────────────────────
  init(container) {
    this.container = container;

    // Пробуем восстановить прогресс
    const restored = this.loadProgress();
    if (restored) {
      showToast('Прогресс восстановлен с места остановки', 'info');
    }

    this.renderQuestion(this.currentIdx);
    this.updateProgress();
  }

  // ── Рендер текущего вопроса ──────────────────────────────────
  renderQuestion(index) {
    if (!this.container) return;

    const q = this.config.questions[index];
    if (!q) return;

    const html = this.buildQuestionHTML(q, index);
    this.container.innerHTML = html;

    // Восстановить выбранный ответ (если есть)
    this.restoreAnswerUI(q);

    // Привязать обработчики
    this.bindAnswerHandlers(q);

    // Прокрутить к блоку вопроса
    this.container.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // ── Построение HTML вопроса ───────────────────────────────────
  buildQuestionHTML(q, index) {
    const total = this.config.questions.length;

    if (q.type === 'likert') {
      return this.buildLikertHTML(q, index, total);
    }
    if (q.type === 'pdo') {
      return this.buildPDOHTML(q, index, total);
    }
    // Стандартный выбор (choice / yesno / binary)
    return this.buildChoiceHTML(q, index, total);
  }

  // ── Стандартный вопрос с вариантами ─────────────────────────
  buildChoiceHTML(q, index, total) {
    const letters = ['А', 'Б', 'В', 'Г', 'Д', 'Е', 'Ж'];
    return `
      <div class="question-card glass-card animate-on-scroll">
        <div class="question-number">Вопрос ${index + 1} из ${total}</div>
        <p class="question-text">${q.text}</p>
        <div class="answers-list" id="answersList">
          ${q.answers.map((a, i) => `
            <button
              class="answer-option"
              data-question-id="${q.id}"
              data-value="${i}"
              type="button"
            >
              <span class="answer-letter">${letters[i] || String(i + 1)}</span>
              <span class="answer-text">${a.text}</span>
            </button>
          `).join('')}
        </div>
      </div>
      ${this.buildNavButtonsHTML(index, total)}
    `;
  }

  // ── Вопрос по шкале Ликерта (Big Five) ──────────────────────
  buildLikertHTML(q, index, total) {
    const labels = [
      'Совершенно не согласен',
      'Не согласен',
      'Нейтрально',
      'Согласен',
      'Полностью согласен'
    ];
    return `
      <div class="question-card glass-card animate-on-scroll">
        <div class="question-number">Вопрос ${index + 1} из ${total}</div>
        <p class="question-text">${q.text}</p>
        <div style="margin-top:1rem;">
          <div class="likert-labels">
            <span class="likert-label">${labels[0]}</span>
            <span class="likert-label">${labels[4]}</span>
          </div>
          <div class="likert-scale" id="likertScale">
            ${[1,2,3,4,5].map(v => `
              <button
                class="likert-btn"
                data-question-id="${q.id}"
                data-value="${v}"
                type="button"
                title="${labels[v-1]}"
              >${v}</button>
            `).join('')}
          </div>
        </div>
      </div>
      ${this.buildNavButtonsHTML(index, total)}
    `;
  }

  // ── Вопрос ПДО (больше всего / меньше всего) ─────────────────
  buildPDOHTML(q, index, total) {
    return `
      <div class="question-card glass-card animate-on-scroll">
        <div class="question-number">Набор ${index + 1} из ${total}</div>
        <p class="question-text">${q.text}</p>
        <div class="pdo-instructions">
          <span class="pdo-instruction">
            <span class="pdo-dot-plus"></span>
            Нажмите <strong>+</strong> у наиболее подходящего
          </span>
          <span class="pdo-instruction">
            <span class="pdo-dot-minus"></span>
            Нажмите <strong>−</strong> у наименее подходящего
          </span>
        </div>
        <div class="pdo-question" id="pdoList">
          ${q.answers.map((a, i) => `
            <div class="pdo-option" id="pdoOpt_${q.id}_${i}">
              <span class="answer-text">${a.text}</span>
              <div class="pdo-toggle">
                <button class="pdo-toggle-btn" data-pdo-id="${q.id}" data-idx="${i}" data-action="plus" type="button" title="Больше всего подходит">+</button>
                <button class="pdo-toggle-btn" data-pdo-id="${q.id}" data-idx="${i}" data-action="minus" type="button" title="Меньше всего подходит">−</button>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
      ${this.buildNavButtonsHTML(index, total)}
    `;
  }

  // ── Кнопки навигации теста ───────────────────────────────────
  buildNavButtonsHTML(index, total) {
    const isLast = index === total - 1;
    const timeInfo = this.config.id === 'iq'
      ? `<div class="iq-timer" id="iqTimer">⏱ 30:00</div>`
      : '';

    return `
      <div class="test-nav">
        <div class="test-nav-left">
          ${index > 0
            ? `<button class="btn-ghost" id="prevBtn" type="button">← Назад</button>`
            : '<span></span>'
          }
        </div>
        ${timeInfo}
        <div class="test-nav-right">
          ${isLast
            ? `<button class="btn-primary glow" id="finishBtn" type="button">Завершить тест ✓</button>`
            : `<button class="btn-primary" id="nextBtn" type="button">Далее →</button>`
          }
        </div>
      </div>
    `;
  }

  // ── Привязка обработчиков ответов ───────────────────────────
  bindAnswerHandlers(q) {
    // Стандартные варианты
    this.container.querySelectorAll('.answer-option').forEach(btn => {
      btn.addEventListener('click', () => {
        this.selectAnswer(q.id, parseInt(btn.dataset.value));
        this.container.querySelectorAll('.answer-option').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
      });
    });

    // Ликерта
    this.container.querySelectorAll('.likert-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.selectAnswer(q.id, parseInt(btn.dataset.value));
        this.container.querySelectorAll('.likert-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
      });
    });

    // ПДО
    this.container.querySelectorAll('.pdo-toggle-btn').forEach(btn => {
      btn.addEventListener('click', () => this.handlePDOToggle(btn, q));
    });

    // Кнопки навигации
    const prevBtn   = this.container.querySelector('#prevBtn');
    const nextBtn   = this.container.querySelector('#nextBtn');
    const finishBtn = this.container.querySelector('#finishBtn');

    if (prevBtn)   prevBtn.addEventListener('click', () => this.prev());
    if (nextBtn)   nextBtn.addEventListener('click', () => this.next());
    if (finishBtn) finishBtn.addEventListener('click', () => this.attemptFinish());

    // Свайпы на мобильных
    this.initSwipeHandlers();
  }

  // ── Обработка ПДО-кнопок ─────────────────────────────────────
  handlePDOToggle(btn, q) {
    const action = btn.dataset.action;
    const idx    = parseInt(btn.dataset.idx);
    const qId    = btn.dataset.pdoId;

    const current = this.answers[qId] || { plus: null, minus: null };

    if (action === 'plus') {
      if (current.plus === idx) {
        current.plus = null;
      } else {
        current.plus = idx;
        if (current.minus === idx) current.minus = null;
      }
    } else {
      if (current.minus === idx) {
        current.minus = null;
      } else {
        current.minus = idx;
        if (current.plus === idx) current.plus = null;
      }
    }

    this.answers[qId] = current;
    this.saveProgress();
    this.updatePDOUI(q, current);
  }

  // ── Обновление UI ПДО после выбора ──────────────────────────
  updatePDOUI(q, current) {
    q.answers.forEach((_, i) => {
      const opt = this.container.querySelector(`#pdoOpt_${q.id}_${i}`);
      if (!opt) return;
      opt.classList.remove('plus', 'minus');
      if (current.plus  === i) opt.classList.add('plus');
      if (current.minus === i) opt.classList.add('minus');

      const plusBtn  = opt.querySelector('[data-action="plus"]');
      const minusBtn = opt.querySelector('[data-action="minus"]');
      if (plusBtn)  plusBtn.classList.toggle('active-plus',  current.plus  === i);
      if (minusBtn) minusBtn.classList.toggle('active-minus', current.minus === i);
    });
  }

  // ── Восстановление UI ответа ─────────────────────────────────
  restoreAnswerUI(q) {
    const saved = this.answers[q.id];
    if (saved === undefined || saved === null) return;

    if (q.type === 'pdo' && saved) {
      this.updatePDOUI(q, saved);
      return;
    }

    // Выбор / Ликерта
    const selector = q.type === 'likert' ? '.likert-btn' : '.answer-option';
    this.container.querySelectorAll(selector).forEach(btn => {
      if (parseInt(btn.dataset.value) === saved) {
        btn.classList.add('selected');
      }
    });
  }

  // ── Сохранить ответ ──────────────────────────────────────────
  selectAnswer(questionId, value) {
    this.answers[questionId] = value;
    this.saveProgress();
  }

  // ── Переход к следующему вопросу ─────────────────────────────
  next() {
    if (this.currentIdx >= this.config.questions.length - 1) return;

    animateQuestionTransition('next', () => {
      this.currentIdx++;
      this.renderQuestion(this.currentIdx);
      this.updateProgress();
    });
  }

  // ── Переход к предыдущему вопросу ────────────────────────────
  prev() {
    if (this.currentIdx <= 0) return;

    animateQuestionTransition('prev', () => {
      this.currentIdx--;
      this.renderQuestion(this.currentIdx);
      this.updateProgress();
    });
  }

  // ── Попытка завершить (с проверкой пропущенных) ───────────────
  attemptFinish() {
    const unanswered = this.getUnansweredCount();
    if (unanswered > 0) {
      showToast(`Остались без ответа: ${unanswered} вопросов`, 'warn');
    }
    this.finish();
  }

  // ── Количество пропущенных вопросов ─────────────────────────
  getUnansweredCount() {
    return this.config.questions.filter(q => {
      const a = this.answers[q.id];
      if (q.type === 'pdo') return !a || (a.plus === null && a.minus === null);
      return a === undefined || a === null;
    }).length;
  }

  // ── Завершение теста ─────────────────────────────────────────
  async finish() {
    this.stopTimer();

    const duration = Math.round((Date.now() - this.startTime) / 1000);

    // Вычислить результат
    let result;
    try {
      result = this.config.calculate(this.answers, duration);
    } catch (err) {
      showToast('Ошибка подсчёта результата', 'error');
      console.error('Ошибка calculate():', err);
      return;
    }

    // Сохранить в localStorage
    localStorage.setItem(`result_${this.config.id}`, JSON.stringify({
      ...result,
      testId:      this.config.id,
      duration,
      completedAt: new Date().toISOString()
    }));

    // Сохранить в Firestore (для залогиненных)
    if (window.__currentUser) {
      await saveTestResult(window.__currentUser.uid, {
        testId:      this.config.id,
        result,
        duration,
        completedAt: new Date().toISOString()
      }).catch(() => {});
    }

    // Очистить прогресс из localStorage
    localStorage.removeItem(`progress_${this.config.id}`);

    // Перейти на страницу результатов
    router.navigate(`/result/${this.config.id}`);
  }

  // ── Обновление прогресс-бара ─────────────────────────────────
  updateProgress() {
    const total    = this.config.questions.length;
    const current  = this.currentIdx + 1;
    const percent  = Math.round((this.currentIdx / total) * 100);

    const fill  = document.querySelector('.progress-fill');
    const label = document.querySelector('.test-progress-label');
    const count = document.querySelector('.test-progress-count');

    if (fill)  fill.style.width = `${percent}%`;
    if (label) label.textContent = `${percent}% завершено`;
    if (count) count.textContent = `${current} / ${total}`;
  }

  // ── Таймер (для IQ-теста) ────────────────────────────────────
  startTimer(seconds, onTick, onEnd) {
    let remaining = seconds;
    onTick(remaining);

    this.timer = setInterval(() => {
      remaining--;
      onTick(remaining);
      if (remaining <= 0) {
        this.stopTimer();
        onEnd();
      }
    }, 1000);
  }

  stopTimer() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  // ── Сохранение прогресса в localStorage ──────────────────────
  saveProgress() {
    try {
      localStorage.setItem(`progress_${this.config.id}`, JSON.stringify({
        answers:    this.answers,
        currentIdx: this.currentIdx,
        startTime:  this.startTime
      }));
    } catch {}
  }

  // ── Восстановление прогресса из localStorage ─────────────────
  loadProgress() {
    try {
      const raw = localStorage.getItem(`progress_${this.config.id}`);
      if (!raw) return false;
      const data = JSON.parse(raw);
      this.answers    = data.answers    || {};
      this.currentIdx = data.currentIdx || 0;
      this.startTime  = data.startTime  || Date.now();
      return true;
    } catch {
      return false;
    }
  }

  // ── Свайп-навигация на мобильных ────────────────────────────
  initSwipeHandlers() {
    const card = this.container?.querySelector('.question-card');
    if (!card) return;

    let startX = 0;

    card.addEventListener('touchstart', e => {
      startX = e.touches[0].clientX;
    }, { passive: true });

    card.addEventListener('touchend', e => {
      const delta = e.changedTouches[0].clientX - startX;
      if (Math.abs(delta) < 60) return;
      if (delta < 0) this.next();
      else           this.prev();
    }, { passive: true });
  }
}
