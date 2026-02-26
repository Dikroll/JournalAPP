# JOURNAL API — Неофициальная документация

**Base URL:** `https://msapi.top-academy.ru/api/v2`

## Аутентификация

Все запросы (кроме публичных эндпоинтов) требуют заголовок:

```
Authorization: Bearer <access_token>
```

Токен получается через `/auth/login`.

---

## Эндпоинты

### `POST /auth/login`

Авторизация пользователя. Возвращает токен доступа и информацию о городе.

**Тело запроса:**

```json
{
	"application_key": "6a56a5df2667e65aab73ce76d1dd737f7d1faef9c52e8b8c55ac75f565d8e8a6",
	"username": "string",
	"password": "string"
}
```

**Ответ:**

```json
{
	"access_token": "string",
	"expires_in_refresh": 2592000,
	"expires_in_access": 86400,
	"user_type": 1,
	"user_role": "student",
	"city_data": {
		"id_city": 1,
		"prefix": "msk_coll",
		"translate_key": "MOSKVA_KOLLEDZH",
		"timezone_name": "Europe/Moscow",
		"country_code": "RU",
		"market_status": 1,
		"name": "Москва колледж"
	}
}
```

> **Примечание:** `application_key` — фиксированная константа, одинаковая для всех клиентов. `id_city` обычно передаётся как `null`.

---

### `GET /public/languages` _(без авторизации)_

Список языков интерфейса.

**Ответ:**

```json
[
	{ "name_mystat": "ru_RU", "short_name": "ru" },
	{ "name_mystat": "en_US", "short_name": "en" },
	{ "name_mystat": "es_MX", "short_name": "es" },
	{ "name_mystat": "tr_TR", "short_name": "tr" }
]
```

---

### `GET /settings/user-info`

Полный профиль текущего студента.

**Ответ:**

```json
{
	"student_id": 83,
	"full_name": "Иванов Иван Иванович",
	"photo": "https://fs.top-academy.ru/api/v1/files/<id>",
	"age": 17,
	"gender": 0,
	"birthday": "2008-10-04",
	"registration_date": "2024-02-01 13:08:21",
	"last_date_visit": "2026-02-22 18:34:08",
	"study_form_short_name": "COLL",
	"level": 9,
	"manual_link": null,

	"current_group_id": 21,
	"current_group_status": 0,
	"group_name": "9/2-РПО-24/1",
	"stream_id": 13,
	"stream_name": "Колледж Осень 2024",
	"achieves_count": 8,

	"groups": [
		{
			"id": 21,
			"name": "9/2-РПО-24/1",
			"group_status": 0,
			"is_primary": true
		}
	],

	"gaming_points": [
		{ "new_gaming_point_types__id": 1, "points": 1883 },
		{ "new_gaming_point_types__id": 2, "points": 3345 }
	],
	"spent_gaming_points": [
		{ "new_gaming_point_types__id": 1, "points": 1073 },
		{ "new_gaming_point_types__id": 2, "points": 1364 }
	],

	"visibility": {
		"is_design": false,
		"is_video_courses": false,
		"is_vacancy": false,
		"is_signal": true,
		"is_promo": false,
		"is_test": false,
		"is_email_verified": true,
		"is_quizzes_expired": false,
		"is_debtor": false,
		"is_phone_verified": true,
		"is_only_profile": false,
		"is_referral_program": false,
		"is_dz_group_issue": true,
		"is_birthday": false,
		"is_school": false,
		"is_news_popup": false,
		"is_school_branch": false,
		"is_college_branch": true,
		"is_higher_education_branch": false,
		"is_russian_branch": true,
		"is_academy_branch": false
	}
}
```

**Важные поля:**

| `Поле`              | Описание                                                                                                                                  |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| gaming_points[id=1] | Алмазы (diamonds)                                                                                                                         |
| gaming_points[id=2] | Монеты (coins)                                                                                                                            |
|                     |
| groups              | Массив групп студента; основная — is_primary: true. Обычно один элемент. group_name и current_group_id дублируют данные из этого массива. |
| visibility          | Флаги доступных разделов интерфейса для данного студента                                                                                  |

---

### `GET /count/page-counters?filter_type=0`

Счётчики уведомлений для навигационных иконок.

**Ответ:**

```json
[
	{ "counter_type": 100, "counter": 3 },
	{ "counter_type": 200, "counter": 0 },
	{ "counter_type": 300, "counter": 0 },
	{ "counter_type": 400, "counter": 198 },
	{ "counter_type": 600, "counter": 0 },
	{ "counter_type": 700, "counter": 0 }
]
```

| `counter_type` | Раздел           |
| -------------- | ---------------- |
| 100            | Домашние задания |
| 200            | Новости          |
| 300            | Отзывы           |
| 400            | Вакансии         |
| 600            | Сигналы          |
| 700            | Профиль          |

> **Примечание:** возвращает массив вместо объекта; порядок элементов не гарантирован — обращайтесь по `counter_type`, а не по индексу.

---

### `GET /count/homework`

Счётчики домашних заданий по статусам.

**Ответ:**

```json
[
	{ "counter_type": 0, "counter": 0 },
	{ "counter_type": 1, "counter": 404 },
	{ "counter_type": 2, "counter": 10 },
	{ "counter_type": 3, "counter": 3 },
	{ "counter_type": 4, "counter": 417 },
	{ "counter_type": 5, "counter": 0 }
]
```

| `counter_type` | Статус               |
| -------------- | -------------------- |
| 0              | Просрочено           |
| 1              | Проверено            |
| 2              | На проверке          |
| 3              | Новые                |
| 4              | Всего                |
| 5              | Возвращено / удалено |

---

### `GET /dashboard/progress/activity`

История начисления игровых баллов. Возвращает **все** записи за всё время без пагинации и фильтрации по дате.

**Ответ:**

```json
[
	{
		"date": "2024-09-04 14:29:45",
		"action": 1,
		"current_point": 1,
		"point_types_id": 1,
		"point_types_name": "DIAMOND",
		"achievements_id": 9,
		"achievements_name": "HOMETASK_INTIME",
		"achievements_type": 1,
		"badge": 0,
		"old_competition": false
	}
]
```

> ⚠️ Весь лог загружается одним запросом. При большом количестве записей объём ответа может быть значительным.

---

### `GET /dashboard/chart/average-progress`

Данные для графика среднего прогресса. Точное назначение не задокументировано.

**Ответ:**

```json
{
	"date": "2025-09-01",
	"points": 5,
	"previous_points": null,
	"has_rasp": null
}
```

---

### `GET /dashboard/progress/leader-group-points`

Позиция текущего студента в рейтинге группы.

**Ответ:**

```json
{
	"totalCount": 22,
	"studentPosition": 7,
	"weekDiff": 0,
	"monthDiff": 0
}
```

---

### `GET /dashboard/progress/leader-stream-points`

Позиция текущего студента в рейтинге потока.

**Ответ:** аналогичен `leader-group-points`.

> **Примечание:** `totalCount` может быть `null`.

---

### `GET /dashboard/progress/leader-group`

Топ студентов группы. Возвращает всех — студентов группы.

**Ответ:**

```json
[
	{
		"id": 82,
		"full_name": "string",
		"photo_path": "https://fs.top-academy.ru/api/v1/files/<id>",
		"position": 1,
		"amount": 6812
	},
	{
		"id": null,
		"full_name": null,
		"photo_path": null,
		"position": 4,
		"amount": null
	}
]
```

> **Примечание:** записи с `id: null` — пустые слоты, обозначающие разрыв между топом и окружением текущего студента. Обрабатывайте их отдельно.

---

### `GET /dashboard/progress/leader-stream`

Аналог `leader-group`, но для потока.

Топ студентов всего потока. Возвращает не всех — только лидеров и студентов, ближайших к текущему пользователю в рейтинге.

**Ответ:**

```json
[
	{
		"id": 82,
		"full_name": "string",
		"photo_path": "https://fs.top-academy.ru/api/v1/files/<id>",
		"position": 1,
		"amount": 6812
	},
	{
		"id": null,
		"full_name": null,
		"photo_path": null,
		"position": 4,
		"amount": null
	}
]
```

---

### `GET /dashboard/info/future-exams`

Предстоящие экзамены.

**Ответ:**

```json
[
	{
		"spec": "Основы программирования на языке C++",
		"date": "2026-03-12"
	}
]
```

---

### `GET /feedback/students/evaluate-lesson-list`

Список занятий, ожидающих оценки от студента. Структура ответа не задокументирована.

---

### `GET /library/operations/list`

Список учебных материалов.

**Параметры запроса:**

| Параметр           | Тип | Описание                                 |
| ------------------ | --- | ---------------------------------------- |
| `material_type`    | int | Тип материала (ID)                       |
| `recommended_type` | int | Фильтр по рекомендованности (обычно `0`) |

**Пример:** `/library/operations/list?material_type=7&recommended_type=0`

**Ответ:**

```json
[
	{
		"material_id": 1030155,
		"quiz_id": 2375,
		"theme": "8. Циклы, использование отладчика.",
		"material_type": 7,
		"type_id": 1,
		"category_id": 1044,
		"id_spec": 67,
		"name_spec": null,
		"author_id": 106,
		"author": null,

		"questions_count": 10,
		"time_limit": 2400,
		"retake_time": 3600,
		"retries_number": 5,
		"retries_number_end": 0,
		"coins_count": null,

		"last_mark": null,
		"passed_at": null,
		"is_new_material": true,

		"current_week": 13,
		"public_week": 11,
		"date": "2026-02-02",
		"sort_date": 1769979600
	}
]
```

**Описание полей:**

| Поле             | Описание                                        |
| ---------------- | ----------------------------------------------- |
| `time_limit`     | Лимит времени в секундах (2400 = 40 минут)      |
| `retake_time`    | Cooldown между попытками в секундах             |
| `retries_number` | Доступное количество попыток                    |
| `last_mark`      | Последняя оценка; `null` — тест ещё не сдавался |
| `passed_at`      | Дата последней сдачи; `null` — не сдавался      |
| `current_week`   | Текущая неделя курса                            |
| `public_week`    | Неделя, когда материал был опубликован          |
| `sort_date`      | Unix timestamp для сортировки                   |
