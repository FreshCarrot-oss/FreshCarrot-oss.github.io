/* Файл: assets/js/firebase-config.js */
/* Конфигурация Firebase — заполните своими ключами из консоли Firebase */

// ── Конфиг Firebase (замените значения на свои) ──────────────
const firebaseConfig = {
  apiKey: "AIzaSyC1KFue2Jknx582PUfV7Q996Fe0-yAt9BM",
  authDomain: "psychotest-ad085.firebaseapp.com",
  projectId: "psychotest-ad085",
  storageBucket: "psychotest-ad085.firebasestorage.app",
  messagingSenderId: "388773248713",
  appId: "1:388773248713:web:fe2ea15c2ee588213f5718"
};

// ── Инициализация Firebase ────────────────────────────────────
let firebaseApp, db, auth;

try {
  firebaseApp = firebase.initializeApp(firebaseConfig);
  db   = firebase.firestore();
  auth = firebase.auth();
  console.log("✅ Firebase инициализирован");
} catch (err) {
  console.warn("⚠️ Firebase не настроен:", err.message);
  // Режим без Firebase — только localStorage
}

export { db, auth, firebaseApp };
