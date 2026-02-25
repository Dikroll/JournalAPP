# Top Academy API — неофициальная прослойка

FastAPI прослойка над `msapi.top-academy.ru/api/v2`.

## Зачем

- upstream JWT токены слишком быстро истекают — наши живут 30 дней
- данные нормализованы: убраны дубли, понятные имена полей
- несколько upstream запросов объединены в один (например `/dashboard/leaderboard`)
- единая точка входа для Capacitor приложения

## Запуск

```bash
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Документация: http://localhost:8000/docs

## Как работает авторизация

```
Клиент → POST /auth/login { username, password }
       ← { access_token }  # наш долгоживущий JWT (30 дней)

Клиент → GET /user/me
         Authorization: Bearer <наш токен>
       ← нормализованный UserInfo
```

Наш JWT хранит username+password в зашифрованном payload.
При каждом запросе прослойка сама управляет upstream токеном — если он протух, перелогинивается тихо.

## Структура проекта

```
app/
├── main.py                  # точка входа
├── core/
│   ├── config.py            # настройки (UPSTREAM_BASE_URL, ключ, SECRET_KEY)
│   └── security.py          # наши JWT утилиты
├── services/
│   └── upstream_client.py   # HTTP клиент с авто-перелогином
├── models/
│   └── schemas.py           # Pydantic модели ответов
└── routers/
    ├── auth.py              # POST /auth/login
    ├── user.py              # GET /user/me
    └── dashboard.py         # GET /dashboard/*
```

## Эндпоинты

| Метод | URL | Описание |
|-------|-----|----------|
| POST | `/auth/login` | Логин, получить наш токен |
| GET | `/user/me` | Инфо о пользователе |
| GET | `/dashboard/counters` | Счётчики уведомлений |
| GET | `/dashboard/homework-counters` | Счётчики ДЗ |
| GET | `/dashboard/leaderboard` | Весь рейтинг за 1 запрос (параллельно 4 upstream) |
| GET | `/dashboard/activity` | История баллов |
| GET | `/dashboard/quizzes` | Доступные тесты |

## .env (опционально)

```env
SECRET_KEY=your-super-secret-key-here
ACCESS_TOKEN_EXPIRE_MINUTES=43200
```
