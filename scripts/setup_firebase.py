#!/usr/bin/env python3
# Файл: scripts/setup_firebase.py
# Интерактивный помощник: заполняет firebase-config.js ключами Firebase

import os
import re
import sys

CONFIG_PATH = os.path.join(
    os.path.dirname(os.path.abspath(__file__)),
    '..', 'assets', 'js', 'firebase-config.js'
)

TEMPLATE = '''/* Файл: assets/js/firebase-config.js */
/* Конфигурация Firebase — сгенерировано setup_firebase.py */

const firebaseConfig = {{
  apiKey:            "{apiKey}",
  authDomain:        "{authDomain}",
  projectId:         "{projectId}",
  storageBucket:     "{storageBucket}",
  messagingSenderId: "{messagingSenderId}",
  appId:             "{appId}"
}};

let firebaseApp, db, auth;

try {{
  firebaseApp = firebase.initializeApp(firebaseConfig);
  db   = firebase.firestore();
  auth = firebase.auth();
  console.log("✅ Firebase инициализирован");
}} catch (err) {{
  console.warn("⚠️ Firebase не настроен:", err.message);
}}

export {{ db, auth, firebaseApp }};
'''

def ask(prompt, default=''):
    try:
        val = input(f'  {prompt}: ').strip()
        return val if val else default
    except (KeyboardInterrupt, EOFError):
        print('\n\n  Отменено.')
        sys.exit(0)

def main():
    print('\n  🔥 PsychoTest — Настройка Firebase')
    print('  ───────────────────────────────────')
    print('  Откройте https://console.firebase.google.com')
    print('  → Ваш проект → Project Settings → Your apps → Config')
    print('  и скопируйте значения ниже.\n')

    keys = {
        'apiKey':            ask('apiKey'),
        'authDomain':        ask('authDomain'),
        'projectId':         ask('projectId'),
        'storageBucket':     ask('storageBucket'),
        'messagingSenderId': ask('messagingSenderId'),
        'appId':             ask('appId'),
    }

    content = TEMPLATE.format(**keys)

    config_path = os.path.normpath(CONFIG_PATH)
    with open(config_path, 'w', encoding='utf-8') as f:
        f.write(content)

    print(f'\n  ✅ Конфиг сохранён: {config_path}')
    print('  Теперь запустите: python scripts/run_local.py\n')

if __name__ == '__main__':
    main()
