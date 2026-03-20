/* Файл: assets/pages/register.js */
/* Форма регистрации: имя + email + пароль (real-time валидация) + Google */

import { registerWithEmail, loginWithGoogle } from '../js/auth.js';
import { router }                             from '../js/router.js';

export function renderRegisterPage() {
  const app = document.getElementById('app');
  if (!app) return;

  app.innerHTML = `
    <div class="auth-page" style="position:relative;z-index:10;">
      <div class="auth-card glass-card no-hover" id="authCard" style="opacity:0;transform:scale(0.93);">
        <div style="text-align:center;margin-bottom:2rem;">
          <div style="font-size:2.5rem;margin-bottom:0.5rem;"></div>
          <h1 class="auth-title">Создать аккаунт</h1>
          <p class="auth-subtitle">Бесплатно и без ограничений</p>
        </div>

        <form class="auth-form" id="regForm" onsubmit="return false;">
          <div class="form-group">
            <label class="form-label" for="regName">Имя</label>
            <input class="input-field" type="text" id="regName"
              placeholder="Иван Петров" autocomplete="name" />
            <p class="input-field-error" id="nameError"></p>
          </div>
          <div class="form-group">
            <label class="form-label" for="regEmail">Email</label>
            <input class="input-field" type="email" id="regEmail"
              placeholder="your@email.com" autocomplete="email" />
            <p class="input-field-error" id="emailError"></p>
          </div>
          <div class="form-group">
            <label class="form-label" for="regPwd">Пароль</label>
            <div class="input-wrapper">
              <input class="input-field" type="password" id="regPwd"
                placeholder="Минимум 6 символов" autocomplete="new-password" />
              <button type="button" class="input-icon" id="togglePwd1" style="background:none;border:none;">👁</button>
            </div>
            <p class="input-field-error" id="pwdError"></p>
          </div>
          <div class="form-group">
            <label class="form-label" for="regPwd2">Повторите пароль</label>
            <div class="input-wrapper">
              <input class="input-field" type="password" id="regPwd2"
                placeholder="Повторите пароль" autocomplete="new-password" />
              <button type="button" class="input-icon" id="togglePwd2" style="background:none;border:none;">👁</button>
            </div>
            <p class="input-field-error" id="pwd2Error"></p>
          </div>

          <button class="btn-primary w-full" id="regBtn" type="submit">
            Создать аккаунт
          </button>
        </form>

        <div class="divider" style="margin:1.25rem 0;">или</div>

        <button class="btn-ghost w-full" id="googleBtn" type="button" style="gap:0.625rem;">
          <span style="font-size:1.1rem;">G</span> Продолжить через Google
        </button>

        <p style="text-align:center;margin-top:1rem;font:400 0.75rem var(--font-body);color:var(--text-muted);">
          Регистрируясь, вы соглашаетесь с условиями использования
        </p>

        <p class="auth-footer">
          Есть аккаунт? <a href="#/login">Войти →</a>
        </p>
      </div>
    </div>
  `;

  // Анимация
  requestAnimationFrame(() => {
    if (window.gsap) {
      gsap.to('#authCard', { opacity:1, scale:1, duration:0.5, ease:'back.out(1.4)' });
    } else {
      document.getElementById('authCard').style.cssText = 'opacity:1;transform:scale(1)';
    }
  });

  // Показать/скрыть пароли
  document.getElementById('togglePwd1')?.addEventListener('click', () => {
    const f = document.getElementById('regPwd');
    f.type = f.type === 'password' ? 'text' : 'password';
  });
  document.getElementById('togglePwd2')?.addEventListener('click', () => {
    const f = document.getElementById('regPwd2');
    f.type = f.type === 'password' ? 'text' : 'password';
  });

  // Real-time валидация совпадения паролей
  document.getElementById('regPwd2')?.addEventListener('input', () => {
    const p1 = document.getElementById('regPwd')?.value;
    const p2 = document.getElementById('regPwd2')?.value;
    const err = document.getElementById('pwd2Error');
    if (err) err.textContent = p2 && p1 !== p2 ? 'Пароли не совпадают' : '';
  });

  document.getElementById('regForm')?.addEventListener('submit', handleRegister);
  document.getElementById('regBtn')?.addEventListener('click', handleRegister);
  document.getElementById('googleBtn')?.addEventListener('click', handleGoogle);
}

async function handleRegister() {
  const name  = document.getElementById('regName')?.value?.trim();
  const email = document.getElementById('regEmail')?.value?.trim();
  const pwd   = document.getElementById('regPwd')?.value;
  const pwd2  = document.getElementById('regPwd2')?.value;
  const btn   = document.getElementById('regBtn');

  clearErrors();

  let valid = true;
  if (!name)         { showErr('nameError',  'Введите имя');                valid=false; }
  if (!email)        { showErr('emailError', 'Введите email');               valid=false; }
  if (!pwd || pwd.length < 6) { showErr('pwdError', 'Минимум 6 символов'); valid=false; }
  if (pwd !== pwd2)  { showErr('pwd2Error',  'Пароли не совпадают');         valid=false; }

  if (!valid) {
    ['regName','regEmail','regPwd','regPwd2'].forEach(id => {
      const el = document.getElementById(id);
      if (el) { el.classList.add('error'); el.addEventListener('animationend', () => el.classList.remove('error'), { once:true }); }
    });
    return;
  }

  setLoading(btn, true, 'Создаём аккаунт...');
  try {
    await registerWithEmail(name, email, pwd);
    router.navigate('/cabinet');
  } catch {} finally {
    setLoading(btn, false, 'Создать аккаунт');
  }
}

async function handleGoogle() {
  const btn = document.getElementById('googleBtn');
  setLoading(btn, true, 'Открываем Google...');
  try {
    const user = await loginWithGoogle();
    if (user) router.navigate('/cabinet');
  } catch {} finally {
    setLoading(btn, false, '<span style="font-size:1.1rem;">G</span> Продолжить через Google');
  }
}

function showErr(id, msg) {
  const el = document.getElementById(id);
  if (el) el.textContent = msg;
}

function clearErrors() {
  ['nameError','emailError','pwdError','pwd2Error'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = '';
  });
}

function setLoading(btn, loading, label) {
  if (!btn) return;
  btn.disabled = loading;
  btn.innerHTML = loading ? `<span class="spinner"></span> ${label}` : label;
}
