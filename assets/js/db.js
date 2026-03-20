/* assets/js/db.js — CRUD Firestore + дублирование в /allResults для админки */

import { db } from './firebase-config.js';
import { showToast } from './ui.js';

/* ── Сохранить результат теста ────────────────────────────────── */
export async function saveTestResult(uid, data) {
  if (!db) return null;
  try {
    // 1. Сохраняем в профиль пользователя
    const userRef = db.collection('users').doc(uid)
      .collection('results').doc(data.testId);
    await userRef.set({
      ...data,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    }, { merge: true });

    // 2. Дублируем в корневую коллекцию для админки
    //    (doc ID = uid_testId, чтобы перезаписывать при повторном прохождении)
    try {
      await db.collection('allResults').doc(`${uid}_${data.testId}`).set({
        uid,
        ...data,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      }, { merge: true });
    } catch (e) {
      // Не критично: правила Firebase могут не разрешать запись в allResults
      console.warn('allResults write skipped:', e.message);
    }

    return userRef.id;
  } catch (err) {
    console.error('Ошибка сохранения результата:', err);
    showToast('Не удалось сохранить результат в облако', 'error');
    return null;
  }
}

/* ── Загрузить результат конкретного теста ────────────────────── */
export async function loadTestResult(uid, testId) {
  if (!db) return null;
  try {
    const snap = await db.collection('users').doc(uid)
      .collection('results').doc(testId).get();
    return snap.exists ? snap.data() : null;
  } catch (err) {
    console.error('Ошибка загрузки результата:', err);
    return null;
  }
}

/* ── Загрузить все результаты пользователя ────────────────────── */
export async function loadAllResults(uid) {
  if (!db) return {};
  try {
    // Без orderBy — не требует составного индекса
    const snap = await db.collection('users').doc(uid)
      .collection('results').get();
    const results = {};
    snap.forEach(doc => { results[doc.id] = doc.data(); });
    return results;
  } catch (err) {
    console.error('Ошибка загрузки всех результатов:', err);
    // Фолбэк: читаем из localStorage
    return loadResultsFromLocalStorage();
  }
}

function loadResultsFromLocalStorage() {
  const testIds = ['mbti','bigfive','eysenck','pdo','leonhard','cattell','iq'];
  const results = {};
  testIds.forEach(id => {
    const raw = localStorage.getItem(`result_${id}`);
    if (raw) {
      try { results[id] = { result: JSON.parse(raw) }; } catch {}
    }
  });
  return results;
}

/* ── Удалить один результат ───────────────────────────────────── */
export async function deleteTestResult(uid, testId) {
  if (!db) return;
  try {
    await db.collection('users').doc(uid).collection('results').doc(testId).delete();
    // Удаляем и из allResults
    try { await db.collection('allResults').doc(`${uid}_${testId}`).delete(); } catch {}
    showToast('Результат удалён', 'success');
  } catch (err) {
    showToast('Ошибка удаления', 'error');
    throw err;
  }
}

/* ── Удалить все результаты ───────────────────────────────────── */
export async function deleteAllResults(uid) {
  if (!db) return;
  try {
    const snap = await db.collection('users').doc(uid).collection('results').get();
    const batch = db.batch();
    snap.forEach(doc => batch.delete(doc.ref));
    await batch.commit();

    // Удаляем и из allResults
    try {
      const arSnap = await db.collection('allResults')
        .where('uid', '==', uid).get();
      const batch2 = db.batch();
      arSnap.forEach(doc => batch2.delete(doc.ref));
      await batch2.commit();
    } catch {}

    showToast('Все результаты удалены', 'success');
  } catch (err) {
    showToast('Ошибка удаления результатов', 'error');
    throw err;
  }
}

/* ── Сохранить промпт ─────────────────────────────────────────── */
export async function saveGeneratedPrompt(uid, promptData) {
  if (!db) return;
  try {
    await db.collection('users').doc(uid).collection('prompts').add({
      ...promptData,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
  } catch (err) {
    console.error('Ошибка сохранения промпта:', err);
  }
}

/* ── Загрузить историю промптов ───────────────────────────────── */
export async function loadPromptHistory(uid, limit = 5) {
  if (!db) return [];
  try {
    const snap = await db.collection('users').doc(uid).collection('prompts')
      .orderBy('createdAt', 'desc').limit(limit).get();
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (err) {
    console.error('Ошибка загрузки промптов:', err);
    return [];
  }
}

/* ── Профиль пользователя ─────────────────────────────────────── */
export async function saveUserProfile(uid, profileData) {
  if (!db) return;
  try {
    await db.collection('users').doc(uid).set({
      ...profileData,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
  } catch (err) {
    console.error('Ошибка сохранения профиля:', err);
  }
}

export async function loadUserProfile(uid) {
  if (!db) return null;
  try {
    const snap = await db.collection('users').doc(uid).get();
    return snap.exists ? snap.data() : null;
  } catch (err) {
    console.error('Ошибка загрузки профиля:', err);
    return null;
  }
}

/* ── Экспорт данных пользователя ──────────────────────────────── */
export async function exportUserData(uid) {
  try {
    const [profile, results, prompts] = await Promise.all([
      loadUserProfile(uid),
      loadAllResults(uid),
      loadPromptHistory(uid, 50)
    ]);
    return { profile, results, prompts, exportedAt: new Date().toISOString() };
  } catch (err) {
    console.error('Ошибка экспорта данных:', err);
    return null;
  }
}

/* ── Загрузить всех пользователей для админки ────────────────── */
export async function adminLoadAllResults(limit = 1000) {
  if (!db) return [];
  try {
    // Пробуем новую коллекцию allResults
    const snap = await db.collection('allResults').limit(limit).get();
    if (!snap.empty) {
      return snap.docs.map(doc => doc.data());
    }
    return [];
  } catch (err) {
    console.warn('allResults недоступна:', err.message);
    return [];
  }
}

export async function adminLoadUsers(limit = 500) {
  if (!db) return [];
  try {
    const snap = await db.collection('users').limit(limit).get();
    return snap.docs.map(doc => ({ uid: doc.id, ...doc.data() }));
  } catch (err) {
    console.warn('Ошибка загрузки users:', err.message);
    return [];
  }
}
