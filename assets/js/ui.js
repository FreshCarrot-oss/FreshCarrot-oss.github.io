/* Файл: assets/js/ui.js */
/* Модалки, toast-уведомления, skeleton-лоадер, вспомогательные функции UI */

// ── Toast-уведомления ─────────────────────────────────────────
const TOAST_ICONS = {
  success: '✓',
  error:   '✕',
  info:    'ℹ',
  warn:    '⚠'
};

// Показать toast-уведомление
export function showToast(message, type = 'info', duration = 3500) {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <span class="toast-icon">${TOAST_ICONS[type] || 'ℹ'}</span>
    <span class="toast-msg">${message}</span>
  `;

  container.appendChild(toast);

  // Автоудаление
  setTimeout(() => {
    toast.classList.add('removing');
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// ── Модалки ───────────────────────────────────────────────────

// Создать и показать модалку
export function showModal({ title, content, actions = [] }) {
  // Закрываем предыдущую
  closeModal();

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.id = 'activeModal';

  overlay.innerHTML = `
    <div class="modal glass-card no-hover" role="dialog" aria-modal="true" aria-labelledby="modalTitle">
      <div class="modal-header">
        <h3 class="modal-title" id="modalTitle">${title}</h3>
        <button class="modal-close" onclick="closeModal()" aria-label="Закрыть">✕</button>
      </div>
      <div class="modal-body">${content}</div>
      ${actions.length > 0 ? `
        <div class="modal-footer" style="display:flex;gap:.75rem;justify-content:flex-end;margin-top:1.5rem;">
          ${actions.map(a => `
            <button class="${a.class || 'btn-ghost'}" onclick="${a.onclick || 'closeModal()'}">${a.label}</button>
          `).join('')}
        </div>
      ` : ''}
    </div>
  `;

  document.body.appendChild(overlay);

  // Показываем с анимацией
  requestAnimationFrame(() => overlay.classList.add('open'));

  // Закрытие по клику на оверлей
  overlay.addEventListener('click', e => {
    if (e.target === overlay) closeModal();
  });

  // Закрытие по Esc
  document.addEventListener('keydown', handleModalEsc);
}

// Закрыть модалку
export function closeModal() {
  const overlay = document.getElementById('activeModal');
  if (!overlay) return;
  overlay.classList.remove('open');
  document.removeEventListener('keydown', handleModalEsc);
  setTimeout(() => overlay.remove(), 300);
}

function handleModalEsc(e) {
  if (e.key === 'Escape') closeModal();
}

// Глобальный доступ к closeModal
window.closeModal = closeModal;

// ── Confirmation Dialog ───────────────────────────────────────
export function showConfirm(message, onConfirm, onCancel) {
  showModal({
    title: 'Подтверждение',
    content: `<p class="text-secondary">${message}</p>`,
    actions: [
      {
        label: 'Отмена',
        class: 'btn-ghost',
        onclick: 'closeModal()'
      },
      {
        label: 'Подтвердить',
        class: 'btn-danger',
        onclick: `window.__confirmCb && window.__confirmCb(); closeModal();`
      }
    ]
  });
  window.__confirmCb = () => {
    onConfirm && onConfirm();
    window.__confirmCb = null;
  };
}

// ── Skeleton-лоадеры ──────────────────────────────────────────

// Skeleton для карточки теста
export function skeletonTestCard() {
  return `
    <div class="glass-card skeleton-card">
      <div class="skeleton skeleton-block" style="width:56px;height:56px;border-radius:12px;margin-bottom:1rem;"></div>
      <div class="skeleton skeleton-block" style="width:70%;height:18px;margin-bottom:0.75rem;"></div>
      <div class="skeleton skeleton-block" style="width:100%;height:12px;"></div>
      <div class="skeleton skeleton-block" style="width:90%;height:12px;"></div>
      <div class="skeleton skeleton-block" style="width:80%;height:12px;margin-bottom:1rem;"></div>
      <div class="skeleton skeleton-block" style="width:40%;height:32px;border-radius:999px;"></div>
    </div>
  `;
}

// Skeleton для страницы результатов
export function skeletonResultsPage() {
  return `
    <div class="results-container">
      <div class="glass-card skeleton-card" style="text-align:center;padding:3rem;">
        <div class="skeleton skeleton-block" style="width:120px;height:80px;margin:0 auto 1rem;border-radius:8px;"></div>
        <div class="skeleton skeleton-block" style="width:50%;height:24px;margin:0 auto 0.5rem;"></div>
        <div class="skeleton skeleton-block" style="width:35%;height:16px;margin:0 auto;"></div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1.4fr;gap:1.5rem;">
        ${skeletonTestCard()}
        ${skeletonTestCard()}
      </div>
    </div>
  `;
}

// Skeleton для кабинета
export function skeletonCabinet() {
  return `
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:1rem;">
      ${[1,2,3].map(() => skeletonTestCard()).join('')}
    </div>
  `;
}

// ── Loading Screen ────────────────────────────────────────────

// Показать/скрыть глобальный загрузочный экран
export function showLoader(text = 'Загрузка...') {
  const loader = document.getElementById('pageLoader');
  if (!loader) return;
  loader.querySelector('.loader-text').textContent = text;
  loader.classList.remove('hidden');
}

export function hideLoader() {
  const loader = document.getElementById('pageLoader');
  if (!loader) return;
  loader.classList.add('hidden');
}

// ── Ripple-эффект на кнопках ──────────────────────────────────
export function addRippleEffect(btn) {
  if (!btn) return;
  btn.addEventListener('click', function(e) {
    const rect = this.getBoundingClientRect();
    const ripple = document.createElement('span');
    ripple.className = 'ripple';
    const size = Math.max(rect.width, rect.height) * 2;
    ripple.style.cssText = `
      width:${size}px; height:${size}px;
      left:${e.clientX - rect.left - size/2}px;
      top:${e.clientY - rect.top - size/2}px;
    `;
    this.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
  });
}

// ── Функция debounce ─────────────────────────────────────────
export function debounce(fn, delay = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

// ── Форматирование даты ───────────────────────────────────────
export function formatDate(date) {
  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit', month: 'long', year: 'numeric'
  }).format(new Date(date));
}

export function formatDateShort(date) {
  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit', month: '2-digit', year: 'numeric'
  }).format(new Date(date));
}

export function formatDateFile(date) {
  const d = new Date(date);
  return `${d.getFullYear()}${String(d.getMonth()+1).padStart(2,'0')}${String(d.getDate()).padStart(2,'0')}`;
}

// ── Обновление навбара при смене авторизации ──────────────────
export function updateNavbar(user) {
  const navAuth = document.getElementById('navAuth');
  const mobileNavAuth = document.getElementById('mobileNavAuth');

  if (!navAuth) return;

  if (user) {
    const initials = (user.displayName || user.email || '?')
      .split(' ')
      .map(w => w[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();

    navAuth.innerHTML = `
      <a href="#/cabinet" class="nav-avatar" title="Личный кабинет">${initials}</a>
      <button class="btn-ghost btn-sm" id="logoutBtn">Выйти</button>
    `;

    if (mobileNavAuth) {
      mobileNavAuth.innerHTML = `
        <a href="#/cabinet" class="btn-ghost w-full">👤 Кабинет</a>
        <button class="btn-danger w-full" id="mobileLogoutBtn">Выйти</button>
      `;
    }
  } else {
    navAuth.innerHTML = `
      <a href="#/login" class="btn-ghost btn-sm">Войти</a>
      <a href="#/register" class="btn-primary btn-sm glow">Регистрация</a>
    `;

    if (mobileNavAuth) {
      mobileNavAuth.innerHTML = `
        <a href="#/login" class="btn-ghost w-full">Войти</a>
        <a href="#/register" class="btn-primary w-full">Регистрация</a>
      `;
    }
  }
}

// ── Активная ссылка в навбаре ─────────────────────────────────
export function setActiveNavLink(route) {
  document.querySelectorAll('.nav-link').forEach(link => {
    const linkRoute = link.dataset.route || link.getAttribute('href')?.replace('#', '');
    if (linkRoute === route || (route === '/' && linkRoute === '/')) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}
