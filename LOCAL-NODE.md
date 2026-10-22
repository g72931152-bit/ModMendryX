# Локальный узел для крупных файлов

Схема: Render принимает файлы до `MODMENDRYX_MAX_UPLOAD_MB` и не больше `MODMENDRYX_INFLIGHT_UPLOAD_MB` суммарно одновременно. Всё, что не помещается, браузер отправляет напрямую на ваш ПК. Ссылку на ПК Render узнаёт сам: узел раз в 30 секунд присылает свой https-адрес (heartbeat), Render отдаёт его в `/api/health` на 90 секунд. Если ПК выключен, адрес пропадает, и сайт честно сообщает, что узел недоступен.

## Render
Задайте секрет `MODMENDRYX_NODE_TOKEN` (длинная случайная строка). Остальные значения уже в `render.yaml`.

## Локальный ПК
```
pip install -r app/requirements.txt
set MODMENDRYX_ROLE=local
set MODMENDRYX_CORS_ORIGINS=https://modmendryx.pages.dev
set MODMENDRYX_NODE_TOKEN=<тот же секрет>
set MODMENDRYX_REGISTER_URL=https://modmendryx-api.onrender.com
set MODMENDRYX_PUBLIC_NODE_URL=https://<адрес туннеля>
uvicorn app.main:app --host 127.0.0.1 --port 8000
cloudflared tunnel --url http://127.0.0.1:8000
```
(Linux/macOS: `export` вместо `set`.) Адрес из вывода `cloudflared` подставьте в `MODMENDRYX_PUBLIC_NODE_URL`. Только `https://` без пути.

## Лимиты по узлам
| Переменная | Render | Локальный |
|---|---|---|
| `MODMENDRYX_ROLE` | render | local |
| `MODMENDRYX_MAX_UPLOAD_MB` | 150 | 2048 |
| `MODMENDRYX_INFLIGHT_UPLOAD_MB` | 200 | 2048 |
| `MODMENDRYX_MAX_ACTIVE_JOBS` | 3 | 8 |
| `MODMENDRYX_MAX_UNPACKED_MB` | 1536 | 4096 |

Перед приёмом файла сервер проверяет `Content-Length`, свободное место (нужно не меньше двойного размера: Starlette сначала пишет тело во временный файл, затем задача копирует его в рабочую папку) и бюджет одновременных загрузок. При отказе возвращаются 413, 429 или 507, а не падение процесса.

Результат крупного файла скачивается с вашего ПК: пока он выключен, результат недоступен.
