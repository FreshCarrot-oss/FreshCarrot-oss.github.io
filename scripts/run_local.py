#!/usr/bin/env python3
# Файл: scripts/run_local.py
# Локальный dev-сервер для PsychoTest

import http.server
import socketserver
import webbrowser
import os
import sys
import threading
import time

PORT = 8080

class CORSRequestHandler(http.server.SimpleHTTPRequestHandler):
    """HTTP-обработчик с CORS-заголовками и поддержкой SPA-роутинга."""

    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', '*')
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

    def log_message(self, format, *args):
        # Подавляем стандартный вывод, заменяем на более чистый
        print(f'  [{self.log_date_time_string()}] {args[0]} {args[1]}')


def open_browser(port):
    """Открыть браузер через 1 секунду после запуска сервера."""
    time.sleep(1.0)
    url = f'http://localhost:{port}'
    print(f'\n  🌐 Открываем: {url}\n')
    webbrowser.open(url)


def main():
    # Переходим в корневую директорию проекта
    script_dir = os.path.dirname(os.path.abspath(__file__))
    root_dir   = os.path.dirname(script_dir)
    os.chdir(root_dir)

    print(f'\n  🧠 PsychoTest — Локальный сервер')
    print(f'  ─────────────────────────────────')
    print(f'  📁 Директория: {root_dir}')
    print(f'  🚀 Запуск на порту {PORT}...')
    print(f'  🔗 URL: http://localhost:{PORT}')
    print(f'  ⏹  Остановить: Ctrl+C\n')

    # Запускаем браузер в отдельном потоке
    threading.Thread(target=open_browser, args=(PORT,), daemon=True).start()

    try:
        with socketserver.TCPServer(('', PORT), CORSRequestHandler) as httpd:
            httpd.serve_forever()
    except KeyboardInterrupt:
        print('\n\n  ✅ Сервер остановлен\n')
        sys.exit(0)
    except OSError as e:
        if 'Address already in use' in str(e):
            print(f'\n  ❌ Порт {PORT} уже занят. Попробуйте другой порт или закройте другой сервер.\n')
        else:
            raise


if __name__ == '__main__':
    main()
