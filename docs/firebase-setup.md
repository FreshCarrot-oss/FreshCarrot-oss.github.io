# 🔥 Настройка Firebase для PsychoTest

## Шаг 1 — Создать проект Firebase

1. Перейдите на [https://console.firebase.google.com](https://console.firebase.google.com)
2. Нажмите **«Создать проект»**
3. Введите название (например: `psychotest`)
4. Отключите Google Analytics (необязательно)
5. Нажмите **«Создать проект»**

---

## Шаг 2 — Добавить веб-приложение

1. В консоли проекта нажмите иконку **`</>`** (Web)
2. Введите псевдоним приложения: `psychotest-web`
3. ❌ **НЕ** включайте Firebase Hosting (используем GitHub Pages)
4. Нажмите **«Зарегистрировать приложение»**
5. Скопируйте объект `firebaseConfig` — он понадобится дальше

---

## Шаг 3 — Включить Firestore

1. В левом меню выберите **Firestore Database**
2. Нажмите **«Создать базу данных»**
3. Выберите режим **«Начать в тестовом режиме»** (для разработки)
4. Выберите регион (europe-west3 — Франкфурт)
5. Нажмите **«Готово»**

> ⚠️ Тестовый режим открыт для всех на 30 дней. Для продакшена настройте правила безопасности.

**Правила безопасности для продакшена:**
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

---

## Шаг 4 — Включить Authentication

1. В левом меню выберите **Authentication**
2. Нажмите **«Начать»**
3. Перейдите на вкладку **«Sign-in method»**
4. Включите **Email/Password**
5. Включите **Google** (добавьте email поддержки)
6. Сохраните

---

## Шаг 5 — Заполнить конфиг

### Вариант A — Автоматически (рекомендуется)

```bash
python scripts/setup_firebase.py
```

Скрипт интерактивно спросит все ключи и запишет их в `assets/js/firebase-config.js`.

### Вариант B — Вручную

Откройте `assets/js/firebase-config.js` и замените значения:

```javascript
const firebaseConfig = {
  apiKey:            "AIza...",
  authDomain:        "your-project.firebaseapp.com",
  projectId:         "your-project",
  storageBucket:     "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId:             "1:123:web:abc..."
};
```

---

## Шаг 6 — Проверить работу

```bash
python scripts/run_local.py
```

Откройте `http://localhost:8080`, зарегистрируйтесь и пройдите тест.  
Результат должен сохраниться в Firestore (проверьте в консоли Firebase).
