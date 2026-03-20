/* Файл: assets/js/animations.js */
/* Частицы tsParticles, кастомный курсор, GSAP-анимации страниц */

// ── Инициализация tsParticles ──────────────────────────────────
export async function initParticles() {
  if (!window.tsParticles) return;
  try {
    await tsParticles.load("particles-container", {
      fullScreen:  { enable: false },
      background:  { color: { value: "transparent" } },
      fpsLimit:    60,
      particles: {
        number: { value: 50, density: { enable: true, area: 900 } },
        color:  { value: ["#8b5cf6","#6366f1","#3b82f6","#06b6d4"] },
        shape:  { type: "circle" },
        opacity: {
          value: { min: 0.1, max: 0.35 },
          animation: { enable: true, speed: 0.5 }
        },
        size: { value: { min: 1, max: 2.5 } },
        links: {
          enable: true,
          distance: 160,
          color: "#6366f1",
          opacity: 0.1,
          width: 1
        },
        move: {
          enable: true, speed: 0.7,
          direction: "none", random: true,
          outModes: { default: "bounce" }
        }
      },
      interactivity: {
        events: {
          onHover: { enable: false },
          onClick: { enable: false }
        }
      }
    });
  } catch (err) {
    console.warn('tsParticles не загружен:', err.message);
  }
}

// ── Кастомный курсор с trailing-кольцом ──────────────────────
export function initCursor() {
  // Мобильные устройства — курсор не нужен
  if (window.matchMedia('(hover: none)').matches) return;

  const dot  = document.getElementById('cursorDot');
  const ring = document.getElementById('cursorRing');
  if (!dot || !ring) return;

  let mx = 0, my = 0, rx = 0, ry = 0;

  // Мгновенное перемещение точки
  window.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    dot.style.transform = `translate(${mx - 4}px, ${my - 4}px)`;
  });

  // Плавное следование кольца (lerp)
  (function loop() {
    rx += (mx - rx) * 0.12;
    ry += (my - ry) * 0.12;
    ring.style.transform = `translate(${rx - 20}px, ${ry - 20}px)`;
    requestAnimationFrame(loop);
  })();

  // Hover-состояния — увеличение при наведении на интерактивные элементы
  document.addEventListener('mouseover', e => {
    const target = e.target.closest('a, button, .test-card, .glass-card, input, label, .answer-option, .tab-btn');
    if (target) {
      dot.classList.add('hovered');
      ring.classList.add('hovered');
    }
  });

  document.addEventListener('mouseout', e => {
    const target = e.target.closest('a, button, .test-card, .glass-card, input, label, .answer-option, .tab-btn');
    if (!target) {
      dot.classList.remove('hovered');
      ring.classList.remove('hovered');
    }
  });

  // При клике — пульс
  document.addEventListener('mousedown', () => {
    ring.style.transform += ' scale(0.8)';
  });

  document.addEventListener('mouseup', () => {
    // Трансформ вернётся через следующую итерацию loop
  });
}

// ── Переход страниц (GSAP) ────────────────────────────────────
export function pageEnter(container) {
  if (!window.gsap) {
    container.style.opacity = '1';
    return;
  }
  return gsap.fromTo(container,
    { opacity: 0, y: 30, filter: 'blur(10px)' },
    { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.6, ease: 'power3.out' }
  );
}

export function pageLeave(container) {
  if (!window.gsap) {
    container.style.opacity = '0';
    return Promise.resolve();
  }
  return gsap.to(container,
    { opacity: 0, y: -20, filter: 'blur(10px)', duration: 0.35, ease: 'power3.in' }
  ).then ? gsap.to(container,
    { opacity: 0, y: -20, filter: 'blur(10px)', duration: 0.35, ease: 'power3.in' }
  ) : null;
}

// ── ScrollTrigger анимации ────────────────────────────────────
export function initScrollAnimations() {
  if (!window.gsap || !window.ScrollTrigger) return;

  gsap.registerPlugin(ScrollTrigger);

  // Обычные элементы .animate-on-scroll
  gsap.utils.toArray('.animate-on-scroll').forEach(el => {
    gsap.fromTo(el,
      { opacity: 0, y: 40 },
      {
        opacity: 1, y: 0, duration: 0.7, ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          once: true
        }
      }
    );
  });

  // Stagger-карточки тестов
  const testCards = gsap.utils.toArray('.test-card');
  if (testCards.length > 0) {
    gsap.fromTo(testCards,
      { opacity: 0, y: 50, scale: 0.95 },
      {
        opacity: 1, y: 0, scale: 1,
        duration: 0.6, ease: 'power3.out',
        stagger: 0.08,
        scrollTrigger: {
          trigger: '.tests-grid',
          start: 'top 80%',
          once: true
        }
      }
    );
  }
}

// ── Анимация появления Hero ────────────────────────────────────
export function animateHero() {
  if (!window.gsap) return;

  const tl = gsap.timeline({ delay: 0.1 });

  tl.fromTo('.hero-label',
    { opacity: 0, y: 20 },
    { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' }
  )
  .fromTo('.hero-title',
    { clipPath: 'inset(0 100% 0 0)', opacity: 0 },
    { clipPath: 'inset(0 0% 0 0)', opacity: 1, duration: 0.9, ease: 'power3.out' },
    '-=0.2'
  )
  .fromTo('.hero-subtitle',
    { opacity: 0, y: 20 },
    { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' },
    '-=0.5'
  )
  .fromTo('.hero-btns',
    { opacity: 0, scale: 0.85 },
    { opacity: 1, scale: 1, duration: 0.5, ease: 'back.out(1.7)' },
    '-=0.3'
  )
  .fromTo('.hero-stats',
    { opacity: 0, y: 15 },
    { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' },
    '-=0.2'
  );

  // Анимированные счётчики (0 → N)
  document.querySelectorAll('.stat-number[data-target]').forEach(el => {
    const target = parseInt(el.dataset.target, 10);
    let start = 0;
    const step = Math.ceil(target / 60);

    const timer = setInterval(() => {
      start += step;
      if (start >= target) {
        el.textContent = target.toLocaleString('ru');
        clearInterval(timer);
      } else {
        el.textContent = start.toLocaleString('ru');
      }
    }, 25);
  });
}

// ── Анимация перехода между вопросами теста ───────────────────
export function animateQuestionTransition(direction, callback) {
  if (!window.gsap) {
    callback();
    return;
  }

  const card = document.querySelector('.question-card');
  if (!card) { callback(); return; }

  const xOut = direction === 'next' ? -60 : 60;
  const xIn  = direction === 'next' ?  60 : -60;

  gsap.timeline()
    .to(card, {
      x: xOut, opacity: 0, filter: 'blur(8px)',
      duration: 0.28, ease: 'power2.in'
    })
    .call(callback)
    .fromTo(card,
      { x: xIn, opacity: 0, filter: 'blur(8px)' },
      { x: 0, opacity: 1, filter: 'blur(0px)', duration: 0.38, ease: 'power3.out' }
    );
}

// ── Stagger появление результатов ────────────────────────────
export function animateResultsPage() {
  if (!window.gsap) return;

  const tl = gsap.timeline({ delay: 0.1 });

  tl.fromTo('.result-hero',
    { opacity: 0, y: 30 },
    { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }
  );

  const cards = document.querySelectorAll('.results-container .glass-card');
  if (cards.length > 0) {
    tl.fromTo(cards,
      { opacity: 0, y: 25, scale: 0.97 },
      {
        opacity: 1, y: 0, scale: 1,
        duration: 0.5, ease: 'power3.out',
        stagger: 0.1
      },
      '-=0.3'
    );
  }
}

// ── Инициализация ScrollTrigger линии шагов ───────────────────
export function animateStepsLine() {
  if (!window.gsap || !window.ScrollTrigger) return;

  const line = document.querySelector('.steps-line-fill');
  if (!line) return;

  gsap.fromTo(line,
    { width: '0%' },
    {
      width: '100%', duration: 1.2, ease: 'power2.out',
      scrollTrigger: {
        trigger: '.steps-section',
        start: 'top 70%',
        once: true
      }
    }
  );
}
