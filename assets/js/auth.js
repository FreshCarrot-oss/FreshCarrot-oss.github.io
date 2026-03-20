/* Файл: assets/js/auth.js */
/* Логин, регистрация, Google Auth, выход и состояние авторизации */

import { auth } from './firebase-config.js';
import { showToast } from './ui.js';

// ── Текущий пользователь (глобально) ─────────────────────────
export let currentUser = null;

// ── Слушатель изменений авторизации ──────────────────────────
export function initAuth(onAuthChange) {
  if (!auth) {
    onAuthChange(null);
    return;
  }
  auth.onAuthStateChanged(user => {
    currentUser = user;
    window.__currentUser = user;
    onAuthChange(user);
  });
}

// ── Регистрация по email/паролю ───────────────────────────────
export async function registerWithEmail(name, email, password) {
  try {
    const cred = await auth.createUserWithEmailAndPassword(email, password);
    // Устанавливаем displayName
    await cred.user.updateProfile({ displayName: name });
    showToast('Аккаунт создан! Добро пожаловать ', 'success');
    return cred.user;
  } catch (err) {
    const msg = authErrorMessage(err.code);
    showToast(msg, 'error');
    throw err;
  }
}

// ── Вход по email/паролю ──────────────────────────────────────
export async function loginWithEmail(email, password) {
  try {
    const cred = await auth.signInWithEmailAndPassword(email, password);
    showToast(`С возвращением, ${cred.user.displayName || 'друг'}! 👋`, 'success');
    return cred.user;
  } catch (err) {
    const msg = authErrorMessage(err.code);
    showToast(msg, 'error');
    throw err;
  }
}

// ── Вход через Google ─────────────────────────────────────────
export async function loginWithGoogle() {
  try {
    const provider = new firebase.auth.GoogleAuthProvider();
    const cred = await auth.signInWithPopup(provider);
    showToast(`Привет, ${cred.user.displayName || 'друг'}! `, 'success');
    return cred.user;
  } catch (err) {
    if (err.code === 'auth/popup-closed-by-user') return null;
    const msg = authErrorMessage(err.code);
    showToast(msg, 'error');
    throw err;
  }
}

// ── Выход ─────────────────────────────────────────────────────
export async function logout() {
  try {
    await auth.signOut();
    currentUser = null;
    window.__currentUser = null;
    showToast('Вы вышли из аккаунта', 'info');
  } catch (err) {
    showToast('Ошибка при выходе', 'error');
    throw err;
  }
}

// ── Восстановление пароля ─────────────────────────────────────
export async function resetPassword(email) {
  try {
    await auth.sendPasswordResetEmail(email);
    showToast('Письмо для сброса пароля отправлено!', 'success');
  } catch (err) {
    const msg = authErrorMessage(err.code);
    showToast(msg, 'error');
    throw err;
  }
}

// ── Смена displayName ─────────────────────────────────────────
export async function updateDisplayName(newName) {
  try {
    if (!currentUser) throw new Error('Не авторизован');
    await currentUser.updateProfile({ displayName: newName });
    showToast('Имя обновлено', 'success');
  } catch (err) {
    showToast('Ошибка обновления имени', 'error');
    throw err;
  }
}

// ── Смена пароля ──────────────────────────────────────────────
export async function updateUserPassword(currentPwd, newPwd) {
  try {
    if (!currentUser) throw new Error('Не авторизован');
    // Повторная аутентификация для смены пароля
    const cred = firebase.auth.EmailAuthProvider.credential(currentUser.email, currentPwd);
    await currentUser.reauthenticateWithCredential(cred);
    await currentUser.updatePassword(newPwd);
    showToast('Пароль изменён', 'success');
  } catch (err) {
    const msg = authErrorMessage(err.code);
    showToast(msg, 'error');
    throw err;
  }
}

// ── Человекочитаемые сообщения об ошибках ─────────────────────
function authErrorMessage(code) {
  const map = {
    'auth/email-already-in-use':   'Этот email уже зарегистрирован',
    'auth/invalid-email':          'Неверный формат email',
    'auth/weak-password':          'Пароль должен содержать минимум 6 символов',
    'auth/user-not-found':         'Пользователь с таким email не найден',
    'auth/wrong-password':         'Неверный пароль',
    'auth/too-many-requests':      'Слишком много попыток. Попробуйте позже',
    'auth/network-request-failed': 'Ошибка сети. Проверьте интернет-соединение',
    'auth/popup-closed-by-user':   'Окно входа закрыто',
    'auth/requires-recent-login':  'Требуется повторный вход для этого действия',
  };
  return map[code] || `Ошибка авторизации: ${code}`;
}
