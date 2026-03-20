/* Файл: assets/js/db.js */
/* CRUD-операции с Firestore для хранения результатов тестов и промптов */

import { db } from './firebase-config.js';
import { showToast } from './ui.js';

// ── Сохранить результат теста ─────────────────────────────────
export async function saveTestResult(uid, data) {
  if (!db) return null;
  try {
    const ref = db
      .collection('users').doc(uid)
      .collection('results').doc(data.testId);
    await ref.set({
      ...data,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
    return ref.id;
  } catch (err) {
    console.error('Ошибка сохранения результата:', err);
    showToast('Не удалось сохранить результат в облако', 'error');
    return null;
  }
}

// ── Загрузить результат конкретного теста ─────────────────────
export async function loadTestResult(uid, testId) {
  if (!db) return null;
  try {
    const snap = await db
      .collection('users').doc(uid)
      .collection('results').doc(testId)
      .get();
    return snap.exists ? snap.data() : null;
  } catch (err) {
    console.error('Ошибка загрузки результата:', err);
    return null;
  }
}

// ── Загрузить все результаты пользователя ────────────────────
export async function loadAllResults(uid) {
  if (!db) return {};
  try {
    const snap = await db
      .collection('users').doc(uid)
      .collection('results')
      .orderBy('updatedAt', 'desc')
      .get();
    const results = {};
    snap.forEach(doc => { results[doc.id] = doc.data(); });
    return results;
  } catch (err) {
    console.error('Ошибка загрузки всех результатов:', err);
    return {};
  }
}

// ── Удалить один результат ────────────────────────────────────
export async function deleteTestResult(uid, testId) {
  if (!db) return;
  try {
    await db
      .collection('users').doc(uid)
      .collection('results').doc(testId)
      .delete();
    showToast('Результат удалён', 'success');
  } catch (err) {
    showToast('Ошибка удаления', 'error');
    throw err;
  }
}

// ── Удалить все результаты ────────────────────────────────────
export async function deleteAllResults(uid) {
  if (!db) return;
  try {
    const snap = await db
      .collection('users').doc(uid)
      .collection('results')
      .get();
    const batch = db.batch();
    snap.forEach(doc => batch.delete(doc.ref));
    await batch.commit();
    showToast('Все результаты удалены', 'success');
  } catch (err) {
    showToast('Ошибка удаления результатов', 'error');
    throw err;
  }
}

// ── Сохранить сгенерированный промпт ─────────────────────────
export async function saveGeneratedPrompt(uid, promptData) {
  if (!db) return;
  try {
    await db
      .collection('users').doc(uid)
      .collection('prompts')
      .add({
        ...promptData,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
  } catch (err) {
    console.error('Ошибка сохранения промпта:', err);
  }
}

// ── Загрузить историю промптов ────────────────────────────────
export async function loadPromptHistory(uid, limit = 5) {
  if (!db) return [];
  try {
    const snap = await db
      .collection('users').doc(uid)
      .collection('prompts')
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .get();
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (err) {
    console.error('Ошибка загрузки истории промптов:', err);
    return [];
  }
}

// ── Сохранить профиль пользователя ───────────────────────────
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

// ── Загрузить профиль пользователя ───────────────────────────
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

// ── Экспорт данных пользователя в JSON ───────────────────────
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
