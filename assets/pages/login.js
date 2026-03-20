/* Файл: assets/pages/login.js */
/* Glassmorphism-форма входа: email/пароль + Google + восстановление */

import { loginWithEmail, loginWithGoogle, resetPassword } from '../js/auth.js';
import { showToast } from '../js/ui.js';
import { router }    from '../js/router.js';

export function renderLoginPage() {
  const app = document.getElementById('app');
  if (!app) return;

  app.innerHTML = `
    <div class="auth-page" style="position:relative;z-index:10;">
      <div class="auth-card glass-card no-hover" id="authCard" style="opacity:0;transform:scale(0.93);">
        <div style="text-align:center;margin-bottom:2rem;">
          <div style="font-size:2.5rem;margin-bottom:0.5rem;">🧠</div>
          <h1 class="auth-title">Добро пожаловать</h1>
          <p class="auth-subtitle">Войдите в аккаунт</p>
        </div>

        <form class="auth-form" id="loginForm" onsubmit="return false;">
          <div class="form-group">
            <label class="form-label" for="loginEmail">Email</label>
            <input class="input-field" type="email" id="loginEmail"
              placeholder="your@email.com" autocomplete="email" required />
            <p class="input-field-error" id="emailError"></p>
          </div>
          <div class="form-group">
            <label class="form-label" for="loginPassword">Пароль</label>
            <div class="input-wrapper">
              <input class="input-field" type="password" id="loginPassword"
                placeholder="••••••••" autocomplete="current-password" required />
              <button type="button" class="input-icon" id="togglePwd" title="Показать/скрыть пароль" style="background:none;border:none;">👁</button>
            </div>
            <p class="input-field-error" id="pwdError"></p>
          </div>

          <button class="btn-primary w-full" id="loginBtn" type="submit">
            Войти
          </button>
        </form>

        <div class="divider" style="margin:1.25rem 0;">или</div>

        <button class="btn-ghost w-full" id="googleBtn" type="button" style="gap:0.625rem;">
          <span style="font-size:1.1rem;">G</span> Войти через Google
        </button>

        <div style="text-align:center;margin-top:1.25rem;">
          <button id="forgotBtn" type="button" style="background:none;border:none;color:var(--text-accent);font:500 0.875rem var(--font-body);cursor:pointer;">
            Забыли пароль?
          </button>
        </div>

        <p class="auth-footer">
          Нет аккаунта? <a href="#/register">Зарегистрироваться →</a>
        </p>
      </div>
    </div>
  `;

  // Анимация появления карточки
  requestAnimationFrame(() => {
    if (window.gsap) {
      gsap.to('#authCard', { opacity:1, scale:1, duration:0.5, ease:'back.out(1.4)' });
    } else {
      document.getElementById('authCard').style.cssText = 'opacity:1;transform:scale(1)';
    }
  });

  // Показать/скрыть пароль
  document.getElementById('togglePwd')?.addEventListener('click', () => {
    const pwd = document.getElementById('loginPassword');
    pwd.type = pwd.type === 'password' ? 'text' : 'password';
  });

  // Форма входа
  document.getElementById('loginForm')?.addEventListener('submit', handleLogin);
  document.getElementById('loginBtn')?.addEventListener('click', handleLogin);
  document.getElementById('googleBtn')?.addEventListener('click', handleGoogle);

  // Восстановление пароля
  document.getElementById('forgotBtn')?.addEventListener('click', handleForgot);
}

async function handleLogin() {
  const email  = document.getElementById('loginEmail')?.value?.trim();
  const pwd    = document.getElementById('loginPassword')?.value;
  const btn    = document.getElementById('loginBtn');

  clearErrors();

  if (!email) { showFieldError('emailError', 'Введите email'); return; }
  if (!pwd)   { showFieldError('pwdError', 'Введите пароль'); return; }

  setLoading(btn, true, 'Входим...');
  try {
    await loginWithEmail(email, pwd);
    router.navigate('/cabinet');
  } catch {
    shakeField('loginEmail');
    shakeField('loginPassword');
  } finally {
    setLoading(btn, false, 'Войти');
  }
}

async function handleGoogle() {
  const btn = document.getElementById('googleBtn');
  setLoading(btn, true, 'Открываем Google...');
  try {
    const user = await loginWithGoogle();
    if (user) router.navigate('/cabinet');
  } catch {} finally {
    setLoading(btn, false, '<span style="font-size:1.1rem;">G</span> Войти через Google');
  }
}

async function handleForgot() {
  const email = document.getElementById('loginEmail')?.value?.trim();
  if (!email) {
    showFieldError('emailError', 'Введите email для восстановления');
    shakeField('loginEmail');
    return;
  }
  await resetPassword(email);
}

function showFieldError(id, msg) {
  const el = document.getElementById(id);
  if (el) el.textContent = msg;
}

function clearErrors() {
  ['emailError','pwdError'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = '';
  });
}

function shakeField(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.classList.add('error');
  el.addEventListener('animationend', () => el.classList.remove('error'), { once:true });
}

function setLoading(btn, loading, label) {
  if (!btn) return;
  btn.disabled = loading;
  btn.innerHTML = loading
    ? `<span class="spinner"></span> ${label}`
    : label;
}
