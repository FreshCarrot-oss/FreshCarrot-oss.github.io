# 🚀 Деплой PsychoTest на GitHub Pages

## Требования

- Аккаунт GitHub
- Git установлен локально
- Firebase настроен (см. `docs/firebase-setup.md`)

---

## Шаг 1 — Создать репозиторий

1. Перейдите на [https://github.com/new](https://github.com/new)
2. Название: `psychotest` (или любое другое)
3. Видимость: **Public** (GitHub Pages работает только с публичными репо на Free-плане)
4. Нажмите **«Create repository»**

---

## Шаг 2 — Загрузить код

```bash
cd /путь/к/psychotest

git init
git add .
git commit -m "🧠 Initial PsychoTest release"

git remote add origin https://github.com/ВАШ_ЛОГИН/psychotest.git
git branch -M main
git push -u origin main
```

---

## Шаг 3 — Включить GitHub Pages

1. Откройте репозиторий на GitHub
2. Перейдите в **Settings → Pages**
3. В разделе **Source** выберите:
   - Branch: `main`
   - Folder: `/ (root)`
4. Нажмите **Save**

Через 1–2 минуты сайт будет доступен по адресу:
```
https://ВАШ_ЛОГИН.github.io/psychotest/
```

---

## Шаг 4 — Настроить Firebase для вашего домена

1. Перейдите в Firebase Console → Authentication → Settings
2. В разделе **Authorized domains** добавьте:
   ```
   ВАШ_ЛОГИН.github.io
   ```
3. Сохраните

---

## Шаг 5 — Обновление сайта

Для публикации изменений:

```bash
git add .
git commit -m "Обновление"
git push
```

GitHub Pages автоматически пересоберёт сайт через ~1 минуту.

---

## Проверка деплоя

✅ Откройте `https://ВАШ_ЛОГИН.github.io/psychotest/`  
✅ Нажмите F5 на маршруте `#/tests` — не должна появляться 404  
✅ Зарегистрируйтесь и пройдите тест — результат должен сохраниться  

---

## Частые проблемы

**Сайт показывает 404 при F5:**  
Убедитесь, что файл `.nojekyll` есть в корне репозитория.

**Firebase не работает:**  
Добавьте `ВАШ_ЛОГИН.github.io` в Authorized domains в Firebase Console.

**Стили не загружаются:**  
Проверьте пути в `index.html` — все пути должны быть относительными (без `/` в начале).
